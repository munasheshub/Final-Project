using CertiChain.Application.DTOs.Student;
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

    Task<ServiceResponse<StudentDto>> GetByStudentNumberAsync(
        string studentNumber,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<List<StudentDto>>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<bool>> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<BulkUploadResult>> BulkUploadAsync(
        Stream csvStream,
        CancellationToken cancellationToken = default);
}
