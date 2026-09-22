using EvalRight.Application.DTOs.Client;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EvalRight.Application.Interfaces;

public interface IClientApplicantService
{
    /// <summary>
    /// Get list of applicants (candidates) for a specific client
    /// Enforces security: only returns candidates where ClientId matches
    /// </summary>
    Task<List<ApplicantListItemDto>> GetApplicantsListAsync(long clientId);

    /// <summary>
    /// Get full details of a specific applicant (candidate)
    /// Enforces security: verifies candidate belongs to the specified client before returning data
    /// </summary>
    Task<ApplicantDetailDto?> GetApplicantDetailAsync(long candidateId, long clientId);
}




