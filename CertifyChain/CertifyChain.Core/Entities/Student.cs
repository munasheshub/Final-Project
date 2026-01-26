using CertifyChain.Domain.AggregateRoots;
using CertifyChain.Domain.ValueObject;

namespace CertifyChain.Domain.Entities;


public class Student : AuditableEntity<int>, ITenantEntity
{
    public string TenantId { get; set; }
    
    public string StudentNumber { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string Email { get; private set; }
    public DateTime DateOfBirth { get; private set; }
    
    public string? PhotoUrl { get; private set; }
    public string? PhoneNumber { get; private set; }
    
    public List<Certificate> Certificates { get; private set; } = new();
    
    
}
