using System;
using System.Collections.Generic;
using System.Text.Json;
using EvalRight.Domain.Enums;

namespace EvalRight.Domain.Entities;

public class ClientGroup : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class Client : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? Industry { get; set; }
    public string? Country { get; set; }
    
    public long? ClientGroupId { get; set; }
    public ClientGroup? ClientGroup { get; set; }
    
    public bool TaxExempt { get; set; }
    public string? TaxExemptionDetails { get; set; }
    
    public ClientStatus Status { get; set; } = ClientStatus.Prospect;
    public BillingMode BillingMode { get; set; } = BillingMode.PrepaidPerOrder;
    public bool AutopayEnabled { get; set; }
    public string DefaultCurrency { get; set; } = "USD";
    public DateTimeOffset? SignupDate { get; set; }

    public ICollection<ClientBranch> Branches { get; set; } = new List<ClientBranch>();
    public ICollection<ClientContact> Contacts { get; set; } = new List<ClientContact>();
    public ClientSettings? Settings { get; set; }
}

public class ClientBranch : BaseEntity
{
    public long ClientId { get; set; }
    public Client Client { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    
    public bool IsPrimary { get; set; }
    public string Status { get; set; } = "active";
}

public class ClientContact : BaseEntity
{
    public long ClientId { get; set; }
    public Client Client { get; set; } = null!;
    
    public long? AccountId { get; set; }
    public Account? Account { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Role { get; set; }
    
    public bool IsPrimaryBilling { get; set; }
    public bool IsPrimaryTechnical { get; set; }
}

public class ClientSettings : BaseEntity
{
    public long ClientId { get; set; }
    public Client Client { get; set; } = null!;
    
    public BgvRegion DefaultRegion { get; set; } = BgvRegion.In;
    public int InviteExpiryDays { get; set; } = 7;
    public string? PermissiblePurpose { get; set; }
    public string? BusinessType { get; set; }
    public bool RequireCandidateConsent { get; set; } = true;
    public bool AllowALaCarteComponents { get; set; }
}

public class ClientRegistrationForm : BaseEntity
{
    public long? ClientId { get; set; }
    public Client? Client { get; set; }
    
    public long? SubmittedByAccountId { get; set; }
    public Account? SubmittedByAccount { get; set; }
    
    public string RawPayloadJson { get; set; } = "{}"; // Store as string for EF, usage of JSONB needs mapping
    
    public string Status { get; set; } = "submitted";
    
    public long? ReviewedByAdminId { get; set; }
    public Account? ReviewedByAdmin { get; set; }
    
    public string? ReviewNotes { get; set; }
    public DateTimeOffset? AgreedTosAt { get; set; }
    public string? AgreedName { get; set; }
    public string? AgreedTitle { get; set; }
}

public class ClientPackageOverride : BaseEntity
{
    public long ClientId { get; set; }
    public Client Client { get; set; } = null!;
    
    public long PackageId { get; set; } // FK to BgvPackage
    // public BgvPackage Package { get; set; } // Circular dependency if defined here? No, but let's keep separate files.
    
    public bool IsEnabled { get; set; } = true;
    public string? CustomDisplayName { get; set; }
    public string? OverridePricingJson { get; set; }
}

