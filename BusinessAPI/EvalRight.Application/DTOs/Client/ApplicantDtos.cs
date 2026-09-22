namespace EvalRight.Application.DTOs.Client;

public class ApplicantListItemDto
{
    public long CandidateId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string InvitationStatus { get; set; } = string.Empty; // pending, accepted, expired, cancelled
    public string VerificationStatus { get; set; } = string.Empty; // Pending, ProfilePending, InProgress, Completed, Flagged
    public string? PackageName { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public long? OrderId { get; set; }
}

public class ApplicantDetailDto
{
    // Basic Info
    public long CandidateId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? CountryOfResidence { get; set; }
    public string Status { get; set; } = string.Empty;
    
    // Invitation Info
    public string InvitationStatus { get; set; } = string.Empty;
    public DateTimeOffset? InvitationSentAt { get; set; }
    public DateTimeOffset? InvitationAcceptedAt { get; set; }
    public DateTimeOffset? InvitationExpiresAt { get; set; }
    
    // Order Info
    public long? OrderId { get; set; }
    public string? OrderReference { get; set; }
    public string? PackageName { get; set; }
    
    // Profile Data
    public ApplicantPersonalInfoDto? PersonalInfo { get; set; }
    public List<ApplicantAddressDto> Addresses { get; set; } = new();
    public List<ApplicantEducationDto> Educations { get; set; } = new();
    public List<ApplicantEmploymentDto> Employments { get; set; } = new();
    public ApplicantSocialMediaDto? SocialMedia { get; set; }
    public List<ApplicantDocumentDto> Documents { get; set; } = new();
    
    // Consent & Submission
    public bool ConsentSigned { get; set; }
    public DateTimeOffset? ConsentSignedAt { get; set; }
    public DateTimeOffset? FinalSubmittedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class ApplicantPersonalInfoDto
{
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? DateOfBirth { get; set; }
    public string? CountryOfResidence { get; set; }
    public string? IdType { get; set; }
    public string? IdNumber { get; set; }
}

public class ApplicantAddressDto
{
    public string Type { get; set; } = string.Empty; // current, previous
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? FromDate { get; set; }
    public string? ToDate { get; set; }
    public bool IsCurrent { get; set; }
}

public class ApplicantEducationDto
{
    public string InstitutionName { get; set; } = string.Empty;
    public string? Degree { get; set; }
    public string? Major { get; set; }
    public string? FromDate { get; set; }
    public string? ToDate { get; set; }
    public string? Country { get; set; }
    public string? CertificateNumber { get; set; }
}

public class ApplicantEmploymentDto
{
    public string EmployerName { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public string? FromDate { get; set; }
    public string? ToDate { get; set; }
    public string? Location { get; set; }
    public string? ContactInfo { get; set; }
    public bool IsCurrent { get; set; }
}

public class ApplicantSocialMediaDto
{
    public bool ConsentGiven { get; set; }
    public List<SocialMediaProfileDto> Profiles { get; set; } = new();
}

public class SocialMediaProfileDto
{
    public string Platform { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}

public class ApplicantDocumentDto
{
    public string DocumentType { get; set; } = string.Empty; // id-proof, diploma, etc.
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long? FileSize { get; set; }
    public DateTimeOffset? UploadedAt { get; set; }
    public string? FileUrl { get; set; }
}


