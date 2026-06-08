// CertifyChain.Core/AI/AiFraudDetectionService.cs
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using CertifyChain.Infrastructure.AI.Models;
using CertifyChain.Infrastructure.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CertifyChain.Infrastructure.AI;

/// <summary>
/// Configuration options for the AI fraud detection microservice.
/// </summary>
public class AiServiceOptions
{
    public const string SectionName = "AiService";
    public string BaseUrl { get; set; } = "http://localhost:8000";
    public int TimeoutSeconds { get; set; } = 30;
    public bool FallbackOnUnavailable { get; set; } = true;
}

/// <summary>
/// Calls the Python FastAPI AI microservice to detect certificate fraud.
/// </summary>
public class AiFraudDetectionService : IAiFraudDetectionService
{
    private readonly HttpClient _httpClient;
    private readonly AiServiceOptions _options;
    private readonly ILogger<AiFraudDetectionService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true
    };

    public AiFraudDetectionService(
        HttpClient httpClient,
        IOptions<AiServiceOptions> options,
        ILogger<AiFraudDetectionService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;

        _httpClient.BaseAddress = new Uri(_options.BaseUrl);
        _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
    }

    /// <inheritdoc />
    public async Task<AiFraudDetectionResult> AnalyseAsync(byte[] imageData, string filename)
    {
        try
        {
            var base64Image = Convert.ToBase64String(imageData);

            var requestBody = new
            {
                image_base64 = base64Image,
                filename = filename
            };

            var json = JsonSerializer.Serialize(requestBody, JsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _logger.LogInformation(
                "Sending AI fraud detection request for file {Filename} ({SizeKb} KB)",
                filename, imageData.Length / 1024);

            var response = await _httpClient.PostAsync("/api/ai/detect", content);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<AiDetectionApiResponse>(responseJson, JsonOptions);

            if (result is null)
                throw new InvalidOperationException("AI service returned null response");

            _logger.LogInformation(
                "AI fraud detection completed: verdict={Verdict}, probability={Probability}, inference={InferenceMs}ms",
                result.Verdict, result.FraudProbability, result.InferenceMs);

            return new AiFraudDetectionResult(
                FraudProbability: result.FraudProbability,
                RiskLevel: result.RiskLevel,
                Verdict: result.Verdict,
                Action: result.Action,
                InferenceMs: result.InferenceMs,
                ForgeryType: result.ForgeryType,
                HandcraftedFeatures: result.HandcraftedFeatures ?? new Dictionary<string, double>()
            );
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "AI fraud detection service is unreachable");
            return AiFraudDetectionResult.ServiceUnavailable();
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "AI fraud detection request timed out after {Timeout}s", _options.TimeoutSeconds);
            return AiFraudDetectionResult.ServiceUnavailable();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during AI fraud detection");
            return AiFraudDetectionResult.ServiceUnavailable();
        }
    }

    /// <inheritdoc />
    public async Task<bool> IsHealthyAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("/health");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}

/// <summary>
/// Internal DTO matching the Python FastAPI response shape (snake_case).
/// </summary>
internal class AiDetectionApiResponse
{
    [JsonPropertyName("fraud_probability")]
    public double FraudProbability { get; set; }

    [JsonPropertyName("risk_level")]
    public string RiskLevel { get; set; } = string.Empty;

    [JsonPropertyName("verdict")]
    public string Verdict { get; set; } = string.Empty;

    [JsonPropertyName("action")]
    public string Action { get; set; } = string.Empty;

    [JsonPropertyName("inference_ms")]
    public int InferenceMs { get; set; }

    [JsonPropertyName("forgery_type")]
    public string ForgeryType { get; set; } = string.Empty;

    [JsonPropertyName("handcrafted_features")]
    public Dictionary<string, double>? HandcraftedFeatures { get; set; }
}
