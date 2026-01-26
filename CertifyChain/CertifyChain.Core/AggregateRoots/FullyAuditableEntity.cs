using CertifyChain.Domain.Entities;

namespace CertifyChain.Domain.AggregateRoots;

public class FullyAuditableEntity : AuditableEntity<int>
{
    public int? LastModifierId { get; set; }
    public DateTime LastModificationDate { get; set; }

    public User? LastModifier { get; set; }
}