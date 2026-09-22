using System.ComponentModel.DataAnnotations;

namespace EvalRight.Application.DTOs.Order;

public class ManualOrderRequest
{
    [Required]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public long PackageId { get; set; }
}

public class ManualOrderResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public long? OrderId { get; set; }
    public long? CandidateId { get; set; }
}

public class InvitationOrderRequest
{
    [Required]
    [EmailAddress]
    public string CandidateEmail { get; set; } = string.Empty;
    
    [Required]
    public long PackageId { get; set; }
    
    public DateTimeOffset? ExpiresAt { get; set; } // Optional, defaults to 7 days
}

public class InvitationOrderResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public long? InvitationId { get; set; }
    public string? InvitationToken { get; set; }
    public string? InvitationLink { get; set; }
}

















