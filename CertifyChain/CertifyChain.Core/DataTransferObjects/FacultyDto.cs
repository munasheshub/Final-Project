namespace CertifyChain.Infrastructure.DataTransferObjects;

public class FacultyDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public int InstitutionId { get; set; }
}

public class CreateFacultyRequest
{
    public string Name { get; set; }
    public string Code { get; set; }
    public int InstitutionId { get; set; }
}

public class UpdateFacultyRequest
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
}
