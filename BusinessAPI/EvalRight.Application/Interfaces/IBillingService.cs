using System.Threading.Tasks;

namespace EvalRight.Application.Interfaces;

public interface IBillingService
{
    Task GenerateInvoiceForOrderAsync(long orderId);
    Task ProcessPaymentAsync(long invoiceId, decimal amount, string source);
}

