using System.Threading.Tasks;
using EvalRight.Application.DTOs.Client;
using EvalRight.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvalRight.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Require login by default
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientsController(IClientService clientService)
    {
        _clientService = clientService;
    }

    [HttpPost]
    [Authorize(Roles = "admin")] // Only EvalRight Admin can create clients directly
    public async Task<IActionResult> CreateClient([FromBody] CreateClientRequest request)
    {
        try
        {
            var client = await _clientService.CreateClientAsync(request);
            return CreatedAtAction(nameof(GetClient), new { id = client.Id }, client);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetClient(long id)
    {
        // TODO: Add RBAC check to ensure Client User can only access their own client
        // For now, allowing all authenticated (or restrict to admin + specific client users)
        var client = await _clientService.GetClientByIdAsync(id);
        if (client == null) return NotFound();
        return Ok(client);
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllClients()
    {
        var clients = await _clientService.GetAllClientsAsync();
        return Ok(clients);
    }
}

