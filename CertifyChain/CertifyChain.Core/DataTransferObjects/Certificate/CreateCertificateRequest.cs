using CertifyChain.Domain.Enums;

namespace CertiChain.Application.DTOs.Certificate;

public class CreateCertificateRequest
{
    // Student information
    public int StudentId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }

    // Certificate details
    public string ProgramName { get; set; } = string.Empty;
    public string? Specialization { get; set; }
    public QualificationType QualificationType { get; set; }
    public AwardClass AwardClass { get; set; }
    public DateTime GraduationDate { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;

    // Document information
    public string FileHash { get; set; } = string.Empty;

    // Blockchain data (already processed in frontend)
    public string TransactionHash { get; set; } = string.Empty;
    public string CertHash { get; set; } = string.Empty;
    public string IpfsCID { get; set; } = string.Empty;
    public string? WalletAddress { get; set; }
    public long? GasUsed { get; set; }
    public long? BlockNumber { get; set; }
}