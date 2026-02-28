using CertifyChain.Domain.AggregateRoots;
using CertifyChain.Infrastructure.Entities;

namespace CertifyChain.Domain.Entities;

public class StudentProgram : BaseEntity<int>
{
    public int StudentId { get; set; }
    public Student? Student { get; set; }

    public int ProgramId { get; set; }
    public Program? Program { get; set; }

    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
}
