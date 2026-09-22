using EvalRight.Domain.Entities;

namespace EvalRight.Application.DTOs.Candidate;

public class CandidateLoginRequest
{
    public string InvitationToken { get; set; } = string.Empty;
}

public class CandidateAuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string CandidateName { get; set; } = string.Empty;
    public long CandidateId { get; set; }
}

public class CandidateTaskDto
{
    public string TaskCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsEditable { get; set; }
    public object? Data { get; set; } // JSON Payload
}

public class CandidateProfileDto
{
    public long CandidateId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public List<CandidateTaskDto> Tasks { get; set; } = new();
}

public class VerifyTokenResponse
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? CandidateEmail { get; set; }
    public string? CandidateName { get; set; }
}

public class InvitationDetailsResponse
{
    public long CandidateId { get; set; }
    public long? OrderId { get; set; }
    public string EmployerName { get; set; } = string.Empty;
    public bool IsSubmitted { get; set; }
}

public class IdentityVerificationRequest
{
    public string Token { get; set; } = string.Empty;
    public string VerificationMethod { get; set; } = string.Empty; // "dob" or "ssn"
    public string? Dob { get; set; }
    public string? SsnLast4 { get; set; }
}

public class IdentityVerificationResponse
{
    public bool Verified { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class FcraTextResponse
{
    public string Text { get; set; } = string.Empty;
}

public class ConsentSignRequest
{
    public string Token { get; set; } = string.Empty;
    public long CandidateId { get; set; }
    public string Signature { get; set; } = string.Empty; // Base64 image
    public string Timestamp { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
}

public class ConsentSignResponse
{
    public long SignatureId { get; set; }
    public bool Success { get; set; }
}

public class ConsentFileResponse
{
    public byte[] Content { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = "application/pdf";
    public string FileName { get; set; } = "fcra-consent.pdf";
}

public class DocumentUploadResponse
{
    public long FileId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
}

public class SocialMediaRequest
{
    public string Token { get; set; } = string.Empty;
    public long CandidateId { get; set; }
    public bool ConsentGiven { get; set; }
    public List<SocialMediaProfile> Profiles { get; set; } = new();
    public string Timestamp { get; set; } = string.Empty;
}

public class SocialMediaProfile
{
    public string Platform { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}

public class ReviewSummaryResponse
{
    public PersonalInfoDto? PersonalInfo { get; set; }
    public List<AddressDto> Addresses { get; set; } = new();
    public List<EducationDto> Educations { get; set; } = new();
    public List<EmploymentDto> Employments { get; set; } = new();
    public DocumentsDto? Documents { get; set; }
    public SocialMediaDto? SocialMedia { get; set; }
}

public class PersonalInfoDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string MiddleName { get; set; } = string.Empty;
    public string Dob { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class AddressDto
{
    public string AddressLine1 { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string FromDate { get; set; } = string.Empty;
    public string ToDate { get; set; } = string.Empty;
    public bool IsCurrent { get; set; }
}

public class EducationDto
{
    public string Institution { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string Major { get; set; } = string.Empty;
    public string GraduationDate { get; set; } = string.Empty;
}

public class EmploymentDto
{
    public string EmployerName { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string FromDate { get; set; } = string.Empty;
    public string ToDate { get; set; } = string.Empty;
    public bool IsCurrent { get; set; }
}

public class DocumentsDto
{
    public bool IdProof { get; set; }
    public bool Diploma { get; set; }
}

public class SocialMediaDto
{
    public List<SocialMediaProfile> Profiles { get; set; } = new();
}

public class FinalSubmissionRequest
{
    public string Token { get; set; } = string.Empty;
    public long CandidateId { get; set; }
}

public class FinalSubmissionResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

