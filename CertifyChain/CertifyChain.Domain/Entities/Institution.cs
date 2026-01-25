namespace CertifyChain.Domain.Entities;


// Domain/Entities/Institution.cs
public class Institution : AuditableEntity
{
    public Guid Id { get; private set; }
    public string TenantId { get; private set; } // One institution = one tenant
    
    public string Name { get; private set; }
    public string Code { get; private set; }
    public string? LogoUrl { get; private set; }
    public string? SealUrl { get; private set; }
    
    // Blockchain Config
    public string? WalletAddress { get; private set; }
    public string? SmartContractAddress { get; private set; }
    public string? IpfsGateway { get; private set; }
    
    // Contact
    public Address Address { get; private set; }
    public ContactInfo ContactInfo { get; private set; }
    
    // Status
    public InstitutionStatus Status { get; private set; }
    public DateTime? VerifiedAt { get; private set; }
    
    public List<Certificate> Certificates { get; private set; } = new();
    public List<User> Users { get; private set; } = new();
}
