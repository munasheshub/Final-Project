namespace CertifyChain.Domain.Entities;

// Domain/Entities/AuditLog.cs
public class AuditLog : BaseEntity, ITenantEntity
{
    public Guid Id { get; private set; }
    public string TenantId { get; set; }
    
    public Guid? UserId { get; private set; }
    public string Action { get; private set; }
    public string EntityType { get; private set; }
    public string? EntityId { get; private set; }
    
    public string? OldValues { get; private set; }
    public string? NewValues { get; private set; }
    
    public DateTime Timestamp { get; private set; }
    public string? IpAddress { get; private set; }
    
    public User? User { get; private set; }
}