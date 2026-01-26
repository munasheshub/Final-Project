namespace CertiChain.Application.DTOs.Certificate;

public class CertificateDto
{
    public int Id { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string ProgramName { get; set; } = string.Empty;
    public string QualificationType { get; set; } = string.Empty;
    public string AwardClass { get; set; } = string.Empty;
    public DateTime GraduationDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? BlockchainTxHash { get; set; }
    public string? IpfsCid { get; set; }
    public string VerificationCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

