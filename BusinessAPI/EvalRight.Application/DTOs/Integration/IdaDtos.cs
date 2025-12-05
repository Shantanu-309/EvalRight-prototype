namespace EvalRight.Application.DTOs.Integration;

public class IdaCreateCaseRequest
{
    public string ClientReferenceId { get; set; } = string.Empty; // Order ID
    public IdaCandidateInfo Candidate { get; set; } = new();
    public string PackageId { get; set; } = string.Empty;
    public string CallbackUrl { get; set; } = string.Empty;
}

public class IdaCandidateInfo
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class IdaCreateCaseResponse
{
    public string CaseId { get; set; } = string.Empty; // IDA Reference
    public string CandidateId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class IdaWebhookPayload
{
    public string EventType { get; set; } = string.Empty; // STATUS_UPDATE, REPORT_READY
    public string CaseId { get; set; } = string.Empty;
    public string CandidateId { get; set; } = string.Empty;
    public string CurrentStatus { get; set; } = string.Empty;
    public DateTimeOffset Timestamp { get; set; }
    public object? Details { get; set; }
}

public class IdaReportResponse
{
    public string CaseId { get; set; } = string.Empty;
    public string OverallResult { get; set; } = string.Empty; // CLEAR, ADVERSE
    public string PdfDownloadUrl { get; set; } = string.Empty;
    public object ReportData { get; set; } = new();
}

