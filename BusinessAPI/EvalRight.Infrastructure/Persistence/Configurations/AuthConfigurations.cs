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
        
        // Configure AccountRoles relationship
        builder.HasMany(x => x.AccountRoles)
            .WithOne(x => x.Account)
            .HasForeignKey(x => x.AccountId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Configure AuthSessions relationship
        builder.HasMany(x => x.AuthSessions)
            .WithOne(x => x.Account)
            .HasForeignKey(x => x.AccountId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        // Use AccountId as both primary key and foreign key (one-to-one relationship)
        builder.HasKey(x => x.AccountId);
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
        
        // Configure relationship to Account
        builder.HasOne(x => x.Account)
            .WithMany(x => x.AccountRoles)
            .HasForeignKey(x => x.AccountId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Configure relationship to Role
        builder.HasOne(x => x.Role)
            .WithMany()
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Configure optional AssignedBy relationship
        builder.HasOne(x => x.AssignedBy)
            .WithMany()
            .HasForeignKey(x => x.AssignedById)
            .OnDelete(DeleteBehavior.SetNull);
        
        builder.Property(x => x.ScopeId).IsRequired(); // Make it required matching PK
    }
}
