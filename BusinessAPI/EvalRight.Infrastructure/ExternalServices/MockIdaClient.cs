using System;
using System.Threading.Tasks;
using EvalRight.Application.Interfaces;

namespace EvalRight.Infrastructure.ExternalServices;

public class MockIdaClient : IIdaClient
{
    public Task<string> CreateCaseAsync(object caseData)
    {
        // Mock ID generation
        return Task.FromResult($"IDA-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}");
    }

    public Task<string> GetCaseStatusAsync(string caseReference)
    {
        // Randomly return status
        var statuses = new[] { "In Progress", "Completed", "Pending" };
        var random = new Random();
        return Task.FromResult(statuses[random.Next(statuses.Length)]);
    }

    public Task<string> GetCaseReportAsync(string caseReference)
    {
        return Task.FromResult("{ \"result\": \"Clear\", \"details\": \"Mock report data\" }");
    }
}

