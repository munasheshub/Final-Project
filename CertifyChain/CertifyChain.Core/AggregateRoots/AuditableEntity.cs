using CertifyChain.Domain.Entities;

namespace CertifyChain.Domain.AggregateRoots;

public class AuditableEntity<T> : BaseEntity<T>
{
    public int? CreatorId { get; set; }
    public DateTime CreationDate { get; set; }
    public int? DeleterId { get; set; }
    public DateTime? DeletionDate { get; set; }
    public bool IsDeleted { get; set; }
    
    public User? Creator { get; set; }
    public User? Deleter { get; set; }

}