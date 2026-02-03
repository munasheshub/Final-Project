using CertifyChain.Domain.AggregateRoots;
using CertifyChain.Domain.ValueObject;
using CertifyChain.Infrastructure.Entities;

namespace CertifyChain.Domain.Entities;

public class Institution : AuditableEntity<int>
{
    public string TenantId { get; private set; }
    
    public string Name { get; private set; }
    public string Code { get; private set; }
    public string? LogoUrl { get; private set; }
    public string? SealUrl { get; private set; }
    public string Email { get; private set; }
    public string Phone { get; private set; }
    public string? Website { get; private set; }
    public int? AddressId { get; private set; }
    public string? WalletAddress { get; private set; }
    public string? SmartContractAddress { get; private set; }
    public string? IpfsGateway { get; private set; }


    public Address? Address { get; private set; }
    public List<Program>? Programs { get; private set; } 


    //public InstitutionStatus Status { get; private set; }
    public DateTime? VerifiedAt { get; private set; }
    
    public List<Certificate>? Certificates { get; private set; } = new();
    public List<User>? Users { get; private set; } = new();
}
