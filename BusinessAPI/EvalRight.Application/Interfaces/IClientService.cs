using System.Collections.Generic;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Client;

namespace EvalRight.Application.Interfaces;

public interface IClientService
{
    Task<ClientDetailDto> CreateClientAsync(CreateClientRequest request);
    Task<ClientDetailDto?> GetClientByIdAsync(long id);
    Task<List<ClientDto>> GetAllClientsAsync();
    // More methods for branches, settings, etc.
}

