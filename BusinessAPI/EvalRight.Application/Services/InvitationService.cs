using System;
using System.Linq;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Order;
using EvalRight.Application.DTOs.Invitation;
using EvalRight.Application.Interfaces;
using EvalRight.Domain.Entities;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EvalRight.Application.Services;

public class InvitationService : IInvitationService
{
    private readonly IEvalRightDbContext _context;
    private readonly IEmailService _emailService;
    private readonly string _baseUrl;

    public InvitationService(IEvalRightDbContext context, IEmailService emailService, Microsoft.Extensions.Configuration.IConfiguration configuration)
    {
        _context = context;
        _emailService = emailService;
        _baseUrl = configuration["FrontendBaseUrl"] ?? "http://localhost:5173";
    }

    public async Task<InvitationOrderResponse> CreateInvitationOrderAsync(InvitationOrderRequest request, long clientId, long initiatedByAccountId)
    {
        try
        {
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
                    return new InvitationOrderResponse
                    {
                        Success = false,
                        Message = "Package not found"
                    };
                }
            }

            // Get Client name for email
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == clientId);
            var clientName = client?.Name ?? "Your Company";

            // Find or Create Candidate (minimal info, will be completed when they accept invitation)
            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.ClientId == clientId && c.Email == request.CandidateEmail);

            if (candidate == null)
            {
                // Extract name from email as placeholder
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

            // Generate secure, unique token
            var invitationToken = Guid.NewGuid().ToString("N") + "-" + Guid.NewGuid().ToString("N");

            // Set expiration (24-72 hours in future, default 48 hours)
            DateTimeOffset expiresAt;
            if (request.ExpiresAt.HasValue)
            {
                var requestedExpiration = request.ExpiresAt.Value;
                var hoursFromNow = (int)(requestedExpiration - DateTimeOffset.UtcNow).TotalHours;
                // Clamp between 24 and 72 hours
                var clampedHours = Math.Max(24, Math.Min(72, hoursFromNow));
                expiresAt = DateTimeOffset.UtcNow.AddHours(clampedHours);
            }
            else
            {
                // Default to 48 hours
                expiresAt = DateTimeOffset.UtcNow.AddHours(48);
            }

            // Create Invitation
            var invitation = new CandidateInvitation
            {
                ClientId = clientId,
                CandidateId = candidate.Id,
                InvitedEmail = request.CandidateEmail,
                InvitationToken = invitationToken,
                ExpiresAt = expiresAt,
                Status = "pending", // INVITED status
                SentAt = DateTimeOffset.UtcNow
            };
            _context.CandidateInvitations.Add(invitation);
            await _context.SaveChangesAsync();

            // Generate invitation link with both invitationId and token
            var invitationLink = $"{_baseUrl}/candidate/portal?invitationId={invitation.Id}&token={invitationToken}";

            // Send email to candidate - this MUST succeed or return error
            await _emailService.SendInvitationEmailAsync(
                request.CandidateEmail,
                clientName,
                invitationLink,
                expiresAt
            );

            return new InvitationOrderResponse
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
            return new InvitationOrderResponse
            {
                Success = false,
                Message = $"Error creating invitation: {ex.Message}"
            };
        }
    }

    public async Task<bool> CompleteInvitationAsync(string invitationToken)
    {
        try
        {
            var invitation = await _context.CandidateInvitations
                .Include(i => i.Candidate)
                .FirstOrDefaultAsync(i => i.InvitationToken == invitationToken);

            if (invitation == null)
            {
                return false;
            }

            // Check if already completed
            if (invitation.Status == "accepted" || invitation.AcceptedAt.HasValue)
            {
                return false;
            }

            // Check if expired
            if (invitation.ExpiresAt < DateTimeOffset.UtcNow)
            {
                invitation.Status = "expired";
                await _context.SaveChangesAsync();
                return false;
            }

            // Mark invitation as completed
            invitation.Status = "accepted";
            invitation.AcceptedAt = DateTimeOffset.UtcNow;

            // Create order with status = InProgress (PROCESSING)
            if (invitation.BgvOrderId == null && invitation.Candidate != null)
            {
                // Get package from invitation context (we need to store this or get from client settings)
                // For now, we'll need to get the package from the invitation or use a default
                // This is a simplified version - in production, you'd store packageId with invitation
                var package = await _context.BgvPackages
                    .Where(p => p.IsPublic && p.Status == "active")
                    .FirstOrDefaultAsync();

                if (package != null)
                {
                    var order = new BgvOrder
                    {
                        ClientId = invitation.ClientId,
                        CandidateId = invitation.CandidateId,
                        PackageId = package.Id,
                        OrderType = "INVITE", // Source indicator
                        OverallStatus = BgvOrderStatus.InProgress, // PROCESSING status
                        BgvRegion = package.RegionScope
                    };
                    _context.BgvOrders.Add(order);
                    await _context.SaveChangesAsync();

                    invitation.BgvOrderId = order.Id;

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
                }
            }

            await _context.SaveChangesAsync();

            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<SendInvitationResponse> SendInvitationAsync(SendInvitationRequest request, long clientId, long initiatedByAccountId)
    {
        try
        {
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

            // Validate Package - find by ID first, then by code if it's a default package
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
                    return new SendInvitationResponse
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
                .FirstOrDefaultAsync(c => c.ClientId == clientId && c.Email == request.CandidateEmail);

            if (candidate == null)
            {
                // Extract name from email as placeholder
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

            // Generate secure, unique token
            var invitationToken = Guid.NewGuid().ToString("N") + "-" + Guid.NewGuid().ToString("N");

            // Set expiration (24-72 hours, default 48 hours)
            var expiresAt = DateTimeOffset.UtcNow.AddHours(48);

            // Create Invitation
            var invitation = new CandidateInvitation
            {
                ClientId = clientId,
                CandidateId = candidate.Id,
                InvitedEmail = request.CandidateEmail,
                InvitationToken = invitationToken,
                ExpiresAt = expiresAt,
                Status = "pending",
                SentAt = DateTimeOffset.UtcNow
            };
            _context.CandidateInvitations.Add(invitation);
            await _context.SaveChangesAsync();

            // Generate invitation link with both invitationId and token
            var invitationLink = $"{_baseUrl}/candidate/portal?invitationId={invitation.Id}&token={invitationToken}";

            // Send email to candidate - this MUST succeed or return error
            await _emailService.SendInvitationEmailAsync(
                request.CandidateEmail,
                clientName,
                invitationLink,
                expiresAt
            );

            return new SendInvitationResponse
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
            return new SendInvitationResponse
            {
                Success = false,
                Message = $"Error sending invitation: {ex.Message}"
            };
        }
    }

    public async Task<ValidateInvitationResponse> ValidateInvitationTokenAsync(long? invitationId, string token)
    {
        try
        {
            // Log validation attempt
            Console.WriteLine($"[InvitationValidation] Starting validation - InvitationId: {invitationId}, Token: {token?.Substring(0, Math.Min(8, token?.Length ?? 0))}...");

            CandidateInvitation? invitation = null;

            // If invitationId is provided, use it for lookup (more efficient)
            if (invitationId.HasValue && invitationId.Value > 0)
            {
                invitation = await _context.CandidateInvitations
                    .Include(i => i.Candidate)
                    .FirstOrDefaultAsync(i => i.Id == invitationId.Value);

                Console.WriteLine($"[InvitationValidation] Lookup by InvitationId {invitationId}: {(invitation != null ? "Found" : "Not Found")}");

                if (invitation == null)
                {
                    return new ValidateInvitationResponse
                    {
                        Valid = false,
                        ErrorCode = "NOT_FOUND",
                        Message = "Invitation not found."
                    };
                }

                // Verify token matches exactly
                Console.WriteLine($"[InvitationValidation] Token comparison - Expected: {invitation.InvitationToken?.Substring(0, Math.Min(8, invitation.InvitationToken?.Length ?? 0))}..., Provided: {token?.Substring(0, Math.Min(8, token?.Length ?? 0))}...");
                
                if (!string.Equals(invitation.InvitationToken, token, StringComparison.Ordinal))
                {
                    Console.WriteLine($"[InvitationValidation] Token mismatch for InvitationId {invitationId}");
                    return new ValidateInvitationResponse
                    {
                        Valid = false,
                        ErrorCode = "TOKEN_MISMATCH",
                        Message = "Invalid invitation token."
                    };
                }
            }
            else
            {
                // Fallback to token-only lookup (for backward compatibility)
                invitation = await _context.CandidateInvitations
                    .Include(i => i.Candidate)
                    .FirstOrDefaultAsync(i => i.InvitationToken == token);

                Console.WriteLine($"[InvitationValidation] Lookup by Token only: {(invitation != null ? "Found" : "Not Found")}");

                if (invitation == null)
                {
                    return new ValidateInvitationResponse
                    {
                        Valid = false,
                        ErrorCode = "NOT_FOUND",
                        Message = "Invitation not found."
                    };
                }
            }

            // Check expiration
            var now = DateTimeOffset.UtcNow;
            Console.WriteLine($"[InvitationValidation] Expiry check - ExpiresAt: {invitation.ExpiresAt:O}, Now: {now:O}, Expired: {invitation.ExpiresAt < now}");

            if (invitation.ExpiresAt < now)
            {
                // Don't update status here - only mark as used on final submission
                Console.WriteLine($"[InvitationValidation] Invitation {invitation.Id} is expired");
                return new ValidateInvitationResponse
                {
                    Valid = false,
                    ErrorCode = "EXPIRED",
                    Message = "This invitation link has expired."
                };
            }

            // Check if cancelled
            if (invitation.Status == "cancelled")
            {
                Console.WriteLine($"[InvitationValidation] Invitation {invitation.Id} is cancelled");
                return new ValidateInvitationResponse
                {
                    Valid = false,
                    ErrorCode = "CANCELLED",
                    Message = "This invitation has been cancelled."
                };
            }

            // Check if already used (DO NOT mark as used here - only on final submission)
            if (invitation.Status == "accepted" || invitation.AcceptedAt.HasValue)
            {
                Console.WriteLine($"[InvitationValidation] Invitation {invitation.Id} is already used");
                return new ValidateInvitationResponse
                {
                    Valid = false,
                    ErrorCode = "ALREADY_USED",
                    Message = "This invitation link has already been used."
                };
            }

            // Get PackageId from order if available
            long? packageId = null;
            if (invitation.BgvOrderId.HasValue)
            {
                var order = await _context.BgvOrders
                    .FirstOrDefaultAsync(o => o.Id == invitation.BgvOrderId.Value);
                if (order != null)
                {
                    packageId = order.PackageId;
                }
            }

            var candidateEmail = invitation.Candidate?.Email ?? invitation.InvitedEmail;

            Console.WriteLine($"[InvitationValidation] Invitation {invitation.Id} is VALID");

            return new ValidateInvitationResponse
            {
                Valid = true,
                CandidateEmail = candidateEmail,
                PackageId = packageId,
                Message = "Token is valid"
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[InvitationValidation] Exception: {ex.Message}");
            Console.WriteLine($"[InvitationValidation] StackTrace: {ex.StackTrace}");
            return new ValidateInvitationResponse
            {
                Valid = false,
                ErrorCode = "ERROR",
                Message = "An error occurred while validating the invitation."
            };
        }
    }
}


