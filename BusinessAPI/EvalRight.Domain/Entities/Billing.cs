using System;
using System.Collections.Generic;
using EvalRight.Domain.Enums;

namespace EvalRight.Domain.Entities;

public class BillingCustomer : BaseEntity
{
    public long ClientId { get; set; }
    public Client Client { get; set; } = null!;
    
    public string StripeCustomerId { get; set; } = string.Empty;
    public long? DefaultPaymentMethodId { get; set; }
}

public class BillingPaymentMethod : BaseEntity
{
    public long BillingCustomerId { get; set; }
    public BillingCustomer BillingCustomer { get; set; } = null!;
    
    public string StripePaymentMethodId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string? Last4 { get; set; }
    public int? ExpMonth { get; set; }
    public int? ExpYear { get; set; }
    public bool IsDefault { get; set; }
}

public class BillingOrder : BaseEntity
{
    public long ClientId { get; set; }
    public Client Client { get; set; } = null!;
    
    public long BgvOrderId { get; set; }
    public BgvOrder BgvOrder { get; set; } = null!;
    
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string PricingSnapshotJson { get; set; } = "{}";
    public string Status { get; set; } = "payment_pending";
}

public class Invoice : BaseEntity
{
    public long ClientId { get; set; }
    public Client Client { get; set; } = null!;
    
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateOnly? BillingPeriodStart { get; set; }
    public DateOnly? BillingPeriodEnd { get; set; }
    public DateOnly IssueDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly? DueDate { get; set; }
    
    public decimal SubtotalAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    
    public string? StripeInvoiceId { get; set; }
    public DateTimeOffset? AutopayAttemptedAt { get; set; }
    public string? AutopayLastError { get; set; }
    
    public ICollection<InvoiceLineItem> LineItems { get; set; } = new List<InvoiceLineItem>();
    public ICollection<InvoicePayment> Payments { get; set; } = new List<InvoicePayment>();
}

public class InvoiceLineItem : BaseEntity
{
    public long InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;
    
    public long? BillingOrderId { get; set; }
    public BillingOrder? BillingOrder { get; set; }
    
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }
    public decimal? TaxRate { get; set; }
    public string? MetadataJson { get; set; }
}

public class InvoicePayment : BaseEntity
{
    public long InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;
    
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateOnly PaymentDate { get; set; }
    public string Source { get; set; } = string.Empty;
    
    public string? StripePaymentIntentId { get; set; }
    public string? StripeChargeId { get; set; }
    public string? Reference { get; set; }
    public long? RecordedByAdminId { get; set; }
}

public class ClientTransaction : BaseEntity
{
    public long ClientId { get; set; }
    public Client Client { get; set; } = null!;
    
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateOnly TransactionDate { get; set; }
    public string? ReferenceId { get; set; }
    public string? Notes { get; set; }
    public long? CreatedByAdminId { get; set; }
}

