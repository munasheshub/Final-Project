using CertiChain.Application.DTOs.Certificate.CertiChain.Application.DTOs.Student;
using CertifyChain.Infrastructure.Shared;

namespace CertifyChain.Infrastructure.Interfaces;

public interface IStudentService
{
    Task<ServiceResponse<StudentDto>> CreateAsync(
        CreateStudentRequest request,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<StudentDto>> UpdateAsync(
        UpdateStudentRequest request,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<StudentDto>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<List<StudentDto>>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<bool>> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}

public class CreateStudentRequest
{
    public string StudentNumber { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string PhoneNumber { get; set; }
    public string PhotoUrl { get; set; }
}

public class UpdateStudentRequest
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? PhotoUrl { get; set; }
}

