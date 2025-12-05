namespace EvalRight.Application.DTOs.Admin;

public class AdminDashboardStatsDto
{
    public int TotalClients { get; set; }
    public int ActiveOrders { get; set; }
    public int CompletedOrders { get; set; }
    public int PendingInvoices { get; set; }
}

