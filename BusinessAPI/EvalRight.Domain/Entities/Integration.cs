using System;
using System.Collections.Generic;
using EvalRight.Domain.Enums;

namespace EvalRight.Domain.Entities;

public class CandidateDocument : BaseEntity
{
    public long CandidateId { get; set; }
    public Candidate Candidate { get; set; } = null!;
    
    public long? BgvOrderId { get; set; }
    public BgvOrder? BgvOrder { get; set; }
    
    public string DocumentType { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? MimeType { get; set; }
    public string Status { get; set; } = "uploaded";
    
    public long? UploadedByAccountId { get; set; }
    public long? ApprovedByAdminId { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public string? RejectionReason { get; set; }
    public DateTimeOffset UploadedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class IdaJobRole : BaseEntity
{
    public long PackageId { get; set; }
    public BgvPackage Package { get; set; } = null!;
    
    public long IdaJobRoleId { get; set; }
    public string? IdaJobRoleName { get; set; }
    public BgvRegion Region { get; set; } = BgvRegion.In;
    public bool IsActive { get; set; } = true;
}

public class IdaCase : BaseEntity
{
    public long BgvOrderId { get; set; }
    public BgvOrder BgvOrder { get; set; } = null!;
    
    public string? IdaCandidateId { get; set; }
    public string? IdaCaseReference { get; set; }
    public string? OverallStatus { get; set; }
    public string? RawLastPayload { get; set; }
    public DateTimeOffset? LastWebhookAt { get; set; }
    
    public ICollection<IdaCaseComponent> Components { get; set; } = new List<IdaCaseComponent>();
}

public class IdaCaseComponent : BaseEntity
{
    public long IdaCaseId { get; set; }
    public IdaCase IdaCase { get; set; } = null!;
    
    public string? ComponentCode { get; set; }
    public string? IdaComponentId { get; set; }
    public string? Status { get; set; }
    public string? RawPayloadJson { get; set; }
    public DateTimeOffset LastStatusChangeAt { get; set; } = DateTimeOffset.UtcNow;
}

