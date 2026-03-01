using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Shared;

namespace CertifyChain.Infrastructure.Interfaces;

public interface IVerificationLogService
{
    Task<ServiceResponse<VerificationLogResponseDto>> CreateAsync(
        CreateVerificationLogRequest request,
        string? ipAddress,
        string? userAgent,
        UserRole? userRole = null,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<List<VerificationLogResponseDto>>> GetAllAsync(
        GetVerificationLogsRequest request,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<List<VerificationLogResponseDto>>> GetByCertificateHashAsync(
        string certificateHash,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<List<VerificationLogResponseDto>>> GetByCertificateIdAsync(
        int certificateId,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<List<VerificationLogResponseDto>>> GetMyLogsAsync(
        int creatorId,
        CancellationToken cancellationToken = default);
}
