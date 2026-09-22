using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Order;
using EvalRight.Application.Interfaces;
using EvalRight.Domain.Entities;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EvalRight.Application.Services;

public class OrderService : IOrderService
{
    private readonly IEvalRightDbContext _context;
    private readonly IEmailService _emailService;
    private readonly string _baseUrl;

    public OrderService(IEvalRightDbContext context, IEmailService emailService, Microsoft.Extensions.Configuration.IConfiguration configuration)
    {
        _context = context;
        _emailService = emailService;
        _baseUrl = configuration["FrontendBaseUrl"] ?? "http://localhost:5173";
    }

    public async Task<OrderDetailDto> CreateOrderAsync(CreateOrderRequest request, long initiatedByAccountId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Validate Package
            var package = await _context.BgvPackages
                .Include(p => p.PackageComponents)
                .ThenInclude(pc => pc.Component)
                .FirstOrDefaultAsync(p => p.Id == request.PackageId);

            if (package == null) throw new Exception("Package not found");

            // 2. Find or Create Candidate
            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.ClientId == request.ClientId && c.Email == request.CandidateEmail);

            if (candidate == null)
            {
                candidate = new Candidate
                {
                    ClientId = request.ClientId,
                    FirstName = request.CandidateFirstName,
                    MiddleName = request.CandidateMiddleName,
                    LastName = request.CandidateLastName,
                    Email = request.CandidateEmail,
                    Phone = request.CandidatePhone,
                    Status = CandidateStatus.Invited // Default
                };
                _context.Candidates.Add(candidate);
                await _context.SaveChangesAsync();
            }

            // 3. Create Order
            var order = new BgvOrder
            {
                ClientId = request.ClientId,
                CandidateId = candidate.Id,
                InitiatedByAccountId = initiatedByAccountId,
                PackageId = package.Id,
                OrderType = request.OrderType,
                OverallStatus = BgvOrderStatus.Draft,
                BgvRegion = package.RegionScope // Assuming package scope implies order region for now
            };
            
            _context.BgvOrders.Add(order);
            await _context.SaveChangesAsync();

            // 4. Create Order Components
            foreach (var pc in package.PackageComponents)
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

            // 5. Handle Invitation if needed
            if (request.OrderType == "with_invitation")
            {
                var invitation = new CandidateInvitation
                {
                    ClientId = request.ClientId,
                    CandidateId = candidate.Id,
                    BgvOrderId = order.Id,
                    InvitedEmail = request.CandidateEmail,
                    InvitationToken = Guid.NewGuid().ToString(),
                    ExpiresAt = DateTimeOffset.UtcNow.AddDays(7),
                    Status = "pending",
                    SentAt = DateTimeOffset.UtcNow
                };
                _context.CandidateInvitations.Add(invitation);
                order.OverallStatus = BgvOrderStatus.AwaitingCandidate;
                
                // In real app, send email here via IEmailService
            }
            else
            {
                // Direct order
                order.OverallStatus = BgvOrderStatus.Draft; // Or pending data entry
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return await GetOrderByIdAsync(order.Id) ?? throw new Exception("Failed to retrieve created order");
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderDetailDto?> GetOrderByIdAsync(long id)
    {
        var order = await _context.BgvOrders
            .Include(o => o.Candidate)
            .Include(o => o.Package)
            .Include(o => o.Components)
            .ThenInclude(oc => oc.Component)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return null;

        return new OrderDetailDto
        {
            Id = order.Id,
            OverallStatus = order.OverallStatus.ToString(),
            CandidateName = $"{order.Candidate?.FirstName} {order.Candidate?.LastName}",
            PackageName = order.Package?.Name ?? "Unknown",
            CreatedAt = order.CreatedAt,
            Components = order.Components.Select(c => new OrderComponentDto
            {
                ComponentName = c.Component.Name,
                Status = c.Status.ToString()
            }).ToList()
        };
    }

    public async Task<List<OrderDto>> GetOrdersByClientIdAsync(long clientId)
    {
        return await _context.BgvOrders
            .Where(o => o.ClientId == clientId)
            .Include(o => o.Candidate)
            .Include(o => o.Package)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                OverallStatus = o.OverallStatus.ToString(),
                CandidateName = $"{o.Candidate.FirstName} {o.Candidate.LastName}",
                PackageName = o.Package.Name,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<ManualOrderResponse> CreateManualOrderAsync(ManualOrderRequest request, long clientId, long initiatedByAccountId)
    {
        try
        {
            // Validate Package - find by ID first, then by code if it's a default package
            var package = await _context.BgvPackages
                .Include(p => p.PackageComponents)
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
                        .Include(p => p.PackageComponents)
                        .FirstOrDefaultAsync(p => p.Code == defaultPackageCodes[request.PackageId]);
                }

                if (package == null)
                {
                    return new ManualOrderResponse
                    {
                        Success = false,
                        Message = "Package not found"
                    };
                }
            }

            // Get Client name for email
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == clientId);
            var clientName = client?.Name ?? "Your Company";

            // Find or Create Candidate
            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.ClientId == clientId && c.Email == request.Email);

