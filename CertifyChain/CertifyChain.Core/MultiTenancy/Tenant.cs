using CertifyChain.Domain.AggregateRoots;
using CertifyChain.Domain.Entities;

namespace CertifyChain.Infrastructure.MultiTenancy;


public class Tenant : AuditableEntity<Guid>
{
    public string Name { get; set; }
    public string Subdomain { get; set; }
    //public string ConnectionString { get; set; }
    public bool IsActive { get; set; }
    
    public int? InstitutionId { get; set; }
    public Institution? Institution { get; set; }
}