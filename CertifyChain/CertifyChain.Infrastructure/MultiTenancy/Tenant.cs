using CertifyChain.Domain.Entities;

namespace CertifyChain.Infrastructure.MultiTenancy;


public class Tenant
{
    public string Id { get; set; } // Same as Institution.TenantId
    public string Name { get; set; }
    public string Subdomain { get; set; }
    public string ConnectionString { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public Guid InstitutionId { get; set; }
    public Institution Institution { get; set; }
}