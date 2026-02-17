namespace CertiChain.Application.DTOs.Student;

public class UpdateStudentRequest
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? PhotoUrl { get; set; }
}
