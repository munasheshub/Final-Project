using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Shared;

namespace CertifyChain.Infrastructure.Interfaces;

public interface IProgramService
{
    Task<ServiceResponse<ProgramDto>> CreateAsync(
        ProgramDto request,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<ProgramDto>> UpdateAsync(
        ProgramDto request,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<ProgramDto>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<List<ProgramDto>>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<bool>> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}

