using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Client;
using EvalRight.Application.Interfaces;
using EvalRight.Domain.Entities;
using EvalRight.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EvalRight.Application.Services;

public class ClientService : IClientService
{
    private readonly IEvalRightDbContext _context;

    public ClientService(IEvalRightDbContext context)
    {
        _context = context;
    }

    public async Task<ClientDetailDto> CreateClientAsync(CreateClientRequest request)
    {
        // Transaction might be good here
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var client = new Client
            {
                Name = request.Name,
                DisplayName = request.DisplayName ?? request.Name,
                Industry = request.Industry,
                Country = request.Country,
                TaxExemptionDetails = request.TaxExemptionDetails,
                Status = ClientStatus.Active, // Admin created = active?
                BillingMode = BillingMode.PrepaidPerOrder,
                SignupDate = DateTimeOffset.UtcNow
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            // Add Primary Branch
            var branch = new ClientBranch
            {
                ClientId = client.Id,
                Name = "Headquarters",
                AddressLine1 = request.AddressLine1,
                City = request.City,
                State = request.State,
                PostalCode = request.PostalCode,
                Country = request.Country,
                IsPrimary = true
            };
            _context.ClientBranches.Add(branch);

            // Add Contact
            var contact = new ClientContact
            {
                ClientId = client.Id,
                Name = request.AdminContact.Name,
                Email = request.AdminContact.Email,
                Phone = request.AdminContact.Phone,
                Role = "Admin",
                IsPrimaryBilling = true,
                IsPrimaryTechnical = true
            };
            _context.ClientContacts.Add(contact);

            // Create Settings
            var settings = new ClientSettings
            {
                ClientId = client.Id,
                DefaultRegion = BgvRegion.In
            };
            _context.ClientSettings.Add(settings);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return await GetClientByIdAsync(client.Id) ?? throw new Exception("Failed to retrieve created client");
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<ClientDetailDto?> GetClientByIdAsync(long id)
    {
        var client = await _context.Clients
            .Include(c => c.Branches)
            .Include(c => c.Contacts)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (client == null) return null;

        return new ClientDetailDto
        {
            Id = client.Id,
            Name = client.Name,
            Status = client.Status.ToString(),
            BillingMode = client.BillingMode.ToString(),
            Industry = client.Industry,
            Country = client.Country,
            AutopayEnabled = client.AutopayEnabled,
            Branches = client.Branches.Select(b => new ClientBranchDto
            {
                Id = b.Id,
                Name = b.Name,
                City = b.City,
                IsPrimary = b.IsPrimary
            }).ToList(),
            Contacts = client.Contacts.Select(c => new ClientContactDto
            {
                Id = c.Id,
                Name = c.Name,
                Email = c.Email,
                Role = c.Role
            }).ToList()
        };
    }

    public async Task<List<ClientDto>> GetAllClientsAsync()
    {
        return await _context.Clients
            .Select(c => new ClientDto
            {
                Id = c.Id,
                Name = c.Name,
                Status = c.Status.ToString(),
                BillingMode = c.BillingMode.ToString()
            })
            .ToListAsync();
    }
}

