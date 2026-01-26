using System.Net.Http.Json;
using CertifyChain.Infrastructure.AI.Models;
using CertifyChain.Infrastructure.Helpers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CertifyChain.Infrastructure.AI;

public interface IFraudDetectionService
{
    Task<FraudDetectionResult> AnalyzeCertificateAsync(byte[] imageData);
    Task<bool> IsModelHealthyAsync();
}


public class FraudDetectionService : IFraudDetectionService
{
    private readonly HttpClient _httpClient;
    private readonly string _aiServiceUrl;
    private readonly ILogger<FraudDetectionService> _logger;
    
    public FraudDetectionService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<FraudDetectionService> logger)
    {
        _httpClient = httpClient;
        _aiServiceUrl = configuration["AI:ServiceUrl"] 
            ?? throw new InvalidOperationException("AI service URL not configured");
        _logger = logger;
    }
    
    public async Task<FraudDetectionResult> AnalyzeCertificateAsync(byte[] imageData)
    {
        try
        {
            using var content = new MultipartFormDataContent();
            content.Add(new ByteArrayContent(imageData), "image", "certificate.jpg");
            
            var response = await _httpClient.PostAsync(
                $"{_aiServiceUrl}/api/detect", 
                content);
            
            response.EnsureSuccessStatusCode();
            
            var result = await response.Content.ReadFromJsonAsync<FraudDetectionResult>();
            
            _logger.LogInformation(
                "Fraud detection completed. Is fraudulent: {IsFraud}, Confidence: {Confidence}",
                result?.IsFraudulent,
                result?.ConfidenceScore);
            
            return result ?? throw new InvalidOperationException("Failed to get fraud detection result");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fraud detection failed");
            throw new AIServiceException("Fraud detection failed", ex);
        }
    }
    
    public async Task<bool> IsModelHealthyAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync($"{_aiServiceUrl}/health");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}