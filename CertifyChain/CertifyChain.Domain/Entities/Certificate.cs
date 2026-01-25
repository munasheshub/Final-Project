namespace CertifyChain.Domain.Entities;

// Domain/Entities/Certificate.cs
public class Certificate : AuditableEntity, ITenantEntity
{
    public Guid Id { get; private set; }
    public string TenantId { get; set; } // Multi-tenancy
    
    public string CertificateNumber { get; private set; }
    public Guid StudentId { get; private set; }
    public Guid InstitutionId { get; private set; }
    
    public QualificationType QualificationType { get; private set; }
    public string ProgramName { get; private set; }
    public AwardClass AwardClass { get; private set; }
    public DateTime GraduationDate { get; private set; }
    
    // Blockchain
    public string BlockchainTxHash { get; private set; }
    public string IpfsCid { get; private set; }
    public string CertificateHash { get; private set; }
    public string VerificationCode { get; private set; }
    public string QrCodeData { get; private set; }
    
    // Status
    public CertificateStatus Status { get; private set; }
    public DateTime? RevokedAt { get; private set; }
    public string? RevocationReason { get; private set; }
    
    // AI Fraud Detection
    public double? FraudConfidenceScore { get; private set; }
    public bool? FraudDetected { get; private set; }
    public string? FraudAnalysisJson { get; private set; }
    
    // Relationships
    public Student Student { get; private set; }
    public Institution Institution { get; private set; }
    public List<VerificationLog> VerificationLogs { get; private set; } = new();
    
    // Domain Events
    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();
    
    // Factory Method
    public static Certificate Create(
        string tenantId,
        Guid studentId,
        Guid institutionId,
        CertificateData data)
    {
        var certificate = new Certificate
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            StudentId = studentId,
            InstitutionId = institutionId,
            CertificateNumber = GenerateCertificateNumber(),
            VerificationCode = GenerateVerificationCode(),
            Status = CertificateStatus.Draft,
            // ... map other properties
        };
        
        certificate.AddDomainEvent(new CertificateCreatedEvent(certificate));
        return certificate;
    }
    
    // Business Logic Methods
    public void RegisterOnBlockchain(string txHash, string ipfsCid, string hash)
    {
        BlockchainTxHash = txHash;
        IpfsCid = ipfsCid;
        CertificateHash = hash;
        Status = CertificateStatus.Verified;
        
        AddDomainEvent(new CertificateRegisteredEvent(this));
    }
    
    public void Revoke(string reason, Guid revokedBy)
    {
        if (Status == CertificateStatus.Revoked)
            throw new DomainException("Certificate is already revoked");
            
        Status = CertificateStatus.Revoked;
        RevokedAt = DateTime.UtcNow;
        RevocationReason = reason;
        
        AddDomainEvent(new CertificateRevokedEvent(this, revokedBy));
    }
    
    public void MarkAsFraudulent(double confidenceScore, string analysisJson)
    {
        FraudDetected = true;
        FraudConfidenceScore = confidenceScore;
        FraudAnalysisJson = analysisJson;
        Status = CertificateStatus.Flagged;
        
        AddDomainEvent(new FraudDetectedEvent(this));
    }
    
    private void AddDomainEvent(IDomainEvent @event) => _domainEvents.Add(@event);
    
    private static string GenerateCertificateNumber() 
        => $"CERT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
    
    private static string GenerateVerificationCode()
        => Guid.NewGuid().ToString("N")[..12].ToUpper();
}





