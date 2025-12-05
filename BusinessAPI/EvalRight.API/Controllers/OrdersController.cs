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

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
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
}

