using EvalRight.Domain.Entities;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EvalRight.Infrastructure.Persistence.Configurations;

public class ClientGroupConfiguration : IEntityTypeConfiguration<ClientGroup>
{
    public void Configure(EntityTypeBuilder<ClientGroup> builder)
    {
        builder.HasIndex(x => x.Code).IsUnique();
    }
}

public class ClientConfiguration : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> builder)
    {
        builder.Property(x => x.Status).HasConversion<string>();
        builder.Property(x => x.BillingMode).HasConversion<string>();
        
        builder.HasOne(x => x.Settings)
            .WithOne(x => x.Client)
            .HasForeignKey<ClientSettings>(x => x.ClientId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ClientPackageOverrideConfiguration : IEntityTypeConfiguration<ClientPackageOverride>
{
    public void Configure(EntityTypeBuilder<ClientPackageOverride> builder)
    {
        builder.HasIndex(x => new { x.ClientId, x.PackageId }).IsUnique();
    }
}

public class ClientSettingsConfiguration : IEntityTypeConfiguration<ClientSettings>
{
    public void Configure(EntityTypeBuilder<ClientSettings> builder)
    {
        builder.Property(x => x.DefaultRegion).HasConversion<string>();
    }
}

