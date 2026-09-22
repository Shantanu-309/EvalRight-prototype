using System.Threading.Tasks;
using EvalRight.Application.DTOs.Dashboard;

namespace EvalRight.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardCountsResponse> GetDashboardCountsAsync(long clientId);
    Task<RapidInvitationResponse> SendRapidInvitationAsync(RapidInvitationRequest request, long clientId, long initiatedByAccountId);
}
