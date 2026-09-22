using System.Threading.Tasks;
using EvalRight.Application.DTOs.Order;
using EvalRight.Application.DTOs.Invitation;

namespace EvalRight.Application.Interfaces;

public interface IInvitationService
{
    Task<InvitationOrderResponse> CreateInvitationOrderAsync(InvitationOrderRequest request, long clientId, long initiatedByAccountId);
    Task<bool> CompleteInvitationAsync(string invitationToken);
    Task<SendInvitationResponse> SendInvitationAsync(SendInvitationRequest request, long clientId, long initiatedByAccountId);
    Task<ValidateInvitationResponse> ValidateInvitationTokenAsync(long? invitationId, string token);
}


