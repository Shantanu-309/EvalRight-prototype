using System.Security.Claims;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Invitation;
using EvalRight.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvalRight.API.Controllers;

[ApiController]
[Route("api/candidate/invitation")]
public class InvitationsController : ControllerBase
{
    private readonly IInvitationService _invitationService;

    public InvitationsController(IInvitationService invitationService)
    {
        _invitationService = invitationService;
    }

    [HttpGet("validate")]
    [AllowAnonymous]
    public async Task<IActionResult> ValidateInvitation([FromQuery] long? invitationId, [FromQuery] string token)
    {
        try
        {
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest(new ValidateInvitationResponse
                {
                    Valid = false,
                    ErrorCode = "TOKEN_REQUIRED",
                    Message = "Token is required"
                });
            }

            var response = await _invitationService.ValidateInvitationTokenAsync(invitationId, token);
            
            if (!response.Valid)
            {
                // Return specific error codes
                return BadRequest(response);
            }

            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new ValidateInvitationResponse
            {
                Valid = false,
                ErrorCode = "ERROR",
                Message = "An error occurred while validating the invitation."
            });
        }
    }

    [HttpPost("complete")]
    [AllowAnonymous]
    public async Task<IActionResult> CompleteInvitation([FromBody] CompleteInvitationRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Token))
            {
                return BadRequest(new { message = "Token is required" });
            }

            var success = await _invitationService.CompleteInvitationAsync(request.Token);
            
            if (!success)
            {
                return BadRequest(new { message = "Failed to complete invitation. It may be invalid, expired, or already used." });
            }

            return Ok(new { success = true, message = "Invitation completed successfully" });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("send")]
    [Authorize]
    public async Task<IActionResult> SendInvitation([FromBody] SendInvitationRequest request)
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

            // Validate invitation type
            if (request.InvitationType != "manual" && 
                request.InvitationType != "orderWithInvitation" && 
                request.InvitationType != "rapid")
            {
                return BadRequest(new { message = "Invalid invitation type. Must be 'manual', 'orderWithInvitation', or 'rapid'" });
            }

            var response = await _invitationService.SendInvitationAsync(request, clientId, accountId);
            
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





