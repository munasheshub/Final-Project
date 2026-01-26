using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.Shared;
using Nethereum.Contracts.QueryHandlers.MultiCall;

namespace CertifyChain.Infrastructure.Interfaces;


public interface ICertificateService
{
    Task<ServiceResponse<CertificateDto>> CreateAsync(CreateCertificateRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResponse<CertificateDetailDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ServiceResponse<CertificateDetailDto>> GetByCertificateNumberAsync(string certificateNumber, CancellationToken cancellationToken = default);
    Task<ServiceResponse<PaginatedResult<CertificateDto>>> GetAllAsync(GetCertificatesRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResponse<CertificateDto>> UpdateAsync(UpdateCertificateRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResponse<bool>> RevokeAsync(RevokeCertificateRequest request,User account, CancellationToken cancellationToken = default);
    Task<ServiceResponse<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ServiceResponse<BatchUploadResult>> BatchUploadAsync(BatchUploadRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResponse<byte[]>> DownloadAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ServiceResponse<byte[]>> GenerateQrCodeAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ServiceResponse<List<CertificateDto>>> GetByStudentIdAsync(Guid studentId, CancellationToken cancellationToken = default);
}