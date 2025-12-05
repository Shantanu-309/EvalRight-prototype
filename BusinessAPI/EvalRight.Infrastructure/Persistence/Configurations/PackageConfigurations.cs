using EvalRight.Domain.Entities;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EvalRight.Infrastructure.Persistence.Configurations;

public class BgvComponentsCatalogConfiguration : IEntityTypeConfiguration<BgvComponentsCatalog>
{
    public void Configure(EntityTypeBuilder<BgvComponentsCatalog> builder)
    {
        builder.HasIndex(x => x.Code).IsUnique();
        builder.Property(x => x.DefaultRegion).HasConversion<string>();
    }
}

public class BgvPackageConfiguration : IEntityTypeConfiguration<BgvPackage>
{
    public void Configure(EntityTypeBuilder<BgvPackage> builder)
    {
        builder.HasIndex(x => x.Code).IsUnique();
        builder.Property(x => x.RegionScope).HasConversion<string>();
    }
}

public class BgvPackageComponentConfiguration : IEntityTypeConfiguration<BgvPackageComponent>
{
    public void Configure(EntityTypeBuilder<BgvPackageComponent> builder)
    {
        builder.HasIndex(x => new { x.PackageId, x.ComponentId }).IsUnique();
    }
}

