using System.Threading.Tasks;
using EvalRight.Application.DTOs.Candidate;

namespace EvalRight.Application.Interfaces;

public interface ICandidatePortalService
{
    Task<CandidateAuthResponse> AuthenticateAsync(string invitationToken);
    Task<CandidateProfileDto> GetProfileAsync(long candidateId);
    Task UpdateTaskDataAsync(long candidateId, string taskCode, string dataJson);
    // Task UploadDocumentAsync(...)
}

