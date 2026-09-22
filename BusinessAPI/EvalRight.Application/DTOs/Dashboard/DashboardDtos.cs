namespace EvalRight.Application.DTOs.Dashboard;

public class DashboardCountsResponse
{
    public int CompletedOrders { get; set; }
    public int PendingOrders { get; set; }
    public int DraftOrders { get; set; }
    public int ActiveInvitations { get; set; }
}

public class RapidInvitationRequest
{
    public string CandidateEmail { get; set; } = string.Empty;
    public long PackageId { get; set; }
}

public class RapidInvitationResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public long? InvitationId { get; set; }
    public string? InvitationToken { get; set; }
    public string? InvitationLink { get; set; }
}
