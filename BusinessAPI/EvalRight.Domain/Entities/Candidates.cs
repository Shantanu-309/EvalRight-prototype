using System;
using System.Collections.Generic;
using EvalRight.Domain.Enums;

namespace EvalRight.Domain.Entities;

public class Candidate : BaseEntity
{
    public long ClientId { get; set; }
    // public Client Client { get; set; } = null!; // Avoid circularity in simplistic approach? No, it's fine.
    
    public long? AccountId { get; set; }
    public Account? Account { get; set; }
    
    public string? ExternalReference { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public DateOnly? Dob { get; set; }
    public string? CountryOfResidence { get; set; }
    
    public CandidateStatus Status { get; set; } = CandidateStatus.Invited;
    
    public ICollection<CandidateAddress> Addresses { get; set; } = new List<CandidateAddress>();
    public ICollection<CandidateEmployment> Employments { get; set; } = new List<CandidateEmployment>();
    public ICollection<CandidateEducation> Educations { get; set; } = new List<CandidateEducation>();
}

public class CandidateInvitation : BaseEntity
{
    public long ClientId { get; set; }
    public long? CandidateId { get; set; }
    public Candidate? Candidate { get; set; }
    
    public long? BgvOrderId { get; set; } // FK
    
    public string InvitedEmail { get; set; } = string.Empty;
    public string? InvitedPhone { get; set; }
    public string InvitationToken { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
    public string Status { get; set; } = "pending";
    
    public DateTimeOffset? SentAt { get; set; }
    public DateTimeOffset? AcceptedAt { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }
}

public class CandidateTaskStatus : BaseEntity
{
    public long CandidateId { get; set; }
    public Candidate Candidate { get; set; } = null!;
    
    public long? BgvOrderId { get; set; }
    
    public string TaskCode { get; set; } = string.Empty;
    public string Status { get; set; } = "draft";
    public bool EditableByCandidate { get; set; } = true;
    public DateTimeOffset? EditableUntil { get; set; }
    public DateTimeOffset LastUpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    
    public long? UpdatedByAccountId { get; set; }
}

public class CandidateProfileData : BaseEntity
{
    public long CandidateId { get; set; }
    public Candidate Candidate { get; set; } = null!;
    
    public string TaskCode { get; set; } = string.Empty;
    public string DataJson { get; set; } = "{}";
    
    public bool IsValidated { get; set; }
    public DateTimeOffset? ValidatedAt { get; set; }
}

public class CandidateAddress : BaseEntity
{
    public long CandidateId { get; set; }
    public Candidate Candidate { get; set; } = null!;
    
    public string Type { get; set; } = string.Empty; // current, previous
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    
    public DateOnly? FromDate { get; set; }
    public DateOnly? ToDate { get; set; }
}

public class CandidateEmployment : BaseEntity
{
    public long CandidateId { get; set; }
    public Candidate Candidate { get; set; } = null!;
    
    public string EmployerName { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public DateOnly? FromDate { get; set; }
    public DateOnly? ToDate { get; set; }
    public string? Location { get; set; }
    public string? ContactInfo { get; set; }
    public bool IsCurrent { get; set; }
}

public class CandidateEducation : BaseEntity
{
    public long CandidateId { get; set; }
    public Candidate Candidate { get; set; } = null!;
    
    public string InstitutionName { get; set; } = string.Empty;
    public string? Degree { get; set; }
    public string? Major { get; set; }
    public DateOnly? FromDate { get; set; }
    public DateOnly? ToDate { get; set; }
    public string? Country { get; set; }
    public string? CertificateNumber { get; set; }
}

