using System.ComponentModel.DataAnnotations;

namespace EvalRight.Application.DTOs.Auth;

public class ClientRegistrationRequest
{
    // Company Information
    [Required]
    public string CompanyName { get; set; } = string.Empty;
    
    [Required]
    public string LegalName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string CompanyEmail { get; set; } = string.Empty;
    
    [Required]
    public string CompanyPhoneNumber { get; set; } = string.Empty;
    
    [Required]
    public string Country { get; set; } = string.Empty;
    
    [Required]
    public string Industry { get; set; } = string.Empty;
    
    // Authorized Person Details
    [Required]
    public string FullName { get; set; } = string.Empty;
    
    [Required]
    public string Designation { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string WorkEmail { get; set; } = string.Empty;
    
    [Required]
    public string WorkPhoneNumber { get; set; } = string.Empty;
    
    // Account Credentials
    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;
    
    [Required]
    [Compare("Password")]
    public string ConfirmPassword { get; set; } = string.Empty;
    
    // Security & Compliance
    [Required]
    public bool AcceptTerms { get; set; }
    
    [Required]
    public bool AcceptPrivacyPolicy { get; set; }
    
    [Required]
    public string CaptchaToken { get; set; } = string.Empty;
}

public class ClientRegistrationResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public long? AccountId { get; set; }
    public long? ClientId { get; set; }
}





















