using EvalRight.Domain.Entities;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EvalRight.Infrastructure.Persistence.Configurations;

public class BgvOrderConfiguration : IEntityTypeConfiguration<BgvOrder>
{
    public void Configure(EntityTypeBuilder<BgvOrder> builder)
    {
        builder.Property(x => x.BgvRegion).HasConversion<string>();
        builder.Property(x => x.OverallStatus).HasConversion<string>();
        
        // IDA Case 1:1
        // Relationship defined in IdaCaseConfiguration usually, or here.
    }
}

public class BgvOrderComponentConfiguration : IEntityTypeConfiguration<BgvOrderComponent>
{
    public void Configure(EntityTypeBuilder<BgvOrderComponent> builder)
    {
        builder.HasIndex(x => new { x.BgvOrderId, x.ComponentId, x.InstanceIndex }).IsUnique();
        builder.Property(x => x.Status).HasConversion<string>();
    }
}

public class CandidateDocumentRequirementConfiguration : IEntityTypeConfiguration<CandidateDocumentRequirement>
{
    public void Configure(EntityTypeBuilder<CandidateDocumentRequirement> builder)
    {
        builder.HasIndex(x => new { x.CandidateId, x.BgvOrderId, x.RequirementId }).IsUnique();
    }
}

public class IdaJobRoleConfiguration : IEntityTypeConfiguration<IdaJobRole>
{
    public void Configure(EntityTypeBuilder<IdaJobRole> builder)
    {
        builder.HasIndex(x => new { x.PackageId, x.IdaJobRoleId }).IsUnique();
        builder.Property(x => x.Region).HasConversion<string>();
    }
}

public class IdaCaseConfiguration : IEntityTypeConfiguration<IdaCase>
{
    public void Configure(EntityTypeBuilder<IdaCase> builder)
    {
        builder.HasIndex(x => x.BgvOrderId).IsUnique();
    }
}

