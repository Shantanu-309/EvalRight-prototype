using System.ComponentModel.DataAnnotations;
using EvalRight.Domain.Enums;

namespace EvalRight.Application.DTOs.Client;

public class CreateClientRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? Industry { get; set; }
    public string? Country { get; set; }
    public string? TaxExemptionDetails { get; set; }
    
    // Address (Primary Branch)
    public string? AddressLine1 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    
    // Admin Contact
    public CreateClientContactRequest AdminContact { get; set; } = new();
}

public class CreateClientContactRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
}

public class ClientDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string BillingMode { get; set; } = string.Empty;
}

public class ClientDetailDto : ClientDto
{
    public string? Industry { get; set; }
    public string? Country { get; set; }
    public bool AutopayEnabled { get; set; }
    public List<ClientBranchDto> Branches { get; set; } = new();
    public List<ClientContactDto> Contacts { get; set; } = new();
}

public class ClientBranchDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? City { get; set; }
    public bool IsPrimary { get; set; }
}

public class ClientContactDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Role { get; set; }
}

