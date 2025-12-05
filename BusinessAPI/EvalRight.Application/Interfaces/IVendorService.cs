using System.Threading.Tasks;

namespace EvalRight.Application.Interfaces;

public interface IVendorService
{
    Task InitiateVendorCheckAsync(long orderId);
    Task CheckVendorStatusAsync(long orderId);
    Task HandleWebhookAsync(string caseReference, string eventType, string payloadJson);
}

