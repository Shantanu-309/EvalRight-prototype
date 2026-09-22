using System.ComponentModel.DataAnnotations;

namespace EvalRight.Application.DTOs.Invitation;

public class SendInvitationRequest
{
    [Required]
    [EmailAddress]
    public string CandidateEmail { get; set; } = string.Empty;
    
    [Required]
    public long PackageId { get; set; }
    
    [Required]
    public string InvitationType { get; set; } = string.Empty; // "manual", "orderWithInvitation", "rapid"
}

public class SendInvitationResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public long? InvitationId { get; set; }
    public string? InvitationToken { get; set; }
    public string? InvitationLink { get; set; }
}

public class ValidateInvitationRequest
{
    public long? InvitationId { get; set; }
    public string Token { get; set; } = string.Empty;
}

public class ValidateInvitationResponse
{
    public bool Valid { get; set; }
    public string? CandidateEmail { get; set; }
    public long? PackageId { get; set; }
    public string? Message { get; set; }
    public string? ErrorCode { get; set; } // "NOT_FOUND", "TOKEN_MISMATCH", "EXPIRED", "ALREADY_USED"
}

public class CompleteInvitationRequest
{
    public string Token { get; set; } = string.Empty;
}





