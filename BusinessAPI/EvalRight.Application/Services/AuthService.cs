using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System.Linq;
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
        
        // Check if user has CLIENT role
        var hasClientRole = account.AccountRoles.Any(ar => 
            ar.Role.Code == "client_admin" && ar.ScopeType == "client");
        
        // For CLIENT users, enforce ACTIVE status
        if (hasClientRole)
        {
            if (account.Status == AccountStatus.PendingVerification)
            {
                throw new Exception("Your account is under review. Please wait for approval.");
            }
            
            if (account.Status != AccountStatus.Active)
            {
                throw new Exception("Account is locked or disabled");
            }
        }
        else
        {
            // For non-client users (admin, etc.), allow pending
            if (account.Status == AccountStatus.Disabled || account.Status == AccountStatus.Locked)
            {
                throw new Exception("Account is locked or disabled");
            }
        }

        // Get client_id if user has client role
        long? clientId = null;
        if (hasClientRole)
        {
            var clientRole = account.AccountRoles.FirstOrDefault(ar => 
                ar.Role.Code == "client_admin" && ar.ScopeType == "client");
            if (clientRole != null)
            {
                clientId = clientRole.ScopeId;
            }
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

        if (clientId.HasValue)
        {
            claims.Add(new Claim("company_id", clientId.Value.ToString()));
        }

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

    public async Task<ClientRegistrationResponse> RegisterClientAsync(ClientRegistrationRequest request)
    {
        // Validate password strength
        ValidatePasswordStrength(request.Password);

        // Check if work email (account login email) already exists
        if (await _context.Accounts.AnyAsync(a => a.Email == request.WorkEmail))
        {
            throw new Exception("An account with this work email already exists.");
        }

        // Check if legal name already exists (optional but recommended)
        if (await _context.Clients.AnyAsync(c => c.Name == request.LegalName))
        {
            throw new Exception("A company with this legal name already exists");
        }

        // Validate compliance checkboxes
        if (!request.AcceptTerms || !request.AcceptPrivacyPolicy)
        {
            throw new Exception("You must accept Terms & Conditions and Data Privacy Policy");
        }

        // Create Client (Company)
        var client = new Client
        {
            Name = request.LegalName,
            DisplayName = request.CompanyName,
            Email = request.CompanyEmail, // Store company email in Client entity
            Phone = request.CompanyPhoneNumber, // Store company phone in Client entity
            Industry = request.Industry,
            Country = request.Country,
            Status = ClientStatus.Prospect, // Will be changed to Active when approved
            SignupDate = DateTimeOffset.UtcNow
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync(); // Save to get client.Id

        // Create Account with ACTIVE status (for testing - allows immediate login)
        // Use WorkEmail for login (authorized person's email)
        var account = new Account
        {
            Email = request.WorkEmail, // Changed from CompanyEmail to WorkEmail - user logs in with their work email
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Status = AccountStatus.Active, // Changed from PendingVerification to Active for testing
            IsEmailVerified = false
        };

        // Create UserProfile for authorized person
        account.Profile = new UserProfile
        {
            FirstName = request.FullName.Split(' ').FirstOrDefault() ?? request.FullName,
            LastName = string.Join(" ", request.FullName.Split(' ').Skip(1)),
            Phone = request.WorkPhoneNumber
        };

        // Get or create client_admin role
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Code == "client_admin");
        if (role == null)
        {
            role = new Role 
            { 
                Code = "client_admin", 
                Description = "Client Administrator" 
            };
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
        }

        // Assign client_admin role with client scope
        account.AccountRoles.Add(new AccountRole
        {
            Role = role,
            ScopeType = "client",
            ScopeId = client.Id
        });

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync(); // Save to get account.Id

        // Create ClientContact linking Account to Client
        var contact = new ClientContact
        {
            ClientId = client.Id,
            AccountId = account.Id,
            Name = request.FullName,
            Email = request.WorkEmail,
            Phone = request.WorkPhoneNumber,
            Role = request.Designation,
            IsPrimaryBilling = true,
            IsPrimaryTechnical = true
        };

        _context.ClientContacts.Add(contact);

        // Create ClientSettings
        var settings = new ClientSettings
        {
            ClientId = client.Id
        };
        _context.ClientSettings.Add(settings);

        await _context.SaveChangesAsync();

        return new ClientRegistrationResponse
        {
            Success = true,
            Message = "Your account has been created successfully. You can now log in.",
            AccountId = account.Id,
            ClientId = client.Id
        };
    }

    private void ValidatePasswordStrength(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new Exception("Password is required");
        }

        if (password.Length < 8)
        {
            throw new Exception("Password must be at least 8 characters long");
        }

        if (!Regex.IsMatch(password, @"[A-Z]"))
        {
            throw new Exception("Password must contain at least one uppercase letter");
        }

        if (!Regex.IsMatch(password, @"[a-z]"))
        {
            throw new Exception("Password must contain at least one lowercase letter");
        }

        if (!Regex.IsMatch(password, @"[0-9]"))
        {
            throw new Exception("Password must contain at least one number");
        }

        if (!Regex.IsMatch(password, @"[^A-Za-z0-9]"))
        {
            throw new Exception("Password must contain at least one special character");
        }
    }
}

