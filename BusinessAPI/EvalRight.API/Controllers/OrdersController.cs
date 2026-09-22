using System.Security.Claims;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Order;
using EvalRight.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvalRight.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IInvitationService _invitationService;

    public OrdersController(IOrderService orderService, IInvitationService invitationService)
    {
        _orderService = orderService;
        _invitationService = invitationService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        try
        {
            var accountIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!long.TryParse(accountIdClaim, out long accountId))
            {
                return Unauthorized();
            }

            // TODO: Validate user access to request.ClientId

            var order = await _orderService.CreateOrderAsync(request, accountId);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(long id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null) return NotFound();
        // TODO: Validate access
        return Ok(order);
    }

    [HttpGet("client/{clientId}")]
    public async Task<IActionResult> GetOrdersByClient(long clientId)
    {
        // TODO: Validate access
        var orders = await _orderService.GetOrdersByClientIdAsync(clientId);
        return Ok(orders);
    }

    [HttpPost("manual")]
    public async Task<IActionResult> CreateManualOrder([FromBody] ManualOrderRequest request)
    {
        try
        {
            var clientIdClaim = User.FindFirst("company_id")?.Value;
            var accountIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(clientIdClaim) || !long.TryParse(clientIdClaim, out var clientId))
            {
                return Unauthorized(new { message = "Invalid client ID in token" });
            }

            if (string.IsNullOrEmpty(accountIdClaim) || !long.TryParse(accountIdClaim, out var accountId))
            {
                return Unauthorized(new { message = "Invalid account ID in token" });
            }

            var response = await _orderService.CreateManualOrderAsync(request, clientId, accountId);
            
            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("invitation")]
    public async Task<IActionResult> CreateInvitationOrder([FromBody] InvitationOrderRequest request)
    {
        try
        {
            var clientIdClaim = User.FindFirst("company_id")?.Value;
            var accountIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(clientIdClaim) || !long.TryParse(clientIdClaim, out var clientId))
            {
                return Unauthorized(new { message = "Invalid client ID in token" });
            }

            if (string.IsNullOrEmpty(accountIdClaim) || !long.TryParse(accountIdClaim, out var accountId))
            {
                return Unauthorized(new { message = "Invalid account ID in token" });
            }

            var response = await _invitationService.CreateInvitationOrderAsync(request, clientId, accountId);
            
            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

