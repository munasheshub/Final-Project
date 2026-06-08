using CertifyChain.Domain.Enums;

namespace CertifyChain.Infrastructure.DataTransferObjects;

public class ProgramDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Code { get; set; }
    public int FacultyId { get; set; }
    public QualificationType QualificationType { get; set; }
    public AwardClass? AwardClass { get; set; }
}