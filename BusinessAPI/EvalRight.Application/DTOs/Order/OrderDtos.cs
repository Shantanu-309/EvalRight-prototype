using System.ComponentModel.DataAnnotations;

namespace EvalRight.Application.DTOs.Order;

public class CreateOrderRequest
{
    [Required]
    public long ClientId { get; set; }
    
    [Required]
    public long PackageId { get; set; }
    
    // Candidate Info
    [Required]
    public string CandidateFirstName { get; set; } = string.Empty;
    public string? CandidateMiddleName { get; set; }
    [Required]
    public string CandidateLastName { get; set; } = string.Empty;
    [Required]
    [EmailAddress]
    public string CandidateEmail { get; set; } = string.Empty;
    public string? CandidatePhone { get; set; }
    
    public string OrderType { get; set; } = "direct"; // direct, with_invitation
}

public class OrderDto
{
    public long Id { get; set; }
    public string OverallStatus { get; set; } = string.Empty;
    public string CandidateName { get; set; } = string.Empty;
    public string PackageName { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class OrderDetailDto : OrderDto
{
    public List<OrderComponentDto> Components { get; set; } = new();
}

public class OrderComponentDto
{
    public string ComponentName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

