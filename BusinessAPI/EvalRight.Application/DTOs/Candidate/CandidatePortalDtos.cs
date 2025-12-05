using EvalRight.Domain.Entities;

namespace EvalRight.Application.DTOs.Candidate;

public class CandidateLoginRequest
{
    public string InvitationToken { get; set; } = string.Empty;
}

public class CandidateAuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string CandidateName { get; set; } = string.Empty;
    public long CandidateId { get; set; }
}

public class CandidateTaskDto
{
    public string TaskCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsEditable { get; set; }
    public object? Data { get; set; } // JSON Payload
}

public class CandidateProfileDto
{
    public long CandidateId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public List<CandidateTaskDto> Tasks { get; set; } = new();
}

