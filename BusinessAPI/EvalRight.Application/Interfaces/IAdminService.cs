using System.Threading.Tasks;
using EvalRight.Application.DTOs.Admin;

namespace EvalRight.Application.Interfaces;

public interface IAdminService
{
    Task<AdminDashboardStatsDto> GetDashboardStatsAsync();
}

