namespace CertifyChain.Infrastructure.AI.Models;

public class FraudDetectionResult
{
    public bool IsFraudulent { get; set; }
    public double ConfidenceScore { get; set; }
    public List<string> Anomalies { get; set; } = new();
    public string AnalysisJson { get; set; } = string.Empty;
    public DateTime AnalyzedAt { get; set; }
}