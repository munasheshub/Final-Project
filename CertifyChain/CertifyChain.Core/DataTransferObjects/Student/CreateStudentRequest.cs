namespace CertiChain.Application.DTOs.Student;

public class CreateStudentRequest
{
    public string TenantId { get; set; }
    public string StudentNumber { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string? PhoneNumber { get; set; }
    public string? PhotoUrl { get; set; }
    public int? ProgramId { get; set; }
}
