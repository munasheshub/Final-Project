using CertifyChain.Domain.AggregateRoots;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.Entities;

namespace CertifyChain.Domain.Entities;

public class Faculty : AuditableEntity<int>, ITenantEntity
{
    public string TenantId { get; set; }
    public string Name { get; private set; }
    public string Code { get; private set; }

    public int InstitutionId { get; private set; }
    public Institution? Institution { get; private set; }

    public List<Program>? Programs { get; private set; } = new();

    public static Faculty Create(string name, string code, int institutionId)
    {
        return new Faculty
        {
            Name = name,
            Code = code,
            InstitutionId = institutionId
        };
    }

    public void Update(string name, string code)
    {
        if (!string.IsNullOrWhiteSpace(name)) Name = name;
        if (!string.IsNullOrWhiteSpace(code)) Code = code;
    }
}
