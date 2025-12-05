using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Candidate;
using EvalRight.Application.Interfaces;
using EvalRight.Domain.Entities;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace EvalRight.Application.Services;

public class CandidatePortalService : ICandidatePortalService
{
    private readonly IEvalRightDbContext _context;
    private readonly IConfiguration _configuration;

    public CandidatePortalService(IEvalRightDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<CandidateAuthResponse> AuthenticateAsync(string invitationToken)
    {
        var invitation = await _context.CandidateInvitations
            .Include(i => i.Candidate)
            .FirstOrDefaultAsync(i => i.InvitationToken == invitationToken);

        if (invitation == null) throw new Exception("Invalid token");
        if (invitation.ExpiresAt < DateTimeOffset.UtcNow) throw new Exception("Token expired");
        if (invitation.Status == "cancelled") throw new Exception("Invitation cancelled");
        
        // Ensure Candidate exists (should be linked)
        var candidate = invitation.Candidate;
        if (candidate == null) throw new Exception("Candidate record not found");

        // Create Account if missing
        if (candidate.AccountId == null)
        {
            // Check if account with email exists
            var existingAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.Email == candidate.Email);
            if (existingAccount == null)
            {
                existingAccount = new Account
                {
                    Email = candidate.Email,
                    Status = AccountStatus.Active,
                    IsEmailVerified = true // Verified via email link
                };
                
                 existingAccount.Profile = new UserProfile
                {
                    FirstName = candidate.FirstName,
                    LastName = candidate.LastName,
                    Phone = candidate.Phone
                };
                
                _context.Accounts.Add(existingAccount);
                await _context.SaveChangesAsync();
            }

            // Assign Candidate Role
            var candidateRole = await _context.Roles.FirstOrDefaultAsync(r => r.Code == "candidate");
            if (candidateRole == null)
            {
                candidateRole = new Role { Code = "candidate", Description = "Candidate" };
                _context.Roles.Add(candidateRole);
                await _context.SaveChangesAsync();
            }

            if (!await _context.AccountRoles.AnyAsync(ar => ar.AccountId == existingAccount.Id && ar.RoleId == candidateRole.Id))
            {
                _context.AccountRoles.Add(new AccountRole
                {
                    AccountId = existingAccount.Id,
                    RoleId = candidateRole.Id,
                    ScopeType = "candidate",
                    ScopeId = candidate.Id
                });
            }

            candidate.AccountId = existingAccount.Id;
            invitation.Status = "accepted";
            invitation.AcceptedAt = DateTimeOffset.UtcNow;
            
            await _context.SaveChangesAsync();
        }

        // Generate Token
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]!);
        
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, candidate.AccountId.ToString()!),
            new Claim(ClaimTypes.Email, candidate.Email),
            new Claim(ClaimTypes.Role, "candidate"),
            new Claim("candidate_id", candidate.Id.ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["Jwt:ExpiryMinutes"] ?? "120")),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"]
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return new CandidateAuthResponse
        {
            Token = tokenHandler.WriteToken(token),
            CandidateName = $"{candidate.FirstName} {candidate.LastName}",
            CandidateId = candidate.Id
        };
    }

    public async Task<CandidateProfileDto> GetProfileAsync(long candidateId)
    {
        var candidate = await _context.Candidates
            .FirstOrDefaultAsync(c => c.Id == candidateId);

        if (candidate == null) throw new Exception("Candidate not found");

        // Get Tasks
        // Hardcoded list for now based on standard package, or fetch from TaskStatus
        // In real app, we check BgvOrder -> Package -> Components -> Required Tasks logic
        // For now, returning basic tasks
        
        var tasks = new List<CandidateTaskDto>
        {
            new CandidateTaskDto { TaskCode = "PERSONAL_INFO", Status = "pending", IsEditable = true },
            new CandidateTaskDto { TaskCode = "ADDRESS_HISTORY", Status = "pending", IsEditable = true },
            new CandidateTaskDto { TaskCode = "EMPLOYMENT", Status = "pending", IsEditable = true },
            new CandidateTaskDto { TaskCode = "EDUCATION", Status = "pending", IsEditable = true },
            new CandidateTaskDto { TaskCode = "DOCUMENTS", Status = "pending", IsEditable = true }
        };

        return new CandidateProfileDto
        {
            CandidateId = candidate.Id,
            FirstName = candidate.FirstName,
            LastName = candidate.LastName,
            Tasks = tasks
        };
    }

    public async Task UpdateTaskDataAsync(long candidateId, string taskCode, string dataJson)
    {
        var profileData = await _context.CandidateProfileData
            .FirstOrDefaultAsync(p => p.CandidateId == candidateId && p.TaskCode == taskCode);

        if (profileData == null)
        {
            profileData = new CandidateProfileData
            {
                CandidateId = candidateId,
                TaskCode = taskCode,
                DataJson = dataJson
            };
            _context.CandidateProfileData.Add(profileData);
        }
        else
        {
            profileData.DataJson = dataJson;
            profileData.UpdatedAt = DateTimeOffset.UtcNow;
        }

        await _context.SaveChangesAsync();
    }
}

