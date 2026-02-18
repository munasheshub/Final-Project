using CertifyChain.Domain.AggregateRoots;

namespace CertifyChain.Domain.Entities;


public class VerificationLog : AuditableEntity<Guid>, ITenantEntity
{
    public required string TenantId { get; set; }
    
    public string CertificateNumber { get; private set; } = string.Empty;
    public int CertificateId { get; private set; }
    public DateTime VerifiedAt { get; private set; }
    public string? VerifiedBy { get; private set; }
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    
    //public VerificationMethod Method { get; private set; }
    //public VerificationResult Result { get; private set; }
    
    public Certificate? Certificate { get; private set; }
}