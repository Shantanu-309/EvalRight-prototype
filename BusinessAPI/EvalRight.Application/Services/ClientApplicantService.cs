using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Client;
using EvalRight.Application.Interfaces;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace EvalRight.Application.Services;

public class ClientApplicantService : IClientApplicantService
{
    private readonly IEvalRightDbContext _context;

    public ClientApplicantService(IEvalRightDbContext context)
    {
        _context = context;
    }

    public async Task<List<ApplicantListItemDto>> GetApplicantsListAsync(long clientId)
    {
        // Security: Filter by ClientId - ensure clients can only see their own candidates
        var candidates = await _context.Candidates
            .Where(c => c.ClientId == clientId)
            .Include(c => c.Addresses)
            .Include(c => c.Educations)
            .Include(c => c.Employments)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var result = new List<ApplicantListItemDto>();

        foreach (var candidate in candidates)
        {
            // Get the latest invitation for this candidate
            var invitation = await _context.CandidateInvitations
                .Where(i => i.CandidateId == candidate.Id && i.ClientId == clientId)
                .OrderByDescending(i => i.CreatedAt)
                .FirstOrDefaultAsync();

            // Get order info if invitation has order
            string? packageName = null;
            long? orderId = null;
            if (invitation?.BgvOrderId.HasValue == true)
            {
                var order = await _context.BgvOrders
                    .Include(o => o.Package)
                    .FirstOrDefaultAsync(o => o.Id == invitation.BgvOrderId.Value);
                packageName = order?.Package?.Name;
                orderId = order?.Id;
            }
            else if (invitation != null)
            {
                // Try to find order by candidate and client
                var order = await _context.BgvOrders
                    .Include(o => o.Package)
                    .Where(o => o.CandidateId == candidate.Id && o.ClientId == clientId)
                    .OrderByDescending(o => o.CreatedAt)
                    .FirstOrDefaultAsync();
                packageName = order?.Package?.Name;
                orderId = order?.Id;
            }

            // Determine invitation status
            string invitationStatus = "pending";
            if (invitation != null)
            {
                if (invitation.Status == "accepted" || invitation.AcceptedAt.HasValue)
                    invitationStatus = "accepted";
                else if (invitation.Status == "expired" || (invitation.ExpiresAt < DateTimeOffset.UtcNow && invitation.Status != "accepted"))
                    invitationStatus = "expired";
                else if (invitation.Status == "cancelled")
                    invitationStatus = "cancelled";
                else
                    invitationStatus = "pending";
            }

            // Get submitted date from latest invitation acceptance or profile data
            DateTimeOffset? submittedAt = null;
            if (invitation?.AcceptedAt.HasValue == true)
            {
                submittedAt = invitation.AcceptedAt;
            }
            else
            {
                // Check if there's any validated profile data
                var validatedData = await _context.CandidateProfileData
                    .Where(p => p.CandidateId == candidate.Id && p.IsValidated && p.ValidatedAt.HasValue)
                    .OrderByDescending(p => p.ValidatedAt)
                    .FirstOrDefaultAsync();
                submittedAt = validatedData?.ValidatedAt;
            }

            result.Add(new ApplicantListItemDto
            {
                CandidateId = candidate.Id,
                FullName = $"{candidate.FirstName} {candidate.LastName}".Trim(),
                Email = candidate.Email,
                Phone = candidate.Phone,
                InvitationStatus = invitationStatus,
                VerificationStatus = candidate.Status.ToString(),
                PackageName = packageName,
                CreatedAt = candidate.CreatedAt,
                SubmittedAt = submittedAt,
                OrderId = orderId
            });
        }

        return result;
    }

