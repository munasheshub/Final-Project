using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Shared;

namespace CertifyChain.Infrastructure.Interfaces;

public interface IFacultyService
{
    Task<ServiceResponse<FacultyDto>> CreateAsync(
        CreateFacultyRequest request,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<FacultyDto>> UpdateAsync(
        UpdateFacultyRequest request,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<FacultyDto>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<List<FacultyDto>>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<List<FacultyDto>>> GetByInstitutionIdAsync(
        int institutionId,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<bool>> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}
