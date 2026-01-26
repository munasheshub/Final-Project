using CertiChain.Application.DTOs.Certificate.CertiChain.Application.DTOs.Student;
using CertiChain.Application.DTOs.Certificate.CertiChain.Application.DTOs.Student.CertiChain.Application.DTOs.Verification;

namespace CertiChain.Application.DTOs.Certificate;

public class CertificateDetailDto : CertificateDto
{
    public StudentDto Student { get; set; } = null!;
    public InstitutionDto Institution { get; set; } = null!;
    public string? CertificateHash { get; set; }
    public string? QrCodeData { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? RevocationReason { get; set; }
    public double? FraudConfidenceScore { get; set; }
    public bool? FraudDetected { get; set; }
    public List<VerificationLogDto> VerificationLogs { get; set; } = new();
}