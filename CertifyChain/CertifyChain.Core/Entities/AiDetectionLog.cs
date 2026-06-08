// CertifyChain.Core/Entities/AiDetectionLog.cs
using CertifyChain.Domain.AggregateRoots;

namespace CertifyChain.Domain.Entities;

/// <summary>
/// Stores the result of each AI fraud detection analysis for audit trail and human review workflow.
/// </summary>
public class AiDetectionLog : BaseEntity<Guid>, ITenantEntity
{
    public string TenantId { get; set; } = string.Empty;

    public string CertificateHash { get; set; } = string.Empty;
    public int? StudentId { get; set; }
    public int? InstitutionId { get; set; }

    public double FraudProbability { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public string Verdict { get; set; } = string.Empty;
    public string ForgeryType { get; set; } = string.Empty;
    public int InferenceMs { get; set; }
    public string HandcraftedFeaturesJson { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Human review fields
    public int? ReviewedByUserId { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewOutcome { get; set; } // "CONFIRMED_FRAUD" | "FALSE_POSITIVE"
    public string? ReviewNotes { get; set; }

    // Navigation
    public Student? Student { get; set; }
    public Institution? Institution { get; set; }
    public User? ReviewedByUser { get; set; }

    public static AiDetectionLog Create(
        string tenantId,
        string certificateHash,
        int? studentId,
        int? institutionId,
        double fraudProbability,
        string riskLevel,
        string verdict,
        string forgeryType,
        int inferenceMs,
        string handcraftedFeaturesJson)
    {
        return new AiDetectionLog
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            CertificateHash = certificateHash,
            StudentId = studentId,
            InstitutionId = institutionId,
            FraudProbability = fraudProbability,
            RiskLevel = riskLevel,
            Verdict = verdict,
            ForgeryType = forgeryType,
            InferenceMs = inferenceMs,
            HandcraftedFeaturesJson = handcraftedFeaturesJson,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void MarkReviewed(int userId, string outcome, string? notes = null)
    {
        ReviewedByUserId = userId;
        ReviewedAt = DateTime.UtcNow;
        ReviewOutcome = outcome;
        ReviewNotes = notes;
    }
}
