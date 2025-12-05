using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Integration;
using EvalRight.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EvalRight.Infrastructure.ExternalServices;

public class IdaClient : IIdaClient
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<IdaClient> _logger;

    public IdaClient(HttpClient httpClient, IConfiguration configuration, ILogger<IdaClient> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;

        var baseUrl = _configuration["IdaSettings:BaseUrl"];
        var apiKey = _configuration["IdaSettings:ApiKey"];

        if (!string.IsNullOrEmpty(baseUrl))
        {
            _httpClient.BaseAddress = new Uri(baseUrl);
        }
        
        if (!string.IsNullOrEmpty(apiKey))
        {
            _httpClient.DefaultRequestHeaders.Add("X-API-Key", apiKey);
        }
    }

    public async Task<string> CreateCaseAsync(object caseData)
    {
        try
        {
            // Assuming caseData maps to IdaCreateCaseRequest
            var response = await _httpClient.PostAsJsonAsync("api/v1/cases", caseData);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<IdaCreateCaseResponse>();
            return result?.CaseId ?? throw new Exception("Failed to get CaseId from IDA");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating case in IDA");
            throw;
        }
    }

    public async Task<string> GetCaseStatusAsync(string caseReference)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/v1/cases/{caseReference}/status");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<IdaCreateCaseResponse>(); // Reusing DTO or specific status DTO
            return result?.Status ?? "Unknown";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting case status from IDA");
            throw;
        }
    }

    public async Task<string> GetCaseReportAsync(string caseReference)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/v1/cases/{caseReference}/report");
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            return json;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting report from IDA");
            throw;
        }
    }
}

