using System.Text.Json;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Integration;
using EvalRight.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace EvalRight.API.Controllers;

[ApiController]
[Route("api/webhooks/ida")]
public class IdaWebhookController : ControllerBase
{
    private readonly IVendorService _vendorService;
    private readonly ILogger<IdaWebhookController> _logger;

    public IdaWebhookController(IVendorService vendorService, ILogger<IdaWebhookController> logger)
    {
        _vendorService = vendorService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> ReceiveWebhook([FromBody] IdaWebhookPayload payload)
    {
        _logger.LogInformation("Received IDA Webhook: {EventType} for Case {CaseId}", payload.EventType, payload.CaseId);

        // TODO: Validate Webhook Signature if applicable (e.g. X-Ida-Signature)

        if (string.IsNullOrEmpty(payload.CaseId))
        {
            return BadRequest("Missing CaseId");
        }

        // Delegate processing to VendorService
        // We might need to map payload to domain entity or pass specific args
        // For simplicity, we assume VendorService can handle specific logic based on CaseId
        
        // Since IVendorService currently has methods like CheckVendorStatusAsync(orderId), 
        // we need to find the OrderId from CaseId.
        // VendorService needs a method to handle webhook payload directly or we resolve order here.
        // Better to add HandleWebhookAsync to IVendorService.
        
        await _vendorService.HandleWebhookAsync(payload.CaseId, payload.EventType, JsonSerializer.Serialize(payload));

        return Ok();
    }
}

