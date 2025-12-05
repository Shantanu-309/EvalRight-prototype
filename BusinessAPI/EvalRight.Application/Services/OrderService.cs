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

    public OrderService(IEvalRightDbContext context)
    {
        _context = context;
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
}

