using System;
using System.Collections.Generic;
using EvalRight.Domain.Enums;

namespace EvalRight.Domain.Entities;

public class WebhookEvent : BaseEntity
{
    public string SourceSystem { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string? RequestPath { get; set; }
    public string? HeadersJson { get; set; }
    public string? PayloadRaw { get; set; }
    public string? ExternalReferenceIdsJson { get; set; }
    
    public long? RelatedOrderId { get; set; }
    public BgvOrder? RelatedOrder { get; set; }
    
    public long? RelatedCandidateId { get; set; }
    public Candidate? RelatedCandidate { get; set; }
    
    public WebhookProcessingStatus ProcessingStatus { get; set; } = WebhookProcessingStatus.Pending;
    public string? ProcessingError { get; set; }
    public DateTimeOffset ReceivedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ProcessedAt { get; set; }
}

public class AuditLog : BaseEntity
{
    public long? ActorAccountId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public long EntityId { get; set; }
    public string? ChangesJson { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}

public class JobQueue : BaseEntity
{
    public string JobType { get; set; } = string.Empty;
    public string PayloadJson { get; set; } = string.Empty;
    public int Priority { get; set; }
    public DateTimeOffset RunAt { get; set; } = DateTimeOffset.UtcNow;
    public string Status { get; set; } = "queued";
    public int Attempts { get; set; }
    public string? LastError { get; set; }
    public DateTimeOffset? LastRunAt { get; set; }
}

public class CandidateTimelineEvent : BaseEntity
{
    public long CandidateId { get; set; }
    public Candidate Candidate { get; set; } = null!;
    
    public long? BgvOrderId { get; set; }
    public BgvOrder? BgvOrder { get; set; }
    
    public string EventType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? MetadataJson { get; set; }
    
    public long? CreatedBy { get; set; }
}

