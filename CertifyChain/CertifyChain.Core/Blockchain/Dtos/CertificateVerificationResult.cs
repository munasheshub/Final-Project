namespace CertifyChain.Infrastructure.Blockchain.Dtos;

public class CertificateVerificationResult
{
    public bool IsValid { get; set; }
    public uint StudentId { get; set; }
    public ushort InstitutionId { get; set; }
    public DateTime IssueDate { get; set; }
    public string IpfsCID { get; set; }
    public string Status { get; set; } // "Valid", "Revoked", "Not Found"
}