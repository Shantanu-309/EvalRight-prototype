using System.Threading.Tasks;
using EvalRight.Application.DTOs.Candidate;
using Microsoft.AspNetCore.Http;

namespace EvalRight.Application.Interfaces;

public interface ICandidatePortalService
{
    Task<CandidateAuthResponse> AuthenticateAsync(string invitationToken);
    Task<CandidateProfileDto> GetProfileAsync(long candidateId);
    Task UpdateTaskDataAsync(long candidateId, string taskCode, string dataJson);
    Task<VerifyTokenResponse> VerifyTokenAsync(string invitationToken);
    Task<InvitationDetailsResponse> GetInvitationDetailsAsync(long? invitationId, string token);
    Task<IdentityVerificationResponse> VerifyIdentityAsync(IdentityVerificationRequest request);
    Task<FcraTextResponse> GetFcraTextAsync();
    Task<ConsentSignResponse> SignConsentAsync(ConsentSignRequest request);
    Task<ConsentFileResponse> DownloadConsentAsync(string token);
    Task<DocumentUploadResponse> UploadDocumentAsync(long candidateId, string token, string documentType, IFormFile file);
    Task SubmitSocialMediaAsync(SocialMediaRequest request);
    Task<ReviewSummaryResponse> GetReviewSummaryAsync(string token, long candidateId);
    Task<FinalSubmissionResponse> SubmitFinalAsync(FinalSubmissionRequest request);
}

