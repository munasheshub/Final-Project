// CertifyChain.Core/AI/Models/AiFraudDetectionResult.cs
namespace CertifyChain.Infrastructure.AI.Models;

/// <summary>
/// Represents the result of an AI fraud detection analysis on a certificate image.
/// </summary>
public record AiFraudDetectionResult(
    double FraudProbability,
    string RiskLevel,
    string Verdict,
    string Action,
    int InferenceMs,
    string ForgeryType,
    Dictionary<string, double> HandcraftedFeatures
)
{
    /// <summary>
    /// Creates a fallback result when the AI service is unavailable.
    /// </summary>
    public static AiFraudDetectionResult ServiceUnavailable() => new(
        FraudProbability: -1,
        RiskLevel: "UNKNOWN",
        Verdict: "AI_SERVICE_UNAVAILABLE",
        Action: "Manual review recommended",
        InferenceMs: 0,
        ForgeryType: "none",
        HandcraftedFeatures: new Dictionary<string, double>()
    );
}
