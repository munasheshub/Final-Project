namespace CertifyChain.Domain.Entities;


public class Student : AuditableEntity, ITenantEntity
{
    public Guid Id { get; private set; }
    public string TenantId { get; set; }
    
    public string StudentNumber { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string Email { get; private set; }
    public DateTime DateOfBirth { get; private set; }
    
    public string? PhotoUrl { get; private set; }
    public string? PhoneNumber { get; private set; }
    
    public List<Certificate> Certificates { get; private set; } = new();
    
    // Value Objects
    public Address? Address { get; private set; }
    
    public static Student Create(string tenantId, CreateStudentData data)
    {
        var student = new Student
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            StudentNumber = data.StudentNumber,
            FirstName = data.FirstName,
            LastName = data.LastName,
            Email = data.Email,
            DateOfBirth = data.DateOfBirth
        };
        
        return student;
    }
}
