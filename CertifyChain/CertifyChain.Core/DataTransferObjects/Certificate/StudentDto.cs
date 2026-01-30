namespace CertiChain.Application.DTOs.Certificate.CertiChain.Application.DTOs.Student;

public class StudentDto
{
    public int Id { get; set; }
    public string StudentNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string Email { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string? PhotoUrl { get; set; }
    public string? PhoneNumber { get; set; }
}