using System;
using System.Collections.Generic;
using EvalRight.Domain.Enums;

namespace EvalRight.Domain.Entities;

public class BgvComponentsCatalog : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public BgvRegion DefaultRegion { get; set; } = BgvRegion.In;
    public bool SupportsMultipleInstances { get; set; }
    public int? DefaultTurnaroundDays { get; set; }
    public bool IsActive { get; set; } = true;
}

public class BgvPackage : BaseEntity
{
    public long? ClientId { get; set; }
    // public Client? Client { get; set; }
    
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BgvRegion RegionScope { get; set; } = BgvRegion.Both;
    public bool IsPreset { get; set; } = true;
    public bool IsPublic { get; set; } = true;
    public string Status { get; set; } = "active";
    
    public long? CreatedByAdminId { get; set; }
    public ICollection<BgvPackageComponent> PackageComponents { get; set; } = new List<BgvPackageComponent>();
}

public class BgvPackageComponent : BaseEntity
{
    public long PackageId { get; set; }
    public BgvPackage Package { get; set; } = null!;
    
    public long ComponentId { get; set; }
    public BgvComponentsCatalog Component { get; set; } = null!;
    
    public bool IsRequired { get; set; } = true;
    public int DefaultQuantity { get; set; } = 1;
    public int SortOrder { get; set; }
}

public class DocumentRequirement : BaseEntity
{
    public long? PackageId { get; set; }
    public BgvPackage? Package { get; set; }
    
    public long? ComponentId { get; set; }
    public BgvComponentsCatalog? Component { get; set; }
    
    public string DocumentType { get; set; } = string.Empty;
    public bool IsMandatory { get; set; } = true;
    public string? Instructions { get; set; }
    public int MinCount { get; set; } = 1;
    public int? MaxCount { get; set; }
}

