using CertifyChain.Domain.AggregateRoots;
using CertifyChain.Domain.Entities;

namespace CertifyChain.Infrastructure.Entities;

public class Program : AuditableEntity<int>, ITenantEntity
{
    public string TenantId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Code { get; set; }

    public int? FacultyId { get; set; }
    public Faculty? Faculty { get; set; }
    public List<Certificate>? Certificates { get; private set; } = new();

    public List<StudentProgram>? StudentPrograms { get; set; } = new();
}