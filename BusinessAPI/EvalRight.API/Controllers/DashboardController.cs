using System.Security.Claims;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Dashboard;
using EvalRight.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvalRight.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("counts")]
    public async Task<IActionResult> GetDashboardCounts()
    {
        try
        {
            var clientIdClaim = User.FindFirst("company_id")?.Value;
            if (string.IsNullOrEmpty(clientIdClaim) || !long.TryParse(clientIdClaim, out var clientId))
            {
                return Unauthorized(new { message = "Invalid client ID in token" });
            }

            var counts = await _dashboardService.GetDashboardCountsAsync(clientId);
            return Ok(counts);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("rapid-invitation")]
    public async Task<IActionResult> SendRapidInvitation([FromBody] RapidInvitationRequest request)
    {
        try
        {
            var clientIdClaim = User.FindFirst("company_id")?.Value;
            var accountIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(clientIdClaim) || !long.TryParse(clientIdClaim, out var clientId))
            {
                return Unauthorized(new { message = "Invalid client ID in token" });
            }

            if (string.IsNullOrEmpty(accountIdClaim) || !long.TryParse(accountIdClaim, out var accountId))
            {
                return Unauthorized(new { message = "Invalid account ID in token" });
            }

            var response = await _dashboardService.SendRapidInvitationAsync(request, clientId, accountId);
            
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

