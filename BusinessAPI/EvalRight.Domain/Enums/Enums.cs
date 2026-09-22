namespace EvalRight.Domain.Enums;

public enum AccountStatus
{
    Active,
    Locked,
    PendingVerification,
    Disabled
}

public enum ClientStatus
{
    Prospect,
    Active,
    Suspended,
    Terminated
}

public enum BillingMode
{
    PrepaidPerOrder,
    PostpaidMonthly
}

public enum CandidateStatus
{
    Invited,
    ProfilePending,
    Submitted,
    AwaitingDocuments,
    InVerification,
    Clear,
    Adverse,
    Withdrawn
}

public enum BgvRegion
{
    Us,
    In,
    Both
}

public enum BgvOrderStatus
{
    Draft,
    AwaitingCandidate,
    AwaitingDocuments,
    AwaitingPayment,
    PaymentFailed,
    QueuedForVendor,
    InProgress,
    Clear,
    Adverse,
    Closed,
    Cancelled
}

public enum ComponentStatus
{
    NotStarted,
    Queued,
    InProgress,
    Insufficient,
    Clear,
    Discrepancy,
    UnableToVerify,
    Cancelled
}

public enum InvoiceStatus
{
    Draft,
    Sent,
    PartiallyPaid,
    Paid,
    Overdue,
    Void
}

public enum WebhookProcessingStatus
{
    Pending,
    Processed,
    Failed,
    Ignored
}

