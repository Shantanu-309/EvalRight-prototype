using System.Security.Claims;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Candidate;
using EvalRight.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvalRight.API.Controllers;

[ApiController]
[Route("api/candidate-portal")]
public class CandidatePortalController : ControllerBase
{
    private readonly ICandidatePortalService _portalService;

    public CandidatePortalController(ICandidatePortalService portalService)
    {
        _portalService = portalService;
    }

    [HttpPost("auth")]
    public async Task<IActionResult> Login([FromBody] CandidateLoginRequest request)
    {
        try
        {
            var response = await _portalService.AuthenticateAsync(request.InvitationToken);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpGet("profile")]
    [Authorize(Roles = "candidate")]
    public async Task<IActionResult> GetProfile()
    {
        var candidateIdClaim = User.FindFirst("candidate_id")?.Value;
        if (!long.TryParse(candidateIdClaim, out long candidateId)) return Unauthorized();

        var profile = await _portalService.GetProfileAsync(candidateId);
        return Ok(profile);
    }

    [HttpPost("tasks/{taskCode}")]
    [Authorize(Roles = "candidate")]
    public async Task<IActionResult> UpdateTask(string taskCode, [FromBody] object data)
    {
        var candidateIdClaim = User.FindFirst("candidate_id")?.Value;
        if (!long.TryParse(candidateIdClaim, out long candidateId)) return Unauthorized();

        var json = System.Text.Json.JsonSerializer.Serialize(data);
        await _portalService.UpdateTaskDataAsync(candidateId, taskCode, json);
        return Ok();
    }
}

