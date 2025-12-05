using System;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Integration;
using EvalRight.Application.Interfaces;
using EvalRight.Domain.Entities;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace EvalRight.Application.Services;

public class VendorService : IVendorService
{
    private readonly IEvalRightDbContext _context;
    private readonly IIdaClient _idaClient;
    private readonly IConfiguration _configuration;

    public VendorService(IEvalRightDbContext context, IIdaClient idaClient, IConfiguration configuration)
    {
        _context = context;
        _idaClient = idaClient;
        _configuration = configuration;
    }

    public async Task InitiateVendorCheckAsync(long orderId)
    {
        var order = await _context.BgvOrders
            .Include(o => o.Candidate)
            .Include(o => o.Package)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null) throw new Exception("Order not found");

        // Story 68: Check Document Requirements
        var pendingDocs = await _context.CandidateDocumentRequirements
            .AnyAsync(r => r.BgvOrderId == orderId && r.Status == "pending"); // pending, partially_fulfilled? "pending" covers both if we use strict enum or string check

        if (pendingDocs)
        {
            throw new Exception("Cannot initiate vendor check: Mandatory documents are pending.");
        }

        var callbackUrl = _configuration["IdaSettings:CallbackUrl"];

        // Map Domain to DTO
        var request = new IdaCreateCaseRequest
        {
            ClientReferenceId = order.Id.ToString(),
            PackageId = order.Package.Code,
            CallbackUrl = callbackUrl ?? "http://localhost:5000/api/webhooks/ida",
            Candidate = new IdaCandidateInfo
            {
                FirstName = order.Candidate.FirstName,
                LastName = order.Candidate.LastName,
                Email = order.Candidate.Email,
                Phone = order.Candidate.Phone ?? ""
            }
        };

        // Call IDA
        var caseRef = await _idaClient.CreateCaseAsync(request);

        var idaCase = new IdaCase
        {
            BgvOrderId = order.Id,
            IdaCaseReference = caseRef,
            OverallStatus = "Initiated",
            LastWebhookAt = DateTimeOffset.UtcNow
        };
        
        _context.IdaCases.Add(idaCase);
        
        order.OverallStatus = BgvOrderStatus.InProgress;
        
        await _context.SaveChangesAsync();
    }

    public async Task CheckVendorStatusAsync(long orderId)
    {
        var idaCase = await _context.IdaCases
            .FirstOrDefaultAsync(c => c.BgvOrderId == orderId);

        if (idaCase == null) return;

        var status = await _idaClient.GetCaseStatusAsync(idaCase.IdaCaseReference!);
        await UpdateCaseStatus(idaCase, status);
    }

    public async Task HandleWebhookAsync(string caseReference, string eventType, string payloadJson)
    {
        var idaCase = await _context.IdaCases
            .Include(c => c.BgvOrder)
            .FirstOrDefaultAsync(c => c.IdaCaseReference == caseReference);

        if (idaCase == null)
        {
            // Log warning: Received webhook for unknown case
            return;
        }

        idaCase.LastWebhookAt = DateTimeOffset.UtcNow;
        idaCase.RawLastPayload = payloadJson;

        // Parse status from payload if possible, or fetch fresh status
        // For now, let's assume we fetch fresh status to be safe/consistent
        var status = await _idaClient.GetCaseStatusAsync(caseReference);
        
        await UpdateCaseStatus(idaCase, status);
    }

    private async Task UpdateCaseStatus(IdaCase idaCase, string status)
    {
        idaCase.OverallStatus = status;

        if (status == "Completed" || status == "Clear" || status == "Adverse")
        {
            var reportJson = await _idaClient.GetCaseReportAsync(idaCase.IdaCaseReference!);
            idaCase.RawLastPayload = reportJson;

            // Map IDA status to Domain Status
            var orderStatus = status == "Clear" ? BgvOrderStatus.Clear :
                              status == "Adverse" ? BgvOrderStatus.Adverse :
                              BgvOrderStatus.InProgress; 

             // Simple mapping logic
            if (status.Contains("Clear", StringComparison.OrdinalIgnoreCase)) orderStatus = BgvOrderStatus.Clear;
            else if (status.Contains("Adverse", StringComparison.OrdinalIgnoreCase)) orderStatus = BgvOrderStatus.Adverse;
            
            // Update Order
            var order = await _context.BgvOrders.FindAsync(idaCase.BgvOrderId);
            if (order != null)
            {
                order.OverallStatus = orderStatus;
                if (orderStatus == BgvOrderStatus.Clear || orderStatus == BgvOrderStatus.Adverse)
                {
                    order.CompletedAt = DateTimeOffset.UtcNow;
                }
            }
        }
        else if (status == "Insufficient")
        {
            // Story 47/63: Handle Insufficiency
            // 1. Log event
            var order = await _context.BgvOrders.FindAsync(idaCase.BgvOrderId);
            if (order != null)
            {
                // In real implementation: Reopen candidate tasks (Update CandidateTaskStatus)
                // For MVP: Log it or create an event
                var insufficiencyEvent = new BgvOrderEvent 
                {
                    BgvOrderId = order.Id,
                    EventType = "VENDOR_INSUFFICIENCY",
                    EventSource = "IDA",
                    Description = "Vendor reported insufficiency. Tasks may need reopening.",
                    PayloadJson = idaCase.RawLastPayload
                };
                _context.BgvOrderEvents.Add(insufficiencyEvent);
                
                // Set order status to handle insufficiency
                // We might need a new status or keep it InProgress but flag it
                // order.OverallStatus = BgvOrderStatus.InProgress; // Keep as is, or specific status
            }
        }

        await _context.SaveChangesAsync();
    }
}
