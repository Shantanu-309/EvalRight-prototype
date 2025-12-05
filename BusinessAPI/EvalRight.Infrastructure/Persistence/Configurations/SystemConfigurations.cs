using EvalRight.Domain.Entities;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EvalRight.Infrastructure.Persistence.Configurations;

public class BillingCustomerConfiguration : IEntityTypeConfiguration<BillingCustomer>
{
    public void Configure(EntityTypeBuilder<BillingCustomer> builder)
    {
        builder.HasIndex(x => x.ClientId).IsUnique();
    }
}

public class BillingOrderConfiguration : IEntityTypeConfiguration<BillingOrder>
{
    public void Configure(EntityTypeBuilder<BillingOrder> builder)
    {
        builder.HasIndex(x => x.BgvOrderId).IsUnique();
    }
}

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.HasIndex(x => x.InvoiceNumber).IsUnique();
        builder.Property(x => x.Status).HasConversion<string>();
    }
}

public class WebhookEventConfiguration : IEntityTypeConfiguration<WebhookEvent>
{
    public void Configure(EntityTypeBuilder<WebhookEvent> builder)
    {
        builder.Property(x => x.ProcessingStatus).HasConversion<string>();
    }
}

