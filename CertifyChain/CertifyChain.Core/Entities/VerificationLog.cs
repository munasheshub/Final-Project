using CertifyChain.Domain.AggregateRoots;
using CertifyChain.Domain.Enums;

namespace CertifyChain.Domain.Entities;


public class VerificationLog : AuditableEntity<Guid>, ITenantEntity
{
    public required string TenantId { get; set; }

    public string CertificateHash { get; private set; } = string.Empty;
    public int CertificateId { get; private set; }
    public DateTime VerifiedAt { get; private set; }
    public string? VerifiedBy { get; private set; }
    public bool isSuccess { get; private set; }
    public string? FailureReason { get; private set; }
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public VerifierType VerifierType { get; private set; } = VerifierType.Other;

    public Certificate? Certificate { get; private set; }

    public static VerificationLog Create(
        string tenantId,
        string certificateHash,
        int certificateId,
        bool isSuccess,
        string? failureReason,
        string? ipAddress,
        string? userAgent,
        VerifierType verifierType = VerifierType.Other)
    {
        return new VerificationLog
        {
            TenantId = tenantId,
            CertificateHash = certificateHash,
            CertificateId = certificateId,
            VerifiedAt = DateTime.UtcNow,
            isSuccess = isSuccess,
            FailureReason = failureReason,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            VerifierType = verifierType
        };
    }
}