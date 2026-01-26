using CertifyChain.Domain.AggregateRoots;

namespace CertifyChain.Domain.Entities;


public class AuditLog : AuditableEntity<int>, ITenantEntity
{
    
    public string TenantId { get; set; }
    
    public int? UserId { get; private set; }
    public string Action { get; private set; }
    public string EntityType { get; private set; }
    public string? EntityId { get; private set; }
    
    public string? OldValues { get; private set; }
    public string? NewValues { get; private set; }
    
    public DateTime Timestamp { get; private set; }
    public string? IpAddress { get; private set; }
    
    public User? User { get; private set; }
}