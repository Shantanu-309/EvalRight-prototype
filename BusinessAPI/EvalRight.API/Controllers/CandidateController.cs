using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Candidate;
using EvalRight.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EvalRight.API.Controllers;

[ApiController]
[Route("api/candidate")]
public class CandidateController : ControllerBase
{
    private readonly ICandidatePortalService _portalService;
    private readonly IFileUploadService _fileUploadService;
    private readonly IEvalRightDbContext _context;

    public CandidateController(ICandidatePortalService portalService, IFileUploadService fileUploadService, IEvalRightDbContext context)
    {
        _portalService = portalService;
        _fileUploadService = fileUploadService;
        _context = context;
    }

    [HttpPost("submit/final")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitFinal([FromBody] FinalSubmissionRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Token))
            {
                return BadRequest(new { message = "Invitation token is required" });
            }

            if (request.CandidateId <= 0)
            {
                return BadRequest(new { message = "Candidate ID is required" });
            }

            var response = await _portalService.SubmitFinalAsync(request);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            // Log the full exception for debugging
            Console.WriteLine($"Error in final submission: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("file/id-proof-front")]
    [AllowAnonymous]
    public async Task<IActionResult> UploadIdProofFront([FromForm] Microsoft.AspNetCore.Http.IFormFile file, [FromForm] string token, [FromForm] long candidateId)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            var response = await _fileUploadService.UploadFileAsync(candidateId, token, "id-proof-front", file);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("file/id-proof-back")]
    [AllowAnonymous]
    public async Task<IActionResult> UploadIdProofBack([FromForm] Microsoft.AspNetCore.Http.IFormFile file, [FromForm] string token, [FromForm] long candidateId)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            var response = await _fileUploadService.UploadFileAsync(candidateId, token, "id-proof-back", file);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("file/diploma")]
    [AllowAnonymous]
    public async Task<IActionResult> UploadDiploma([FromForm] Microsoft.AspNetCore.Http.IFormFile file, [FromForm] string token, [FromForm] long candidateId)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            var response = await _fileUploadService.UploadFileAsync(candidateId, token, "diploma", file);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("file/experience-letter")]
    [AllowAnonymous]
    public async Task<IActionResult> UploadExperienceLetter([FromForm] Microsoft.AspNetCore.Http.IFormFile file, [FromForm] string token, [FromForm] long candidateId)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            var response = await _fileUploadService.UploadFileAsync(candidateId, token, "experience-letter", file);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("file/criminal")]
    [AllowAnonymous]
    public async Task<IActionResult> UploadCriminal([FromForm] Microsoft.AspNetCore.Http.IFormFile file, [FromForm] string token, [FromForm] long candidateId)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            var response = await _fileUploadService.UploadFileAsync(candidateId, token, "criminal", file);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("file/work-auth")]
    [AllowAnonymous]
    public async Task<IActionResult> UploadWorkAuth([FromForm] Microsoft.AspNetCore.Http.IFormFile file, [FromForm] string token, [FromForm] long candidateId)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            var response = await _fileUploadService.UploadFileAsync(candidateId, token, "work-auth", file);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("file/drug-test")]
    [AllowAnonymous]
    public async Task<IActionResult> UploadDrugTest([FromForm] Microsoft.AspNetCore.Http.IFormFile file, [FromForm] string token, [FromForm] long candidateId)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            var response = await _fileUploadService.UploadFileAsync(candidateId, token, "drug-test", file);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("file/{fileId}")]
    public async Task<IActionResult> GetFile(long fileId, [FromQuery] string? token)
    {
        try
        {
            CandidateDocument? document = null;

            // If token provided, validate for candidate access (AllowAnonymous)
            if (!string.IsNullOrEmpty(token))
            {
                var invitation = await _context.CandidateInvitations
                    .FirstOrDefaultAsync(i => i.InvitationToken == token);

                if (invitation == null)
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                document = await _context.CandidateDocuments
                    .FirstOrDefaultAsync(d => d.Id == fileId && d.CandidateId == invitation.CandidateId);
            }
            else
            {
                // For authenticated clients, check if they have access to this candidate's files
                // This requires [Authorize] but we use [AllowAnonymous] on controller level
                // So we check authentication manually
                if (!User.Identity?.IsAuthenticated ?? true)
                {
                    return Unauthorized(new { message = "Authentication required or valid token must be provided" });
                }

                var clientIdClaim = User.FindFirst("company_id")?.Value;
                if (string.IsNullOrEmpty(clientIdClaim) || !long.TryParse(clientIdClaim, out var clientId))
                {
                    return Unauthorized(new { message = "Invalid client ID in token" });
                }

                document = await _context.CandidateDocuments
                    .Include(d => d.Candidate)
                    .FirstOrDefaultAsync(d => d.Id == fileId && d.Candidate.ClientId == clientId);
            }

            if (document == null || !System.IO.File.Exists(document.FilePath))
            {
                return NotFound(new { message = "File not found" });
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(document.FilePath);
            return File(fileBytes, document.MimeType ?? "application/octet-stream", Path.GetFileName(document.FilePath));
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("data/pii")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitPii([FromBody] System.Text.Json.JsonElement data)
    {
        try
        {
            long candidateId = 0;
            if (data.TryGetProperty("candidateId", out var candidateIdElement))
            {
                candidateId = candidateIdElement.GetInt64();
            }

            if (candidateId == 0)
            {
                return BadRequest(new { message = "Candidate ID is required" });
            }

            var json = System.Text.Json.JsonSerializer.Serialize(data);
            await _portalService.UpdateTaskDataAsync(candidateId, "IDENTITY", json);
            return Ok(new { success = true, message = "PII data saved successfully" });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("data/address")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitAddress([FromBody] System.Text.Json.JsonElement data)
    {
        try
        {
            long candidateId = 0;
            if (data.TryGetProperty("candidateId", out var candidateIdElement))
            {
                candidateId = candidateIdElement.GetInt64();
            }

            if (candidateId == 0)
            {
                return BadRequest(new { message = "Candidate ID is required" });
            }

            var json = System.Text.Json.JsonSerializer.Serialize(data);
            await _portalService.UpdateTaskDataAsync(candidateId, "ADDRESS_HISTORY", json);
            return Ok(new { success = true, message = "Address data saved successfully" });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("data/education")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitEducation([FromBody] System.Text.Json.JsonElement data)
    {
        try
        {
            long candidateId = 0;
            if (data.TryGetProperty("candidateId", out var candidateIdElement))
            {
                candidateId = candidateIdElement.GetInt64();
            }

            if (candidateId == 0)
            {
                return BadRequest(new { message = "Candidate ID is required" });
            }

            var json = System.Text.Json.JsonSerializer.Serialize(data);
            await _portalService.UpdateTaskDataAsync(candidateId, "EDUCATION", json);
            return Ok(new { success = true, message = "Education data saved successfully" });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("data/employment")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitEmployment([FromBody] System.Text.Json.JsonElement data)
    {
        try
        {
            long candidateId = 0;
            if (data.TryGetProperty("candidateId", out var candidateIdElement))
            {
                candidateId = candidateIdElement.GetInt64();
            }

            if (candidateId == 0)
            {
                return BadRequest(new { message = "Candidate ID is required" });
            }

            var json = System.Text.Json.JsonSerializer.Serialize(data);
            await _portalService.UpdateTaskDataAsync(candidateId, "EMPLOYMENT", json);
            return Ok(new { success = true, message = "Employment data saved successfully" });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("data/criminal")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitCriminal([FromBody] System.Text.Json.JsonElement data)
    {
        try
        {
            long candidateId = 0;
            if (data.TryGetProperty("candidateId", out var candidateIdElement))
            {
                candidateId = candidateIdElement.GetInt64();
            }

            if (candidateId == 0)
            {
                return BadRequest(new { message = "Candidate ID is required" });
            }

            var json = System.Text.Json.JsonSerializer.Serialize(data);
            await _portalService.UpdateTaskDataAsync(candidateId, "CRIMINAL", json);
            return Ok(new { success = true, message = "Criminal data saved successfully" });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("data/work-auth")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitWorkAuth([FromBody] System.Text.Json.JsonElement data)
    {
        try
        {
            long candidateId = 0;
            if (data.TryGetProperty("candidateId", out var candidateIdElement))
            {
                candidateId = candidateIdElement.GetInt64();
            }

            if (candidateId == 0)
            {
                return BadRequest(new { message = "Candidate ID is required" });
            }

            var json = System.Text.Json.JsonSerializer.Serialize(data);
            await _portalService.UpdateTaskDataAsync(candidateId, "WORK_AUTHORIZATION", json);
            return Ok(new { success = true, message = "Work authorization data saved successfully" });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("data/drug-test")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitDrugTest([FromBody] System.Text.Json.JsonElement data)
    {
        try
        {
            long candidateId = 0;
            if (data.TryGetProperty("candidateId", out var candidateIdElement))
            {
                candidateId = candidateIdElement.GetInt64();
            }

            if (candidateId == 0)
            {
                return BadRequest(new { message = "Candidate ID is required" });
            }

            var json = System.Text.Json.JsonSerializer.Serialize(data);
            await _portalService.UpdateTaskDataAsync(candidateId, "DRUG_TEST", json);
            return Ok(new { success = true, message = "Drug test data saved successfully" });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("data/social-media")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitSocialMedia([FromBody] System.Text.Json.JsonElement data)
    {
        try
        {
            long candidateId = 0;
            if (data.TryGetProperty("candidateId", out var candidateIdElement))
            {
                candidateId = candidateIdElement.GetInt64();
            }

            if (candidateId == 0)
            {
                return BadRequest(new { message = "Candidate ID is required" });
            }

            var json = System.Text.Json.JsonSerializer.Serialize(data);
            await _portalService.UpdateTaskDataAsync(candidateId, "SOCIAL_MEDIA", json);
            return Ok(new { success = true, message = "Social media data saved successfully" });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("data/references")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitReferences([FromBody] System.Text.Json.JsonElement data)
    {
        try
        {
            long candidateId = 0;
            if (data.TryGetProperty("candidateId", out var candidateIdElement))
            {
                candidateId = candidateIdElement.GetInt64();
            }

            if (candidateId == 0)
            {
                return BadRequest(new { message = "Candidate ID is required" });
            }

            var json = System.Text.Json.JsonSerializer.Serialize(data);
            await _portalService.UpdateTaskDataAsync(candidateId, "REFERENCES", json);
            return Ok(new { success = true, message = "References data saved successfully" });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}


