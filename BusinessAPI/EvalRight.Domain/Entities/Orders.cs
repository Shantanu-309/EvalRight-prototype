using System;
using System.Collections.Generic;
using EvalRight.Domain.Enums;

namespace EvalRight.Domain.Entities;

public class BgvOrder : BaseEntity
{
    public long ClientId { get; set; }
    public Client Client { get; set; } = null!;
    
    public long? CandidateId { get; set; }
    public Candidate? Candidate { get; set; }
    
    public long? ClientBranchId { get; set; }
    // public ClientBranch? Branch { get; set; }
    
    public long? InitiatedByAccountId { get; set; }
    public Account? InitiatedByAccount { get; set; }
    
    public long? PackageId { get; set; }
    public BgvPackage? Package { get; set; }
    
    public BgvRegion BgvRegion { get; set; } = BgvRegion.In;
    public string OrderType { get; set; } = "direct";
    public BgvOrderStatus OverallStatus { get; set; } = BgvOrderStatus.Draft;
    public string VendorCode { get; set; } = "IDA";
    public string? PricingSnapshotJson { get; set; }
    
    public DateTimeOffset? CompletedAt { get; set; }
    
    public ICollection<BgvOrderComponent> Components { get; set; } = new List<BgvOrderComponent>();
    public ICollection<BgvOrderEvent> Events { get; set; } = new List<BgvOrderEvent>();
}

public class BgvOrderComponent : BaseEntity
{
    public long BgvOrderId { get; set; }
    public BgvOrder BgvOrder { get; set; } = null!;
    
    public long ComponentId { get; set; }
    public BgvComponentsCatalog Component { get; set; } = null!;
    
    public int InstanceIndex { get; set; }
    public ComponentStatus Status { get; set; } = ComponentStatus.NotStarted;
    public string? RawInputJson { get; set; }
    public string? RawResultJson { get; set; }
    public DateTimeOffset LastStatusChangeAt { get; set; } = DateTimeOffset.UtcNow;
}

public class BgvOrderEvent : BaseEntity
{
    public long BgvOrderId { get; set; }
    public BgvOrder BgvOrder { get; set; } = null!;
    
    public long? ComponentId { get; set; }
    public BgvComponentsCatalog? Component { get; set; }
    
    public string EventType { get; set; } = string.Empty;
    public string EventSource { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? PayloadJson { get; set; }
    
    public long? CreatedByAccountId { get; set; }
}

public class CandidateDocumentRequirement : BaseEntity
{
    public long CandidateId { get; set; }
    public Candidate Candidate { get; set; } = null!;
    
    public long? BgvOrderId { get; set; }
    public BgvOrder? BgvOrder { get; set; }
    
    public long RequirementId { get; set; }
    public DocumentRequirement Requirement { get; set; } = null!;
    
    public string Status { get; set; } = "pending";
    public DateTimeOffset? FulfilledAt { get; set; }
    public long? WaivedByAdminId { get; set; }
    public string? WaivedReason { get; set; }
}

