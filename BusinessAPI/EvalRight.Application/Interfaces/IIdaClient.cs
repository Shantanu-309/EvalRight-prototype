using System.Threading.Tasks;

namespace EvalRight.Application.Interfaces;

public interface IIdaClient
{
    Task<string> CreateCaseAsync(object caseData); // Returns Case Reference
    Task<string> GetCaseStatusAsync(string caseReference); // Returns Status
    Task<string> GetCaseReportAsync(string caseReference); // Returns JSON Report
}

