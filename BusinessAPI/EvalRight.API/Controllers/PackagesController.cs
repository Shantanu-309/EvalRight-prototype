using System.Linq;
using System.Threading.Tasks;
using EvalRight.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EvalRight.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PackagesController : ControllerBase
{
    private readonly IEvalRightDbContext _context;

    public PackagesController(IEvalRightDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPackages()
    {
        try
        {
            var packages = await _context.BgvPackages
                .Where(p => p.IsPublic && p.Status == "active")
                .Select(p => new
                {
                    id = p.Id,
                    name = p.Name,
                    code = p.Code,
                    description = p.Description
                })
                .ToListAsync();

            // If no packages in database, create default packages
            if (!packages.Any())
            {
                var defaultPackagesData = new[]
                {
                    new { name = "Basic Criminal Only", code = "BASIC_CRIMINAL", description = "Basic criminal background check" },
                    new { name = "Standard Verification", code = "STANDARD", description = "Standard verification package" },
                    new { name = "Premium Verification", code = "PREMIUM", description = "Premium verification package" },
                    new { name = "Employment + Education Package", code = "EMP_EDU", description = "Employment and education verification" }
                };

                foreach (var pkgData in defaultPackagesData)
                {
                    var package = new EvalRight.Domain.Entities.BgvPackage
                    {
                        Code = pkgData.code,
                        Name = pkgData.name,
                        Description = pkgData.description,
                        RegionScope = EvalRight.Domain.Enums.BgvRegion.Both,
                        IsPreset = true,
                        IsPublic = true,
                        Status = "active"
                    };
                    _context.BgvPackages.Add(package);
                }
                await _context.SaveChangesAsync();

                // Fetch the newly created packages
                packages = await _context.BgvPackages
                    .Where(p => p.IsPublic && p.Status == "active")
                    .Select(p => new
                    {
                        id = p.Id,
                        name = p.Name,
                        code = p.Code,
                        description = p.Description
                    })
                    .ToListAsync();
            }

            return Ok(packages);
        }
        catch (System.Exception ex)
        {
            // Return default packages on error (fallback)
            var defaultPackages = new List<object>
            {
                new { id = 1, name = "Basic Criminal Only", code = "BASIC_CRIMINAL", description = "Basic criminal background check" },
                new { id = 2, name = "Standard Verification", code = "STANDARD", description = "Standard verification package" },
                new { id = 3, name = "Premium Verification", code = "PREMIUM", description = "Premium verification package" },
                new { id = 4, name = "Employment + Education Package", code = "EMP_EDU", description = "Employment and education verification" }
            };
            return Ok(defaultPackages);
        }
    }
}


