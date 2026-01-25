namespace CertifyChain.Domain.Entities;

// Domain/Entities/VerificationLog.cs
public class VerificationLog : AuditableEntity, ITenantEntity
{
    public Guid Id { get; private set; }
    public string TenantId { get; set; }
    
    public Guid CertificateId { get; private set; }
    public DateTime VerifiedAt { get; private set; }
    public string? VerifiedBy { get; private set; } // Email or org name
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    
    public VerificationMethod Method { get; private set; }
    public VerificationResult Result { get; private set; }
    
    public Certificate Certificate { get; private set; }
}