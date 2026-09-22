using System;
using System.IO;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Candidate;
using EvalRight.Application.Interfaces;
using EvalRight.Domain.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace EvalRight.Application.Services;

public class FileUploadService : IFileUploadService
{
    private readonly IEvalRightDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly string _uploadsPath;

    public FileUploadService(IEvalRightDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
        _uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads", "candidates");
        
        // Ensure uploads directory exists
        if (!Directory.Exists(_uploadsPath))
        {
            Directory.CreateDirectory(_uploadsPath);
        }
    }

    public async Task<DocumentUploadResponse> UploadFileAsync(long candidateId, string token, string documentType, IFormFile file)
    {
        // Validate invitation token
        var invitation = await _context.CandidateInvitations
            .FirstOrDefaultAsync(i => i.InvitationToken == token);

        if (invitation == null)
        {
            throw new Exception("Invalid invitation token");
        }

        if (invitation.CandidateId != candidateId)
        {
            throw new Exception("Candidate ID does not match invitation");
        }

        // Validate file
        if (file == null || file.Length == 0)
        {
            throw new Exception("File is required");
        }

        // Generate unique filename
        var fileExtension = Path.GetExtension(file.FileName);
        var uniqueFileName = $"{candidateId}_{documentType}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}{fileExtension}";
        var filePath = Path.Combine(_uploadsPath, uniqueFileName);

        // Save file to disk
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Store file metadata in database
        var document = new CandidateDocument
        {
            CandidateId = candidateId,
            DocumentType = documentType,
            FilePath = filePath,
            MimeType = file.ContentType,
            Status = "uploaded",
            UploadedAt = DateTimeOffset.UtcNow
        };

        _context.CandidateDocuments.Add(document);
        await _context.SaveChangesAsync();

        // Generate file URL (relative path for serving)
        var fileUrl = $"/api/candidate/file/{document.Id}";

        return new DocumentUploadResponse
        {
            FileId = document.Id,
            FileName = file.FileName,
            FileUrl = fileUrl
        };
    }
}



