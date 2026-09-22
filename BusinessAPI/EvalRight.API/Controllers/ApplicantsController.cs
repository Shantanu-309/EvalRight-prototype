using System.Security.Claims;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Client;
using EvalRight.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvalRight.API.Controllers;

[ApiController]
[Route("api/applicants")]
[Route("api/client/applicants")] // Alias for client portal
[Authorize] // Require authentication
public class ApplicantsController : ControllerBase
{
    private readonly IClientApplicantService _applicantService;

    public ApplicantsController(IClientApplicantService applicantService)
    {
        _applicantService = applicantService;
    }

    /// <summary>
    /// Get list of applicants for the authenticated client
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetApplicantsList()
    {
        try
        {
            // Extract clientId from JWT token claims
            var clientIdClaim = User.FindFirst("company_id")?.Value;
            if (string.IsNullOrEmpty(clientIdClaim) || !long.TryParse(clientIdClaim, out var clientId))
            {
                return Unauthorized(new { message = "Invalid client ID in token. User must be associated with a client." });
            }

            var applicants = await _applicantService.GetApplicantsListAsync(clientId);
            return Ok(applicants);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get full details of a specific applicant
    /// </summary>
    [HttpGet("{candidateId}")]
    public async Task<IActionResult> GetApplicantDetail(long candidateId)
    {
        try
        {
            // Extract clientId from JWT token claims
            var clientIdClaim = User.FindFirst("company_id")?.Value;
            if (string.IsNullOrEmpty(clientIdClaim) || !long.TryParse(clientIdClaim, out var clientId))
            {
                return Unauthorized(new { message = "Invalid client ID in token. User must be associated with a client." });
            }

            // Service will verify candidate belongs to this client - security enforced server-side
            var applicant = await _applicantService.GetApplicantDetailAsync(candidateId, clientId);
            
            if (applicant == null)
            {
                return NotFound(new { message = "Applicant not found or you do not have permission to view this applicant." });
            }

            return Ok(applicant);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}


