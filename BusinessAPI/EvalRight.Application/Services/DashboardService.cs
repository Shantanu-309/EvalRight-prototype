using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Dashboard;
using EvalRight.Application.Interfaces;
using EvalRight.Domain.Entities;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace EvalRight.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IEvalRightDbContext _context;
    private readonly IEmailService _emailService;
    private readonly string _frontendBaseUrl;

    public DashboardService(IEvalRightDbContext context, IEmailService emailService, IConfiguration configuration)
    {
        _context = context;
        _emailService = emailService;
        _frontendBaseUrl = configuration["FrontendBaseUrl"] ?? "http://localhost:5173";
    }

    public async Task<DashboardCountsResponse> GetDashboardCountsAsync(long clientId)
    {
        var now = DateTimeOffset.UtcNow;

        // Completed Orders: Clear or Closed status
        var completedOrders = await _context.BgvOrders
            .Where(o => o.ClientId == clientId && 
                       (o.OverallStatus == BgvOrderStatus.Clear || o.OverallStatus == BgvOrderStatus.Closed))
            .CountAsync();

        // Pending Orders: InProgress, AwaitingDocuments, QueuedForVendor
        var pendingOrders = await _context.BgvOrders
            .Where(o => o.ClientId == clientId && 
                       (o.OverallStatus == BgvOrderStatus.InProgress ||
                        o.OverallStatus == BgvOrderStatus.AwaitingDocuments ||
                        o.OverallStatus == BgvOrderStatus.QueuedForVendor))
            .CountAsync();

        // Draft Orders
        var draftOrders = await _context.BgvOrders
            .Where(o => o.ClientId == clientId && o.OverallStatus == BgvOrderStatus.Draft)
            .CountAsync();

        // Active Invitations: status = "pending" and not expired
        var activeInvitations = await _context.CandidateInvitations
            .Where(i => i.ClientId == clientId && 
                       i.Status == "pending" && 
                       i.ExpiresAt > now)
            .CountAsync();

        return new DashboardCountsResponse
        {
            CompletedOrders = completedOrders,
            PendingOrders = pendingOrders,
            DraftOrders = draftOrders,
            ActiveInvitations = activeInvitations
        };
    }

    public async Task<RapidInvitationResponse> SendRapidInvitationAsync(
        RapidInvitationRequest request, 
        long clientId, 
        long initiatedByAccountId)
    {
        try
        {
            // Validate package exists - find by ID first, then by code if it's a default package
            var package = await _context.BgvPackages
                .FirstOrDefaultAsync(p => p.Id == request.PackageId);

            if (package == null)
            {
                // Try to find by code for default packages
                var defaultPackageCodes = new Dictionary<long, string>
                {
                    { 1, "BASIC_CRIMINAL" },
                    { 2, "STANDARD" },
                    { 3, "PREMIUM" },
                    { 4, "EMP_EDU" }
                };

                if (defaultPackageCodes.ContainsKey(request.PackageId))
                {
                    package = await _context.BgvPackages
                        .FirstOrDefaultAsync(p => p.Code == defaultPackageCodes[request.PackageId]);
                }

                if (package == null)
                {
                    return new RapidInvitationResponse
                    {
                        Success = false,
                        Message = "Package not found"
                    };
                }
            }

            // Expire any existing active invitations for this email (allow resends)
            var activeInvitations = await _context.CandidateInvitations
                .Where(i => i.ClientId == clientId && 
                           i.InvitedEmail == request.CandidateEmail && 
                           i.Status == "pending" &&
                           i.ExpiresAt > DateTimeOffset.UtcNow)
                .ToListAsync();

            foreach (var invite in activeInvitations)
            {
                invite.Status = "expired";
            }

            if (activeInvitations.Any())
            {
                await _context.SaveChangesAsync();
            }

            // Find or create candidate
            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.ClientId == clientId && c.Email == request.CandidateEmail);

            if (candidate == null)
            {
                // Extract name from email (basic approach)
                var emailParts = request.CandidateEmail.Split('@')[0].Split('.');
                var firstName = emailParts.Length > 0 ? emailParts[0] : "Candidate";
                var lastName = emailParts.Length > 1 ? emailParts[1] : "User";

                candidate = new Candidate
                {
                    ClientId = clientId,
                    FirstName = firstName,
                    LastName = lastName,
                    Email = request.CandidateEmail,
                    Status = CandidateStatus.Invited
                };
                _context.Candidates.Add(candidate);
                await _context.SaveChangesAsync();
            }

            // Create draft order
            var order = new BgvOrder
            {
                ClientId = clientId,
                CandidateId = candidate.Id,
                InitiatedByAccountId = initiatedByAccountId,
                PackageId = package.Id,
                OrderType = "with_invitation",
                OverallStatus = BgvOrderStatus.AwaitingCandidate,
                BgvRegion = package.RegionScope
            };
            _context.BgvOrders.Add(order);
            await _context.SaveChangesAsync();

            // Create order components
            var packageComponents = await _context.BgvPackageComponents
                .Where(pc => pc.PackageId == package.Id)
                .ToListAsync();

            foreach (var pc in packageComponents)
            {
                for (int i = 0; i < pc.DefaultQuantity; i++)
                {
                    var orderComponent = new BgvOrderComponent
                    {
                        BgvOrderId = order.Id,
                        ComponentId = pc.ComponentId,
                        InstanceIndex = i,
                        Status = ComponentStatus.NotStarted
                    };
                    _context.BgvOrderComponents.Add(orderComponent);
                }
            }

            // Generate secure token
            var invitationToken = Guid.NewGuid().ToString("N") + "-" + Guid.NewGuid().ToString("N");

            // Create invitation
            var invitation = new CandidateInvitation
            {
                ClientId = clientId,
                CandidateId = candidate.Id,
                BgvOrderId = order.Id,
                InvitedEmail = request.CandidateEmail,
                InvitationToken = invitationToken,
                ExpiresAt = DateTimeOffset.UtcNow.AddHours(48), // 24-72 hours, default 48
                Status = "pending",
                SentAt = DateTimeOffset.UtcNow
            };
            _context.CandidateInvitations.Add(invitation);
            await _context.SaveChangesAsync();

            // Generate invitation link with both invitationId and token
            var invitationLink = $"{_frontendBaseUrl}/candidate/portal?invitationId={invitation.Id}&token={invitationToken}";

            // Get Client name for email
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == clientId);
            var clientName = client?.Name ?? "Your Company";

            // Send email to candidate - this MUST succeed or return error
            await _emailService.SendInvitationEmailAsync(
                request.CandidateEmail,
                clientName,
                invitationLink,
                invitation.ExpiresAt
            );

            return new RapidInvitationResponse
            {
                Success = true,
                Message = "Invitation sent successfully",
                InvitationId = invitation.Id,
                InvitationToken = invitationToken,
                InvitationLink = invitationLink
            };
        }
        catch (Exception ex)
        {
            return new RapidInvitationResponse
            {
                Success = false,
                Message = $"Error sending invitation: {ex.Message}"
            };
        }
    }
}


