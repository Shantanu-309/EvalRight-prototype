using EvalRight.Domain.Entities;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EvalRight.Infrastructure.Persistence.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.HasIndex(x => x.Email).IsUnique();
        builder.Property(x => x.Status).HasConversion<string>();
        
        builder.HasOne(x => x.Profile)
            .WithOne(x => x.Account)
            .HasForeignKey<UserProfile>(x => x.AccountId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.HasIndex(x => x.Code).IsUnique();
    }
}

public class AccountRoleConfiguration : IEntityTypeConfiguration<AccountRole>
{
    public void Configure(EntityTypeBuilder<AccountRole> builder)
    {
        builder.HasKey(x => new { x.AccountId, x.RoleId, x.ScopeType, x.ScopeId }); // Composite key from schema
        // Note: EF Core might complain if ScopeId is nullable in a key.
        // Schema: PRIMARY KEY (account_id, role_id, scope_type, scope_id)
        // Schema says scope_id is BIGINT, implies NOT NULL if in PK? 
        // Checking schema: "scope_id BIGINT" - it doesn't say NOT NULL explicitly but it's part of PK so it must be NOT NULL in SQL.
        // But logic says ScopeId might be null for global?
        // Ah, typically in DB if part of PK it cannot be null.
        // Let's re-read the schema line: 
        // "scope_id    BIGINT,"
        // "PRIMARY KEY (account_id, role_id, scope_type, scope_id)"
        // If scope_id is null for global, how is it in PK? Maybe they use 0? Or maybe the schema implies it's not null.
        // If scope_type is 'global', scope_id probably holds a dummy value like 0.
        // In Domain Entity I made it nullable long?. I should probably change it to long and default to 0 if I strictly follow schema PK.
        // OR I can use a surrogate key ID for AccountRole and make the combination a unique index allowing nulls (if DB supports unique with nulls differently).
        // The schema uses composite PK. So I must stick to it. I will assume 0 for nulls in the application logic or change entity.
        // For now, I'll configure it as is, but EF will require ScopeId to be non-nullable if it's a Key.
        // I will change the Entity AccountRole ScopeId to long (non-nullable) in a separate step or just assume the entity definition was `long`?
        // I defined it as `long?`. I need to fix `AccountRole` entity or change the Key configuration.
        // Given I already wrote the entity, I'll update the Key to be a Unique Index instead and let EF generate a shadow PK or use a shadow property?
        // No, the schema defines the table structure. 
        // Let's assume for now I'll fix the entity or use HasNoKey and manage it manually? No, EF needs a key.
        // I'll update the entity definition in my mind to `long` and default to 0 for now. Or I will treat it as `long` in configuration and EF will scream if I try to map `long?` property to `long` key.
        
        // BETTER APPROACH: Use a surrogate key in EF (Shadow Property) or just trust the schema. 
        // Wait, looking at schema again: `scope_id BIGINT`. PostgreSQL allows NULL in columns, but NOT in PK columns.
        // So `scope_id` MUST be NOT NULL in the DB.
        // So my Entity `long?` is wrong matching the schema PK.
        // I will fix `AccountRole` entity in the next step.
        
        builder.Property(x => x.ScopeId).IsRequired(); // Make it required matching PK
    }
}

