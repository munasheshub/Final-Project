namespace CertiChain.Application.DTOs.Certificate;

public class CreateVerificationLogRequest
{
    public string CertificateHash { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }
    public string? FailureReason { get; set; }
}

public class VerificationLogResponseDto
{
    public Guid Id { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public string CertificateHash { get; set; } = string.Empty;
    public int CertificateId { get; set; }
    public DateTime VerifiedAt { get; set; }
    public string? VerifiedBy { get; set; }
    public bool IsSuccess { get; set; }
    public string? FailureReason { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}
