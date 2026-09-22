using System.Threading.Tasks;
using EvalRight.Application.DTOs.Auth;
using EvalRight.Domain.Entities;

namespace EvalRight.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<Account> RegisterAsync(RegisterRequest request, string roleCode);
    Task<ClientRegistrationResponse> RegisterClientAsync(ClientRegistrationRequest request);
}

