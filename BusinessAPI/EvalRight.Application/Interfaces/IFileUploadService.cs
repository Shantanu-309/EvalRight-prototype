using EvalRight.Application.DTOs.Candidate;
using Microsoft.AspNetCore.Http;

namespace EvalRight.Application.Interfaces;

public interface IFileUploadService
{
    Task<DocumentUploadResponse> UploadFileAsync(long candidateId, string token, string documentType, IFormFile file);
}