            if (candidate == null)
            {
                candidate = new Candidate
                {
                    ClientId = clientId,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    Status = CandidateStatus.Invited
                };
                _context.Candidates.Add(candidate);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Update candidate info if needed
                candidate.FirstName = request.FirstName;
                candidate.LastName = request.LastName;
                await _context.SaveChangesAsync();
            }

            // Create Order with status = InProgress (PROCESSING) and source = MANUAL
            var order = new BgvOrder
            {
                ClientId = clientId,
                CandidateId = candidate.Id,
                InitiatedByAccountId = initiatedByAccountId,
                PackageId = package.Id,
                OrderType = "MANUAL", // Source indicator
                OverallStatus = BgvOrderStatus.InProgress, // PROCESSING status
                BgvRegion = package.RegionScope
            };
            
            _context.BgvOrders.Add(order);
            await _context.SaveChangesAsync();

            // Create Order Components
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

            await _context.SaveChangesAsync();

            // Send invitation email to candidate (unified invitation flow)
            try
            {
                // Expire any existing active invitations for this email (allow resends)
                var activeInvitations = await _context.CandidateInvitations
                    .Where(i => i.ClientId == clientId && 
                               i.InvitedEmail == request.Email && 
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

                // Generate secure token for invitation
                var invitationToken = Guid.NewGuid().ToString("N") + "-" + Guid.NewGuid().ToString("N");
                // Set expiration (24-72 hours, default 48 hours)
                var expiresAt = DateTimeOffset.UtcNow.AddHours(48);

                // Create invitation record
                var invitation = new CandidateInvitation
                {
                    ClientId = clientId,
                    CandidateId = candidate.Id,
                    BgvOrderId = order.Id,
                    InvitedEmail = request.Email,
                    InvitationToken = invitationToken,
                    ExpiresAt = expiresAt,
                    Status = "pending",
                    SentAt = DateTimeOffset.UtcNow
                };
                _context.CandidateInvitations.Add(invitation);
                await _context.SaveChangesAsync();

                // Generate invitation link with both invitationId and token
                var invitationLink = $"{_baseUrl}/candidate/portal?invitationId={invitation.Id}&token={invitationToken}";

                // Send invitation email - this MUST succeed or return error
                await _emailService.SendInvitationEmailAsync(
                    request.Email,
                    clientName,
                    invitationLink,
                    expiresAt
                );
            }
            catch (Exception ex)
            {
                // Email failure should be propagated - don't silently fail
                throw new Exception($"Order created but failed to send invitation email: {ex.Message}", ex);
            }

            return new ManualOrderResponse
            {
                Success = true,
                Message = "Order created and candidate notified successfully",
                OrderId = order.Id,
                CandidateId = candidate.Id
            };
        }
        catch (Exception ex)
        {
            return new ManualOrderResponse
            {
                Success = false,
                Message = $"Error creating order: {ex.Message}"
            };
        }
    }
}

