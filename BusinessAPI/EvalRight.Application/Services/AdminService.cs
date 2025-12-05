using System.Threading.Tasks;
using EvalRight.Application.DTOs.Admin;
using EvalRight.Application.Interfaces;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EvalRight.Application.Services;

public class AdminService : IAdminService
{
    private readonly IEvalRightDbContext _context;

    public AdminService(IEvalRightDbContext context)
    {
        _context = context;
    }

    public async Task<AdminDashboardStatsDto> GetDashboardStatsAsync()
    {
        var totalClients = await _context.Clients.CountAsync();
        
        var activeOrders = await _context.BgvOrders
            .CountAsync(o => o.OverallStatus == BgvOrderStatus.InProgress || 
                             o.OverallStatus == BgvOrderStatus.QueuedForVendor || 
                             o.OverallStatus == BgvOrderStatus.AwaitingCandidate);

        var completedOrders = await _context.BgvOrders
            .CountAsync(o => o.OverallStatus == BgvOrderStatus.Clear || 
                             o.OverallStatus == BgvOrderStatus.Adverse ||
                             o.OverallStatus == BgvOrderStatus.Closed);

        var pendingInvoices = await _context.Invoices
            .CountAsync(i => i.Status == InvoiceStatus.Sent || 
                             i.Status == InvoiceStatus.PartiallyPaid ||
                             i.Status == InvoiceStatus.Overdue);

        return new AdminDashboardStatsDto
        {
            TotalClients = totalClients,
            ActiveOrders = activeOrders,
            CompletedOrders = completedOrders,
            PendingInvoices = pendingInvoices
        };
    }
}

