using System.Threading.Tasks;
using EvalRight.Application.DTOs.Auth;
using EvalRight.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvalRight.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("register/admin")]
    public async Task<IActionResult> RegisterAdmin([FromBody] RegisterRequest request)
    {
        // In a real app, this should be restricted or have a secret key to create first admin
        try
        {
            var account = await _authService.RegisterAsync(request, "admin");
            return Ok(new { message = "Admin registered successfully", accountId = account.Id });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    
    [HttpPost("register/client")]
    public async Task<IActionResult> RegisterClient([FromBody] ClientRegistrationRequest request)
    {
        try
        {
            var response = await _authService.RegisterClientAsync(request);
            return Ok(response);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

