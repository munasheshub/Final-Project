using System.ComponentModel.DataAnnotations;

namespace CertifyChain.Domain.AggregateRoots;

public class BaseEntity<T>
{
    [Key]
    public T Id { get; set; }
}