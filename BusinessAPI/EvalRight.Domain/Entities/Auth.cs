using System;
using System.Collections.Generic;
using EvalRight.Domain.Enums;

namespace EvalRight.Domain.Entities;

public class Account : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public AccountStatus Status { get; set; } = AccountStatus.PendingVerification;
    public bool IsEmailVerified { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }

    public UserProfile? Profile { get; set; }
    public ICollection<AccountRole> AccountRoles { get; set; } = new List<AccountRole>();
    public ICollection<AuthSession> AuthSessions { get; set; } = new List<AuthSession>();
}

public class UserProfile
{
    public long AccountId { get; set; }
    public Account Account { get; set; } = null!;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Timezone { get; set; }
    public string? Locale { get; set; }
    public string? AvatarUrl { get; set; }
}

public class Role : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class AccountRole
{
    public long AccountId { get; set; }
    public Account Account { get; set; } = null!;
    
    public long RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public string ScopeType { get; set; } = "global"; // global, client, candidate
    public long ScopeId { get; set; }

    public long? AssignedById { get; set; }
    public Account? AssignedBy { get; set; }
    
    public DateTimeOffset AssignedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class AuthSession : BaseEntity
{
    public long AccountId { get; set; }
    public Account Account { get; set; } = null!;
    public string RefreshTokenHash { get; set; } = string.Empty;
    public string? UserAgent { get; set; }
    public System.Net.IPAddress? IpAddress { get; set; } // Using IPAddress type or string? DB has INET. String is safer for EF sometimes, but Npgsql supports IPAddress. I'll use string for simplicity unless I need specific IP logic. 
    // Actually, sticking to string for IP is often easier for serialization/mapping unless using Npgsql specific types everywhere.
    // Let's use string for IPAddress to be safe with standard mapping for now.
    // Wait, DB schema says INET. Npgsql maps INET to IPAddress.
    // I'll stick to string for generic compatibility, but if using Npgsql directly, IPAddress is better. 
    // Let's use string for simplicity in the entity.
    
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public string? RevokedReason { get; set; }
}

