using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Infrastructure.Shared;

namespace CertifyChain.Infrastructure.Interfaces;

public interface ICertificateService
{
    Task<ServiceResponse<CertificateDto>> CreateAsync(CreateCertificateRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResponse<CertificateDetailDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ServiceResponse<CertificateDetailDto>> GetByCertificateNumberAsync(string certificateNumber, CancellationToken cancellationToken = default);
    Task<ServiceResponse<CertificateDetailDto>> GetByCertHashAsync(string certHash, CancellationToken cancellationToken = default);
    Task<ServiceResponse<PaginatedResult<CertificateDto>>> GetAllAsync(GetCertificatesRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResponse<CertificateDto>> UpdateAsync(UpdateCertificateRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResponse<bool>> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<ServiceResponse<byte[]>> GenerateQrCodeAsync(int id, CancellationToken cancellationToken = default);
    Task<ServiceResponse<List<CertificateDto>>> GetByStudentIdAsync(int studentId, CancellationToken cancellationToken = default);
}