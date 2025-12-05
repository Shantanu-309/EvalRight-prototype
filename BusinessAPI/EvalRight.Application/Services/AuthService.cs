using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Auth;
using EvalRight.Application.Interfaces;
using EvalRight.Domain.Entities;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;

namespace EvalRight.Application.Services;

public class AuthService : IAuthService
{
    private readonly IEvalRightDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(IEvalRightDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var account = await _context.Accounts
            .Include(a => a.Profile)
            .Include(a => a.AccountRoles)
            .ThenInclude(ar => ar.Role)
            .FirstOrDefaultAsync(a => a.Email == request.Email);

        if (account == null || string.IsNullOrEmpty(account.PasswordHash))
        {
            throw new Exception("Invalid credentials");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, account.PasswordHash))
        {
            throw new Exception("Invalid credentials");
        }
        
        if (account.Status != AccountStatus.Active)
        {
             // For simplicity, allowing pending for now or check specifically
             if (account.Status == AccountStatus.Disabled || account.Status == AccountStatus.Locked)
                 throw new Exception("Account is locked or disabled");
        }

        // Generate Token
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]!);
        
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new Claim(ClaimTypes.Email, account.Email),
            new Claim(ClaimTypes.Name, $"{account.Profile?.FirstName} {account.Profile?.LastName}")
        };

        foreach (var ar in account.AccountRoles)
        {
            claims.Add(new Claim(ClaimTypes.Role, ar.Role.Code));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["Jwt:ExpiryMinutes"] ?? "120")),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"]
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        // Update Last Login
        account.LastLoginAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync();

        return new LoginResponse
        {
            Token = tokenString,
            RefreshToken = Guid.NewGuid().ToString(), // Implement real refresh token logic later
            AccountId = account.Id,
            Email = account.Email,
            Name = $"{account.Profile?.FirstName} {account.Profile?.LastName}",
            Roles = account.AccountRoles.Select(r => r.Role.Code).ToList()
        };
    }

    public async Task<Account> RegisterAsync(RegisterRequest request, string roleCode)
    {
        if (await _context.Accounts.AnyAsync(a => a.Email == request.Email))
        {
            throw new Exception("Email already exists");
        }

        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Code == roleCode);
        if (role == null)
        {
             // Create role if not exists (seed logic usually, but for now auto-create)
             role = new Role { Code = roleCode, Description = roleCode };
             _context.Roles.Add(role);
             await _context.SaveChangesAsync();
        }

        var account = new Account
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Status = AccountStatus.Active,
            IsEmailVerified = false // Needs verification flow
        };

        account.Profile = new UserProfile
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone
        };

        account.AccountRoles.Add(new AccountRole
        {
            Role = role,
            ScopeType = "global", 
            ScopeId = 0 // Global scope
        });

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();

        return account;
    }
}

