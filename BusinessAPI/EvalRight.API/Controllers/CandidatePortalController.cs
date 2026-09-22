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
    [AllowAnonymous]
    public async Task<IActionResult> UpdateTask(string taskCode, [FromBody] System.Text.Json.JsonElement data)
    {
        try
        {
            // Extract candidateId from request body
            long candidateId = 0;
            
            if (data.TryGetProperty("candidateId", out var candidateIdElement))
            {
                candidateId = candidateIdElement.GetInt64();
            }

            if (candidateId == 0)
            {
                // Try to get from token if authenticated
                var candidateIdClaim = User.FindFirst("candidate_id")?.Value;
                if (string.IsNullOrEmpty(candidateIdClaim) || !long.TryParse(candidateIdClaim, out candidateId))
                {
                    return BadRequest(new { message = "Candidate ID is required" });
                }
            }

            var json = System.Text.Json.JsonSerializer.Serialize(data);
            await _portalService.UpdateTaskDataAsync(candidateId, taskCode, json);
            return Ok(new { success = true, message = "Data saved successfully" });
        }
        catch (System.Exception ex)
        {
            // Log the full exception for debugging
            Console.WriteLine($"Error updating task {taskCode}: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return BadRequest(new { message = ex.Message, taskCode = taskCode });
        }
    }

    [HttpGet("verify-token")]
    public async Task<IActionResult> VerifyToken([FromQuery] string token)
    {
        try
        {
            var response = await _portalService.VerifyTokenAsync(token);
            if (!response.IsValid)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { isValid = false, message = ex.Message });
        }
    }

    [HttpGet("invitation-details")]
    [AllowAnonymous]
    public async Task<IActionResult> GetInvitationDetails([FromQuery] long? invitationId, [FromQuery] string token)
    {
        try
        {
            var response = await _portalService.GetInvitationDetailsAsync(invitationId, token);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("auth/verify")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyIdentity([FromBody] IdentityVerificationRequest request)
    {
        try
        {
            var response = await _portalService.VerifyIdentityAsync(request);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return Unauthorized(new { message = ex.Message, verified = false });
        }
    }

    [HttpGet("legal/fcra")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFcraText()
    {
        try
        {
            var response = await _portalService.GetFcraTextAsync();
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("consent/sign")]
    [AllowAnonymous]
    public async Task<IActionResult> SignConsent([FromBody] ConsentSignRequest request)
    {
        try
        {
            var response = await _portalService.SignConsentAsync(request);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("consent/download")]
    [AllowAnonymous]
    public async Task<IActionResult> DownloadConsent([FromQuery] string token)
    {
        try
        {
            var file = await _portalService.DownloadConsentAsync(token);
            return File(file.Content, file.ContentType, file.FileName);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("file/id-proof")]
    [AllowAnonymous]
    public async Task<IActionResult> UploadIdProof([FromForm] IFormFile file, [FromForm] string token, [FromForm] long candidateId)
    {
        try
        {
            var response = await _portalService.UploadDocumentAsync(candidateId, token, "id-proof", file);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("file/diploma")]
    [AllowAnonymous]
    public async Task<IActionResult> UploadDiploma([FromForm] IFormFile file, [FromForm] string token, [FromForm] long candidateId)
    {
        try
        {
            var response = await _portalService.UploadDocumentAsync(candidateId, token, "diploma", file);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("data/social")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitSocialMedia([FromBody] SocialMediaRequest request)
    {
        try
        {
            await _portalService.SubmitSocialMediaAsync(request);
            return Ok(new { success = true });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("review/summary")]
    [AllowAnonymous]
    public async Task<IActionResult> GetReviewSummary([FromQuery] string token, [FromQuery] long candidateId)
    {
        try
        {
            var response = await _portalService.GetReviewSummaryAsync(token, candidateId);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("submit/final")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitFinal([FromBody] FinalSubmissionRequest request)
    {
        try
        {
            var response = await _portalService.SubmitFinalAsync(request);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
