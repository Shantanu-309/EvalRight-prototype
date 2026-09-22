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
using Microsoft.AspNetCore.Http;

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

        if (invitation == null) throw new Exception("Invalid or expired link");
        if (invitation.ExpiresAt < DateTimeOffset.UtcNow) throw new Exception("Invalid or expired link");
        if (invitation.Status == "cancelled") throw new Exception("Invalid or expired link");
        if (invitation.Status == "accepted" || invitation.AcceptedAt.HasValue) throw new Exception("This invitation link has already been used");
        
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
            // Don't mark invitation as accepted yet - will be marked after form submission
            // invitation.Status = "accepted";
            // invitation.AcceptedAt = DateTimeOffset.UtcNow;
            
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
        // Always save to CandidateProfileData for audit/backup
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

        // Also update domain entities based on task code
        var candidate = await _context.Candidates
            .Include(c => c.Addresses)
            .Include(c => c.Educations)
            .Include(c => c.Employments)
            .FirstOrDefaultAsync(c => c.Id == candidateId);

        if (candidate == null)
        {
            throw new Exception("Candidate not found");
        }

        switch (taskCode.ToUpperInvariant())
        {
            case "PERSONAL_INFO":
            case "IDENTITY": // Support both task codes
                var personalInfo = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(dataJson);
                if (personalInfo != null)
                {
                    // Handle fullName - split into firstName and lastName
                    if (personalInfo.ContainsKey("fullName") && personalInfo["fullName"] != null)
                    {
                        var fullName = personalInfo["fullName"].ToString() ?? "";
                        var nameParts = fullName.Trim().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                        if (nameParts.Length > 0)
                            candidate.FirstName = nameParts[0];
                        if (nameParts.Length > 1)
                            candidate.LastName = string.Join(" ", nameParts.Skip(1));
                    }
                    else
                    {
                        if (personalInfo.ContainsKey("firstName") && personalInfo["firstName"] != null)
                            candidate.FirstName = personalInfo["firstName"].ToString() ?? candidate.FirstName;
                        if (personalInfo.ContainsKey("lastName") && personalInfo["lastName"] != null)
                            candidate.LastName = personalInfo["lastName"].ToString() ?? candidate.LastName;
                    }
                    
                    if (personalInfo.ContainsKey("middleName") && personalInfo["middleName"] != null)
                        candidate.MiddleName = personalInfo["middleName"].ToString();
                    if (personalInfo.ContainsKey("email") && personalInfo["email"] != null)
                        candidate.Email = personalInfo["email"].ToString() ?? candidate.Email;
                    if (personalInfo.ContainsKey("phone") && personalInfo["phone"] != null)
                        candidate.Phone = personalInfo["phone"].ToString();
                    if (personalInfo.ContainsKey("dob") && personalInfo["dob"] != null)
                    {
                        var dobStr = personalInfo["dob"].ToString();
                        if (!string.IsNullOrEmpty(dobStr) && DateOnly.TryParse(dobStr, out var dob))
                            candidate.Dob = dob;
                    }
                    if (personalInfo.ContainsKey("countryOfResidence") && personalInfo["countryOfResidence"] != null)
                        candidate.CountryOfResidence = personalInfo["countryOfResidence"].ToString();
                    // idType, idNumber, documents stored only in JSON
                }
                break;

            case "ADDRESS_HISTORY":
                var addressData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(dataJson);
                if (addressData != null && addressData.ContainsKey("addresses"))
                {
                    var addressesJson = addressData["addresses"].ToString() ?? "[]";
                    var addressesList = System.Text.Json.JsonSerializer.Deserialize<List<Dictionary<string, object>>>(addressesJson) ?? new List<Dictionary<string, object>>();
                    
                    // Only process if addresses array is not empty
                    if (addressesList.Any())
                    {
                        // Remove existing addresses
                        candidate.Addresses.Clear();
                        
                        // Add new addresses
                        foreach (var addrData in addressesList)
                        {
                            var address = new CandidateAddress
                            {
                                CandidateId = candidateId,
                                Type = (addrData.ContainsKey("isCurrent") && 
                                       (addrData["isCurrent"]?.ToString() == "True" || addrData["isCurrent"]?.ToString() == "true" || addrData["isCurrent"]?.ToString() == "1")) 
                                       ? "current" : "previous",
                                AddressLine1 = addrData.ContainsKey("addressLine1") ? addrData["addressLine1"]?.ToString() : null,
                                AddressLine2 = addrData.ContainsKey("addressLine2") ? addrData["addressLine2"]?.ToString() : null,
                                City = addrData.ContainsKey("city") ? addrData["city"]?.ToString() : null,
                                State = addrData.ContainsKey("state") ? addrData["state"]?.ToString() : null,
                                // Support both postalCode and zipCode
                                PostalCode = addrData.ContainsKey("postalCode") ? addrData["postalCode"]?.ToString() 
                                           : addrData.ContainsKey("zipCode") ? addrData["zipCode"]?.ToString() : null,
                                Country = addrData.ContainsKey("country") ? addrData["country"]?.ToString() : null
                            };
                            
                            if (addrData.ContainsKey("fromDate") && !string.IsNullOrEmpty(addrData["fromDate"]?.ToString()))
                            {
                                if (DateOnly.TryParse(addrData["fromDate"].ToString(), out var fromDate))
                                    address.FromDate = fromDate;
                            }
                            if (addrData.ContainsKey("toDate") && !string.IsNullOrEmpty(addrData["toDate"]?.ToString()))
                            {
                                if (DateOnly.TryParse(addrData["toDate"].ToString(), out var toDate))
                                    address.ToDate = toDate;
                            }
                                
                            candidate.Addresses.Add(address);
                        }
                    }
                }
                break;

            case "EDUCATION":
                var educationData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(dataJson);
                if (educationData != null && educationData.ContainsKey("educations"))
                {
                    var educationsJson = educationData["educations"].ToString() ?? "[]";
                    var educationsList = System.Text.Json.JsonSerializer.Deserialize<List<Dictionary<string, object>>>(educationsJson) ?? new List<Dictionary<string, object>>();
                    
                    // Only process if educations array is not empty
                    if (educationsList.Any())
                    {
                        // Remove existing educations
                        candidate.Educations.Clear();
                        
                        // Add new educations
                        foreach (var eduData in educationsList)
                        {
                            // Support both institutionName and institution
                            var institutionName = eduData.ContainsKey("institutionName") ? eduData["institutionName"]?.ToString()
                                                 : eduData.ContainsKey("institution") ? eduData["institution"]?.ToString() : null;
                            
                            var education = new CandidateEducation
                            {
                                CandidateId = candidateId,
                                InstitutionName = institutionName ?? string.Empty,
                                Degree = eduData.ContainsKey("degree") ? eduData["degree"]?.ToString() : null,
                                Major = eduData.ContainsKey("major") ? eduData["major"]?.ToString() : null,
                                Country = eduData.ContainsKey("country") ? eduData["country"]?.ToString() : null,
                                CertificateNumber = eduData.ContainsKey("certificateNumber") ? eduData["certificateNumber"]?.ToString() : null
                            };
                            
                            // Support graduationYear (convert to date) or graduationDate
                            if (eduData.ContainsKey("graduationYear") && !string.IsNullOrEmpty(eduData["graduationYear"]?.ToString()))
                            {
                                if (int.TryParse(eduData["graduationYear"].ToString(), out var year) && year > 1900 && year <= DateTime.Now.Year)
                                    education.ToDate = new DateOnly(year, 12, 31); // Set to end of graduation year
                            }
                            else if (eduData.ContainsKey("graduationDate") && !string.IsNullOrEmpty(eduData["graduationDate"]?.ToString()))
                            {
                                if (DateOnly.TryParse(eduData["graduationDate"].ToString(), out var gradDate))
                                    education.ToDate = gradDate;
                            }
                            
                            // Handle fromDate if provided
                            if (eduData.ContainsKey("fromDate") && !string.IsNullOrEmpty(eduData["fromDate"]?.ToString()))
                            {
                                if (DateOnly.TryParse(eduData["fromDate"].ToString(), out var fromDate))
                                    education.FromDate = fromDate;
                            }
                            
                            candidate.Educations.Add(education);
                        }
                    }
                }
                break;

            case "EMPLOYMENT":
                var employmentData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(dataJson);
                if (employmentData != null && employmentData.ContainsKey("employments"))
                {
                    var employmentsJson = employmentData["employments"].ToString() ?? "[]";
                    var employmentsList = System.Text.Json.JsonSerializer.Deserialize<List<Dictionary<string, object>>>(employmentsJson) ?? new List<Dictionary<string, object>>();
                    
                    // Only process if employments array is not empty
                    if (employmentsList.Any())
                    {
                        // Remove existing employments
                        candidate.Employments.Clear();
                        
                        // Add new employments
                        foreach (var empData in employmentsList)
                        {
                            // Support both jobTitle and designation
                            var designation = empData.ContainsKey("jobTitle") ? empData["jobTitle"]?.ToString()
                                            : empData.ContainsKey("designation") ? empData["designation"]?.ToString() : null;
                            
                            var employment = new CandidateEmployment
                            {
                                CandidateId = candidateId,
                                EmployerName = empData.ContainsKey("employerName") ? empData["employerName"]?.ToString() ?? string.Empty : string.Empty,
                                Designation = designation,
                                IsCurrent = empData.ContainsKey("isCurrent") && 
                                          (empData["isCurrent"]?.ToString() == "True" || empData["isCurrent"]?.ToString() == "true" || empData["isCurrent"]?.ToString() == "1"),
                                Location = empData.ContainsKey("location") ? empData["location"]?.ToString() : null,
                                ContactInfo = empData.ContainsKey("contactInfo") ? empData["contactInfo"]?.ToString() 
                                            : empData.ContainsKey("reasonForLeaving") ? empData["reasonForLeaving"]?.ToString() : null
                            };
                            
                            if (empData.ContainsKey("fromDate") && !string.IsNullOrEmpty(empData["fromDate"]?.ToString()))
                            {
                                if (DateOnly.TryParse(empData["fromDate"].ToString(), out var fromDate))
                                    employment.FromDate = fromDate;
                            }
                            if (empData.ContainsKey("toDate") && !string.IsNullOrEmpty(empData["toDate"]?.ToString()))
                            {
                                if (DateOnly.TryParse(empData["toDate"].ToString(), out var toDate))
                                    employment.ToDate = toDate;
                            }
                                
                            candidate.Employments.Add(employment);
                        }
                    }
                }
                break;
            
            // These task codes are stored only in CandidateProfileData (JSON), not mapped to entities
            case "CRIMINAL":
            case "WORK_AUTHORIZATION":
            case "WORK_AUTH":
            case "DRUG_TEST":
            case "DRUG_SCREENING":
            case "SOCIAL_MEDIA":
            case "REFERENCES":
            case "DOCUMENTS":
            case "CONSENT":
                // Data is already saved to CandidateProfileData above, no additional entity mapping needed
                break;
                
            default:
                // Unknown task code - still save to CandidateProfileData but log warning
                Console.WriteLine($"Warning: Unknown task code '{taskCode}' - data saved to CandidateProfileData only");
                break;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<VerifyTokenResponse> VerifyTokenAsync(string invitationToken)
    {
        var invitation = await _context.CandidateInvitations
            .Include(i => i.Candidate)
            .FirstOrDefaultAsync(i => i.InvitationToken == invitationToken);

        if (invitation == null)
        {
            return new VerifyTokenResponse
            {
                IsValid = false,
                Message = "Invalid or expired link"
            };
        }

        if (invitation.ExpiresAt < DateTimeOffset.UtcNow)
        {
            return new VerifyTokenResponse
            {
                IsValid = false,
                Message = "Invalid or expired link"
            };
        }

        if (invitation.Status == "cancelled")
        {
            return new VerifyTokenResponse
            {
                IsValid = false,
                Message = "Invalid or expired link"
            };
        }

        if (invitation.Status == "accepted" || invitation.AcceptedAt.HasValue)
        {
            return new VerifyTokenResponse
            {
                IsValid = false,
                Message = "This invitation link has already been used"
            };
        }

        var candidate = invitation.Candidate;
        return new VerifyTokenResponse
        {
            IsValid = true,
            Message = "Token is valid",
            CandidateEmail = candidate?.Email ?? invitation.InvitedEmail,
            CandidateName = candidate != null ? $"{candidate.FirstName} {candidate.LastName}" : null
        };
    }

    public async Task<InvitationDetailsResponse> GetInvitationDetailsAsync(long? invitationId, string token)
    {
        Console.WriteLine($"[GetInvitationDetails] InvitationId: {invitationId}, Token: {token?.Substring(0, Math.Min(8, token?.Length ?? 0))}...");

        CandidateInvitation? invitation = null;

        // If invitationId is provided, use it for lookup
        if (invitationId.HasValue && invitationId.Value > 0)
        {
            invitation = await _context.CandidateInvitations
                .Include(i => i.Candidate)
                .FirstOrDefaultAsync(i => i.Id == invitationId.Value);

            Console.WriteLine($"[GetInvitationDetails] Lookup by InvitationId {invitationId}: {(invitation != null ? "Found" : "Not Found")}");

            if (invitation == null)
            {
                throw new Exception("Invalid invitation token");
            }

            // Verify token matches exactly
            if (!string.Equals(invitation.InvitationToken, token, StringComparison.Ordinal))
            {
                Console.WriteLine($"[GetInvitationDetails] Token mismatch for InvitationId {invitationId}");
                throw new Exception("Invalid invitation token");
            }
        }
        else
        {
            // Fallback to token-only lookup
            invitation = await _context.CandidateInvitations
                .Include(i => i.Candidate)
                .FirstOrDefaultAsync(i => i.InvitationToken == token);

            Console.WriteLine($"[GetInvitationDetails] Lookup by Token only: {(invitation != null ? "Found" : "Not Found")}");

            if (invitation == null)
            {
                throw new Exception("Invalid invitation token");
            }
        }

        // Validate expiration
        if (invitation.ExpiresAt < DateTimeOffset.UtcNow)
        {
            Console.WriteLine($"[GetInvitationDetails] Invitation {invitation.Id} is expired");
            throw new Exception("Invalid or expired invitation link");
        }

        // Validate status
        if (invitation.Status == "cancelled")
        {
            Console.WriteLine($"[GetInvitationDetails] Invitation {invitation.Id} is cancelled");
            throw new Exception("Invalid or expired invitation link");
        }

        if (invitation.Status == "accepted" || invitation.AcceptedAt.HasValue)
        {
            Console.WriteLine($"[GetInvitationDetails] Invitation {invitation.Id} is already used");
            throw new Exception("This invitation link has already been used");
        }

        // Validate CandidateId exists
        if (invitation.CandidateId == null || invitation.CandidateId == 0)
        {
            Console.WriteLine($"[GetInvitationDetails] Invitation {invitation.Id} has no CandidateId");
            throw new Exception("Invalid invitation token - candidate not found");
        }

        // Get Client name
        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == invitation.ClientId);
        var employerName = client?.Name ?? client?.DisplayName ?? "Your Employer";

        Console.WriteLine($"[GetInvitationDetails] Invitation {invitation.Id} is VALID, returning details");

        return new InvitationDetailsResponse
        {
            CandidateId = invitation.CandidateId ?? 0,
            OrderId = invitation.BgvOrderId,
            EmployerName = employerName,
            IsSubmitted = invitation.Status == "accepted" || invitation.AcceptedAt.HasValue
        };
    }

    public async Task<IdentityVerificationResponse> VerifyIdentityAsync(IdentityVerificationRequest request)
    {
        var invitation = await _context.CandidateInvitations
            .Include(i => i.Candidate)
            .FirstOrDefaultAsync(i => i.InvitationToken == request.Token);

        if (invitation == null || invitation.Candidate == null)
        {
            return new IdentityVerificationResponse { Verified = false, Message = "Invalid token" };
        }

        var candidate = invitation.Candidate;
        bool verified = false;

        if (request.VerificationMethod == "dob" && !string.IsNullOrEmpty(request.Dob))
        {
            // Check DOB from candidate record or from profile data
            if (candidate.Dob.HasValue)
            {
                if (DateOnly.TryParse(request.Dob, out var requestedDob))
                {
                    verified = candidate.Dob.Value == requestedDob;
                }
            }
            else
            {
                // Try to get from profile data (first-time entry case)
                var profileData = await _context.CandidateProfileData
                    .FirstOrDefaultAsync(p => p.CandidateId == candidate.Id && p.TaskCode == "PERSONAL_INFO");
                
                if (profileData != null)
                {
                    var personalInfo = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(profileData.DataJson);
                    if (personalInfo != null && personalInfo.ContainsKey("dob"))
                    {
                        if (DateOnly.TryParse(personalInfo["dob"]?.ToString(), out var storedDob) &&
                            DateOnly.TryParse(request.Dob, out var requestedDob))
                        {
                            verified = storedDob == requestedDob;
                        }
                    }
                }
            }
        }
        else if (request.VerificationMethod == "ssn" && !string.IsNullOrEmpty(request.SsnLast4))
        {
            // Get SSN from profile data (SSN is stored only in JSON for security)
            var profileData = await _context.CandidateProfileData
                .FirstOrDefaultAsync(p => p.CandidateId == candidate.Id && p.TaskCode == "PERSONAL_INFO");
            
            if (profileData != null)
            {
                var personalInfo = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(profileData.DataJson);
                if (personalInfo != null && personalInfo.ContainsKey("ssn"))
                {
                    var storedSsn = personalInfo["ssn"]?.ToString() ?? "";
                    // Extract last 4 digits (format: XXX-XX-XXXX or just digits)
                    var ssnDigits = storedSsn.Replace("-", "");
                    var last4 = ssnDigits.Length >= 4 ? ssnDigits.Substring(ssnDigits.Length - 4) : "";
                    verified = last4 == request.SsnLast4;
                }
            }
        }

        if (!verified)
        {
            return new IdentityVerificationResponse { Verified = false, Message = "Verification failed. Please check your information and try again." };
        }

        return new IdentityVerificationResponse { Verified = true, Message = "Identity verified" };
    }

    public async Task<FcraTextResponse> GetFcraTextAsync()
    {
        // In production, this could be stored in database or configuration
        var fcraText = @"FAIR CREDIT REPORTING ACT DISCLOSURE

You are hereby notified that a consumer report (background check) may be obtained for employment purposes as part of the pre-employment screening process and/or at any time during your employment.

This report may include information concerning your character, general reputation, personal characteristics, mode of living, credit history, criminal history, driving record, and other information bearing on your credit worthiness, credit standing, credit capacity, character, general reputation, personal characteristics, or mode of living.

The report may be obtained from EvalRight or its designated consumer reporting agency.

You have the right to request additional information about the nature and scope of the investigation. You also have the right to dispute the accuracy or completeness of any information in the report.

By signing below, you acknowledge that you have read and understand this disclosure and authorize the procurement of such reports.";

        return new FcraTextResponse { Text = fcraText };
    }

    public async Task<ConsentSignResponse> SignConsentAsync(ConsentSignRequest request)
    {
        var invitation = await _context.CandidateInvitations
            .FirstOrDefaultAsync(i => i.InvitationToken == request.Token);

        if (invitation == null)
        {
            throw new Exception("Invalid invitation token");
        }

        // Store signature - in production, save to database/file storage
        // For now, we'll store in CandidateProfileData
        var profileData = await _context.CandidateProfileData
            .FirstOrDefaultAsync(p => p.CandidateId == request.CandidateId && p.TaskCode == "CONSENT");

        if (profileData == null)
        {
            profileData = new CandidateProfileData
            {
                CandidateId = request.CandidateId,
                TaskCode = "CONSENT",
                DataJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    signature = request.Signature,
                    timestamp = request.Timestamp,
                    ipAddress = request.IpAddress
                })
            };
            _context.CandidateProfileData.Add(profileData);
        }
        else
        {
            profileData.DataJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                signature = request.Signature,
                timestamp = request.Timestamp,
                ipAddress = request.IpAddress
            });
        }

        await _context.SaveChangesAsync();

        return new ConsentSignResponse
        {
            SignatureId = profileData.Id,
            Success = true
        };
    }

    public async Task<ConsentFileResponse> DownloadConsentAsync(string token)
    {
        var invitation = await _context.CandidateInvitations
            .Include(i => i.Candidate)
            .FirstOrDefaultAsync(i => i.InvitationToken == token);

        if (invitation == null)
        {
            throw new Exception("Invalid invitation token");
        }

        // In production, generate PDF from stored consent data
        // For now, return a simple response
        var pdfContent = System.Text.Encoding.UTF8.GetBytes("FCRA Consent Document - Generated PDF");
        
        return new ConsentFileResponse
        {
            Content = pdfContent,
            ContentType = "application/pdf",
            FileName = $"fcra-consent-{invitation.CandidateId}.pdf"
        };
    }

    public async Task<DocumentUploadResponse> UploadDocumentAsync(long candidateId, string token, string documentType, IFormFile file)
    {
        var invitation = await _context.CandidateInvitations
            .FirstOrDefaultAsync(i => i.InvitationToken == token);

        if (invitation == null)
        {
            throw new Exception("Invalid invitation token");
        }

        // In production, save file to storage (Azure Blob, S3, etc.)
        // For now, store file metadata in database
        using var memoryStream = new System.IO.MemoryStream();
        await file.CopyToAsync(memoryStream);
        var fileBytes = memoryStream.ToArray();

        // Generate a unique file ID for this document upload
        var fileId = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() + new System.Random().Next(1000, 9999);

        // Store in CandidateProfileData
        var profileData = await _context.CandidateProfileData
            .FirstOrDefaultAsync(p => p.CandidateId == candidateId && p.TaskCode == "DOCUMENTS");

        var documentsData = new Dictionary<string, object>();
        if (profileData != null)
        {
            var existing = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(profileData.DataJson);
            if (existing != null) documentsData = existing;
        }

        // Store document with unique file ID
        documentsData[documentType] = new
        {
            fileId = fileId,
            fileName = file.FileName,
            contentType = file.ContentType,
            size = file.Length,
            uploadedAt = DateTimeOffset.UtcNow
        };

        if (profileData == null)
        {
            profileData = new CandidateProfileData
            {
                CandidateId = candidateId,
                TaskCode = "DOCUMENTS",
                DataJson = System.Text.Json.JsonSerializer.Serialize(documentsData)
            };
            _context.CandidateProfileData.Add(profileData);
        }
        else
        {
            profileData.DataJson = System.Text.Json.JsonSerializer.Serialize(documentsData);
        }

        await _context.SaveChangesAsync();

        return new DocumentUploadResponse
        {
            FileId = fileId,
            FileName = file.FileName,
            FileUrl = $"/api/candidate/file/{documentType}/{fileId}" // In production, use actual storage URL
        };
    }

    public async Task SubmitSocialMediaAsync(SocialMediaRequest request)
    {
        var invitation = await _context.CandidateInvitations
            .FirstOrDefaultAsync(i => i.InvitationToken == request.Token);

        if (invitation == null)
        {
            throw new Exception("Invalid invitation token");
        }

        // Store social media data
        var profileData = await _context.CandidateProfileData
            .FirstOrDefaultAsync(p => p.CandidateId == request.CandidateId && p.TaskCode == "SOCIAL_MEDIA");

        var socialData = new
        {
            consentGiven = request.ConsentGiven,
            profiles = request.Profiles,
            timestamp = request.Timestamp
        };

        if (profileData == null)
        {
            profileData = new CandidateProfileData
            {
                CandidateId = request.CandidateId,
                TaskCode = "SOCIAL_MEDIA",
                DataJson = System.Text.Json.JsonSerializer.Serialize(socialData)
            };
            _context.CandidateProfileData.Add(profileData);
        }
        else
        {
            profileData.DataJson = System.Text.Json.JsonSerializer.Serialize(socialData);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<ReviewSummaryResponse> GetReviewSummaryAsync(string token, long candidateId)
    {
        var invitation = await _context.CandidateInvitations
            .FirstOrDefaultAsync(i => i.InvitationToken == token);

        if (invitation == null)
        {
            throw new Exception("Invalid invitation token");
        }

        // Fetch all profile data
        var profileDataList = await _context.CandidateProfileData
            .Where(p => p.CandidateId == candidateId)
            .ToListAsync();

        var summary = new ReviewSummaryResponse();

        foreach (var data in profileDataList)
        {
            switch (data.TaskCode)
            {
                case "PERSONAL_INFO":
                    summary.PersonalInfo = System.Text.Json.JsonSerializer.Deserialize<PersonalInfoDto>(data.DataJson);
                    break;
                case "ADDRESS_HISTORY":
                    var addrData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(data.DataJson);
                    if (addrData != null && addrData.ContainsKey("addresses"))
                    {
                        summary.Addresses = System.Text.Json.JsonSerializer.Deserialize<List<AddressDto>>(addrData["addresses"].ToString() ?? "[]") ?? new List<AddressDto>();
                    }
                    break;
                case "EDUCATION":
                    var eduData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(data.DataJson);
                    if (eduData != null && eduData.ContainsKey("educations"))
                    {
                        summary.Educations = System.Text.Json.JsonSerializer.Deserialize<List<EducationDto>>(eduData["educations"].ToString() ?? "[]") ?? new List<EducationDto>();
                    }
                    break;
                case "EMPLOYMENT":
                    var empData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(data.DataJson);
                    if (empData != null && empData.ContainsKey("employments"))
                    {
                        summary.Employments = System.Text.Json.JsonSerializer.Deserialize<List<EmploymentDto>>(empData["employments"].ToString() ?? "[]") ?? new List<EmploymentDto>();
                    }
                    break;
                case "DOCUMENTS":
                    var docData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(data.DataJson);
                    summary.Documents = new DocumentsDto
                    {
                        IdProof = docData != null && docData.ContainsKey("id-proof"),
                        Diploma = docData != null && docData.ContainsKey("diploma")
                    };
                    break;
                case "SOCIAL_MEDIA":
                    var socialData = System.Text.Json.JsonSerializer.Deserialize<SocialMediaDto>(data.DataJson);
                    summary.SocialMedia = socialData;
                    break;
            }
        }

        return summary;
    }

    public async Task<FinalSubmissionResponse> SubmitFinalAsync(FinalSubmissionRequest request)
    {
        var invitation = await _context.CandidateInvitations
            .Include(i => i.Candidate)
            .FirstOrDefaultAsync(i => i.InvitationToken == request.Token);

        if (invitation == null)
        {
            throw new Exception("Invalid invitation token");
        }

        if (invitation.Status == "accepted" || invitation.AcceptedAt.HasValue)
        {
            throw new Exception("This submission has already been completed");
        }

        // Mark invitation as accepted
        invitation.Status = "accepted";
        invitation.AcceptedAt = DateTimeOffset.UtcNow;

        // Update candidate status to SUBMITTED
        if (invitation.Candidate != null)
        {
            invitation.Candidate.Status = CandidateStatus.Submitted;
        }

        // Mark all profile data as validated
        var profileDataList = await _context.CandidateProfileData
            .Where(p => p.CandidateId == request.CandidateId)
            .ToListAsync();

        foreach (var data in profileDataList)
        {
            data.IsValidated = true;
            data.ValidatedAt = DateTimeOffset.UtcNow;
        }

        await _context.SaveChangesAsync();

        // In production, send notification to employer
        // await _notificationService.NotifyEmployerOfSubmission(invitation.ClientId, invitation.CandidateId);

        return new FinalSubmissionResponse
        {
            Success = true,
            Message = "Information submitted successfully"
        };
    }
}