    public async Task<ApplicantDetailDto?> GetApplicantDetailAsync(long candidateId, long clientId)
    {
        // Security: Verify candidate belongs to this client BEFORE returning any data
        var candidate = await _context.Candidates
            .Where(c => c.Id == candidateId && c.ClientId == clientId) // CRITICAL: Filter by both candidateId AND clientId
            .Include(c => c.Addresses)
            .Include(c => c.Educations)
            .Include(c => c.Employments)
            .FirstOrDefaultAsync();

        if (candidate == null)
        {
            // Candidate doesn't exist or doesn't belong to this client - return null
            return null;
        }

        // Get invitation info
        var invitation = await _context.CandidateInvitations
            .Where(i => i.CandidateId == candidateId && i.ClientId == clientId)
            .OrderByDescending(i => i.CreatedAt)
            .FirstOrDefaultAsync();

        // Get order info
        string? packageName = null;
        long? orderId = null;
        string? orderReference = null;
        if (invitation?.BgvOrderId.HasValue == true)
        {
            var order = await _context.BgvOrders
                .Include(o => o.Package)
                .FirstOrDefaultAsync(o => o.Id == invitation.BgvOrderId.Value);
            packageName = order?.Package?.Name;
            orderId = order?.Id;
            orderReference = order?.Id.ToString(); // Use order ID as reference for now
        }
        else
        {
            var order = await _context.BgvOrders
                .Include(o => o.Package)
                .Where(o => o.CandidateId == candidateId && o.ClientId == clientId)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();
            packageName = order?.Package?.Name;
            orderId = order?.Id;
            orderReference = order?.Id.ToString();
        }

        // Determine invitation status
        string invitationStatus = "pending";
        if (invitation != null)
        {
            if (invitation.Status == "accepted" || invitation.AcceptedAt.HasValue)
                invitationStatus = "accepted";
            else if (invitation.Status == "expired" || (invitation.ExpiresAt < DateTimeOffset.UtcNow && invitation.Status != "accepted"))
                invitationStatus = "expired";
            else if (invitation.Status == "cancelled")
                invitationStatus = "cancelled";
            else
                invitationStatus = "pending";
        }

        // Get all profile data
        var profileDataList = await _context.CandidateProfileData
            .Where(p => p.CandidateId == candidateId)
            .ToListAsync();

        // Deserialize profile data
        ApplicantPersonalInfoDto? personalInfo = null;
        List<ApplicantAddressDto> addresses = new();
        List<ApplicantEducationDto> educations = new();
        List<ApplicantEmploymentDto> employments = new();
        ApplicantSocialMediaDto? socialMedia = null;
        List<ApplicantDocumentDto> documents = new();
        bool consentSigned = false;
        DateTimeOffset? consentSignedAt = null;
        DateTimeOffset? finalSubmittedAt = null;

        foreach (var data in profileDataList)
        {
            try
            {
                switch (data.TaskCode)
                {
                    case "PERSONAL_INFO":
                    case "IDENTITY": // Support both task codes
                        var personalInfoDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(data.DataJson);
                        if (personalInfoDict != null)
                        {
                            personalInfo = new ApplicantPersonalInfoDto
                            {
                                FirstName = GetStringValue(personalInfoDict, "firstName") ?? GetStringValue(personalInfoDict, "fullName")?.Split(' ').FirstOrDefault() ?? candidate.FirstName,
                                MiddleName = GetStringValue(personalInfoDict, "middleName") ?? candidate.MiddleName,
                                LastName = GetStringValue(personalInfoDict, "lastName") ?? (GetStringValue(personalInfoDict, "fullName")?.Split(' ').Skip(1).LastOrDefault() ?? candidate.LastName),
                                Email = GetStringValue(personalInfoDict, "email") ?? candidate.Email,
                                Phone = GetStringValue(personalInfoDict, "phone") ?? candidate.Phone,
                                DateOfBirth = GetStringValue(personalInfoDict, "dob"),
                                CountryOfResidence = GetStringValue(personalInfoDict, "countryOfResidence") ?? candidate.CountryOfResidence,
                                IdType = GetStringValue(personalInfoDict, "idType"),
                                IdNumber = GetStringValue(personalInfoDict, "idNumber")
                            };
                        }
                        break;

                    case "ADDRESS_HISTORY":
                        var addrData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(data.DataJson);
                        if (addrData != null && addrData.ContainsKey("addresses"))
                        {
                            var addressesJson = addrData["addresses"].ToString();
                            if (!string.IsNullOrEmpty(addressesJson))
                            {
                                var addrList = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(addressesJson);
                                if (addrList != null)
                                {
                                    addresses = addrList.Select(a => new ApplicantAddressDto
                                    {
                                        AddressLine1 = GetStringValue(a, "addressLine1"),
                                        AddressLine2 = GetStringValue(a, "addressLine2"),
                                        City = GetStringValue(a, "city"),
                                        State = GetStringValue(a, "state"),
                                        PostalCode = GetStringValue(a, "postalCode") ?? GetStringValue(a, "zipCode"),
                                        Country = GetStringValue(a, "country"),
                                        FromDate = GetStringValue(a, "fromDate"),
                                        ToDate = GetStringValue(a, "toDate"),
                                        IsCurrent = GetBoolValue(a, "isCurrent") ?? false
                                    }).ToList();
                                }
                            }
                        }
                        // Also include addresses from the Addresses collection
                        if (!addresses.Any() && candidate.Addresses.Any())
                        {
                            addresses = candidate.Addresses.Select(a => new ApplicantAddressDto
                            {
                                Type = a.Type,
                                AddressLine1 = a.AddressLine1,
                                AddressLine2 = a.AddressLine2,
                                City = a.City,
                                State = a.State,
                                PostalCode = a.PostalCode,
                                Country = a.Country,
                                FromDate = a.FromDate?.ToString("yyyy-MM-dd"),
                                ToDate = a.ToDate?.ToString("yyyy-MM-dd"),
                                IsCurrent = a.Type == "current"
                            }).ToList();
                        }
                        break;

                    case "EDUCATION":
                        var eduData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(data.DataJson);
                        if (eduData != null && eduData.ContainsKey("educations"))
                        {
                            var educationsJson = eduData["educations"].ToString();
                            if (!string.IsNullOrEmpty(educationsJson))
                            {
                                var eduList = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(educationsJson);
                                if (eduList != null)
                                {
                                    educations = eduList.Select(e => new ApplicantEducationDto
                                    {
                                        InstitutionName = GetStringValue(e, "institutionName") ?? GetStringValue(e, "institution"),
                                        Degree = GetStringValue(e, "degree"),
                                        Major = GetStringValue(e, "major"),
                                        FromDate = GetStringValue(e, "fromDate"),
                                        ToDate = GetStringValue(e, "toDate") ?? GetStringValue(e, "graduationYear"),
                                        Country = GetStringValue(e, "country"),
                                        CertificateNumber = GetStringValue(e, "certificateNumber")
                                    }).ToList();
                                }
                            }
                        }
                        // Also include educations from the Educations collection
                        if (!educations.Any() && candidate.Educations.Any())
                        {
                            educations = candidate.Educations.Select(e => new ApplicantEducationDto
                            {
                                InstitutionName = e.InstitutionName,
                                Degree = e.Degree,
                                Major = e.Major,
                                FromDate = e.FromDate?.ToString("yyyy-MM-dd"),
                                ToDate = e.ToDate?.ToString("yyyy-MM-dd"),
                                Country = e.Country,
                                CertificateNumber = e.CertificateNumber
                            }).ToList();
                        }
                        break;

                    case "EMPLOYMENT":
                        var empData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(data.DataJson);
                        if (empData != null && empData.ContainsKey("employments"))
                        {
                            var employmentsJson = empData["employments"].ToString();
                            if (!string.IsNullOrEmpty(employmentsJson))
                            {
                                var empList = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(employmentsJson);
                                if (empList != null)
                                {
                                    employments = empList.Select(e => new ApplicantEmploymentDto
                                    {
                                        EmployerName = GetStringValue(e, "employerName"),
                                        Designation = GetStringValue(e, "designation") ?? GetStringValue(e, "jobTitle"),
                                        FromDate = GetStringValue(e, "fromDate"),
                                        ToDate = GetStringValue(e, "toDate"),
                                        Location = GetStringValue(e, "location"),
                                        ContactInfo = GetStringValue(e, "contactInfo"),
                                        IsCurrent = GetBoolValue(e, "isCurrent") ?? false
                                    }).ToList();
                                }
                            }
                        }
                        // Also include employments from the Employments collection
                        if (!employments.Any() && candidate.Employments.Any())
                        {
                            employments = candidate.Employments.Select(e => new ApplicantEmploymentDto
                            {
                                EmployerName = e.EmployerName,
                                Designation = e.Designation,
                                FromDate = e.FromDate?.ToString("yyyy-MM-dd"),
                                ToDate = e.ToDate?.ToString("yyyy-MM-dd"),
                                Location = e.Location,
                                ContactInfo = e.ContactInfo,
                                IsCurrent = e.IsCurrent
                            }).ToList();
                        }
                        break;

                    case "SOCIAL_MEDIA":
                        var socialData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(data.DataJson);
                        if (socialData != null)
                        {
                            var profilesList = new List<SocialMediaProfileDto>();
                            if (socialData.ContainsKey("profiles"))
                            {
                                var profilesJson = socialData["profiles"].ToString();
                                if (!string.IsNullOrEmpty(profilesJson))
                                {
                                    var profilesArray = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(profilesJson);
                                    if (profilesArray != null)
                                    {
                                        profilesList = profilesArray.Select(p => new SocialMediaProfileDto
                                        {
                                            Platform = GetStringValue(p, "platform"),
                                            Url = GetStringValue(p, "url")
                                        }).ToList();
                                    }
                                }
                            }
                            socialMedia = new ApplicantSocialMediaDto
                            {
                                ConsentGiven = GetBoolValue(socialData, "consentGiven") ?? false,
                                Profiles = profilesList
                            };
                        }
                        break;

                    case "DOCUMENTS":
                        var docData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(data.DataJson);
                        if (docData != null)
                        {
                            foreach (var kvp in docData)
                            {
                                if (kvp.Value.ValueKind == JsonValueKind.Object)
                                {
                                    var docObj = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(kvp.Value.ToString() ?? "{}");
                                    if (docObj != null)
                                    {
                                        documents.Add(new ApplicantDocumentDto
                                        {
                                            DocumentType = kvp.Key,
                                            FileName = GetStringValue(docObj, "fileName") ?? "Unknown",
                                            ContentType = GetStringValue(docObj, "contentType") ?? "application/octet-stream",
                                            FileSize = GetLongValue(docObj, "size"),
                                            UploadedAt = GetDateTimeOffsetValue(docObj, "uploadedAt"),
                                            FileUrl = $"/api/candidate-portal/file/{kvp.Key}/{data.Id}"
                                        });
                                    }
                                }
                            }
                        }
                        break;

                    case "CONSENT":
                        consentSigned = true;
                        var consentData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(data.DataJson);
                        if (consentData != null)
                        {
                            consentSignedAt = GetDateTimeOffsetValue(consentData, "timestamp") ?? data.CreatedAt;
                        }
                        break;
                }

                // Check for final submission
                if (data.IsValidated && data.ValidatedAt.HasValue)
                {
                    if (!finalSubmittedAt.HasValue || data.ValidatedAt.Value > finalSubmittedAt.Value)
                    {
                        finalSubmittedAt = data.ValidatedAt;
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error but continue processing other data
                Console.WriteLine($"Error deserializing profile data for task {data.TaskCode}: {ex.Message}");
            }
        }

        // Get all uploaded documents from CandidateDocuments table
        var candidateDocuments = await _context.CandidateDocuments
            .Where(d => d.CandidateId == candidateId)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();

        foreach (var doc in candidateDocuments)
        {
            documents.Add(new ApplicantDocumentDto
            {
                DocumentType = doc.DocumentType,
                FileName = Path.GetFileName(doc.FilePath),
                ContentType = doc.MimeType ?? "application/octet-stream",
                FileSize = null, // File size not stored in CandidateDocument
                UploadedAt = doc.UploadedAt,
                FileUrl = $"/api/candidate/file/{doc.Id}?token={invitation?.InvitationToken ?? ""}"
            });
        }

        // If no personal info from profile data, use candidate entity
        if (personalInfo == null)
        {
            personalInfo = new ApplicantPersonalInfoDto
            {
                FirstName = candidate.FirstName,
                MiddleName = candidate.MiddleName,
                LastName = candidate.LastName,
                Email = candidate.Email,
                Phone = candidate.Phone,
                DateOfBirth = candidate.Dob?.ToString("yyyy-MM-dd"),
                CountryOfResidence = candidate.CountryOfResidence
            };
        }

        return new ApplicantDetailDto
        {
            CandidateId = candidate.Id,
            FirstName = candidate.FirstName,
            MiddleName = candidate.MiddleName,
            LastName = candidate.LastName,
            Email = candidate.Email,
            Phone = candidate.Phone,
            DateOfBirth = candidate.Dob,
            CountryOfResidence = candidate.CountryOfResidence,
            Status = candidate.Status.ToString(),
            InvitationStatus = invitationStatus,
            InvitationSentAt = invitation?.SentAt,
            InvitationAcceptedAt = invitation?.AcceptedAt,
            InvitationExpiresAt = invitation?.ExpiresAt,
            OrderId = orderId,
            OrderReference = orderReference,
            PackageName = packageName,
            PersonalInfo = personalInfo,
            Addresses = addresses,
            Educations = educations,
            Employments = employments,
            SocialMedia = socialMedia,
            Documents = documents,
            ConsentSigned = consentSigned,
            ConsentSignedAt = consentSignedAt,
            FinalSubmittedAt = finalSubmittedAt,
            CreatedAt = candidate.CreatedAt,
            UpdatedAt = candidate.UpdatedAt
        };
    }

    // Helper methods for JSON deserialization
    private string? GetStringValue(Dictionary<string, JsonElement> dict, string key)
    {
        if (dict.TryGetValue(key, out var element))
        {
            if (element.ValueKind == JsonValueKind.String)
                return element.GetString();
            else if (element.ValueKind == JsonValueKind.Number)
                return element.GetRawText();
            else if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
                return element.GetBoolean().ToString();
        }
        return null;
    }

    private bool? GetBoolValue(Dictionary<string, JsonElement> dict, string key)
    {
        if (dict.TryGetValue(key, out var element) && element.ValueKind == JsonValueKind.True)
            return true;
        if (element.ValueKind == JsonValueKind.False)
            return false;
        return null;
    }

    private long? GetLongValue(Dictionary<string, JsonElement> dict, string key)
    {
        if (dict.TryGetValue(key, out var element) && element.ValueKind == JsonValueKind.Number)
            return element.GetInt64();
        return null;
    }

    private DateTimeOffset? GetDateTimeOffsetValue(Dictionary<string, JsonElement> dict, string key)
    {
        if (dict.TryGetValue(key, out var element))
        {
            if (element.ValueKind == JsonValueKind.String)
            {
                if (DateTimeOffset.TryParse(element.GetString(), out var date))
                    return date;
            }
            else if (element.ValueKind == JsonValueKind.Number)
            {
                // Unix timestamp
                var seconds = element.GetInt64();
                return DateTimeOffset.FromUnixTimeSeconds(seconds);
            }
        }
        return null;
    }
}


