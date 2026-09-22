using System.Threading.Tasks;

namespace EvalRight.Application.Interfaces;

public interface IEmailService
{
    Task SendManualOrderNotificationAsync(string candidateEmail, string candidateName, string clientName, string packageName);
    Task SendInvitationEmailAsync(string candidateEmail, string clientName, string invitationLink, DateTimeOffset? expiresAt);
}

















