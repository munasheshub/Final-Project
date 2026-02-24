using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using Microsoft.Extensions.Logging;

namespace CertifyChain.Infrastructure.Services;

public class VerificationLogService(
    IUnitOfWork unitOfWork,
    ILogger<VerificationLogService> logger)
    : IVerificationLogService
{
    public async Task<ServiceResponse<VerificationLogResponseDto>> CreateAsync(
        CreateVerificationLogRequest request,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Look up the certificate by hash to get the tenantId
            var certificate = await unitOfWork.Certificates.GetByCertHashWithDetailsAsync(
                request.CertificateHash,
                cancellationToken);

            if (certificate == null)
                return ServiceResponse<VerificationLogResponseDto>.Failure("Certificate not found for the provided hash");

            // Create verification log using tenantId from the certificate
            var verificationLog = VerificationLog.Create(
                certificate.TenantId,
                request.CertificateHash,
                certificate.Id,
                request.IsSuccess,
                request.FailureReason,
                ipAddress,
                userAgent);

            await unitOfWork.VerificationLogs.AddAsync(verificationLog, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "Verification log created for certificate {CertHash} from IP {IpAddress}",
                request.CertificateHash,
                ipAddress);

            return ServiceResponse<VerificationLogResponseDto>.Success(
                MapToDto(verificationLog),
                "Verification log created successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating verification log for {CertHash}", request.CertificateHash);
            return ServiceResponse<VerificationLogResponseDto>.Failure("An error occurred while creating the verification log");
        }
    }

    public async Task<ServiceResponse<List<VerificationLogResponseDto>>> GetByCertificateHashAsync(
        string certificateHash,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await unitOfWork.VerificationLogs.GetByCertificateHashAsync(
                certificateHash,
                cancellationToken);

            var dtos = logs.Select(MapToDto).ToList();

            return ServiceResponse<List<VerificationLogResponseDto>>.Success(dtos);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving verification logs for {CertHash}", certificateHash);
            return ServiceResponse<List<VerificationLogResponseDto>>.Failure("An error occurred while retrieving verification logs");
        }
    }

    public async Task<ServiceResponse<List<VerificationLogResponseDto>>> GetByCertificateIdAsync(
        int certificateId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await unitOfWork.VerificationLogs.GetByCertificateIdAsync(
                certificateId,
                cancellationToken);

            var dtos = logs.Select(MapToDto).ToList();

            return ServiceResponse<List<VerificationLogResponseDto>>.Success(dtos);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving verification logs for certificate {Id}", certificateId);
            return ServiceResponse<List<VerificationLogResponseDto>>.Failure("An error occurred while retrieving verification logs");
        }
    }

    private static VerificationLogResponseDto MapToDto(VerificationLog log)
    {
        return new VerificationLogResponseDto
        {
            Id = log.Id,
            TenantId = log.TenantId,
            CertificateHash = log.CertificateHash,
            CertificateId = log.CertificateId,
            VerifiedAt = log.VerifiedAt,
            VerifiedBy = log.VerifiedBy,
            IsSuccess = log.isSuccess,
            FailureReason = log.FailureReason,
            IpAddress = log.IpAddress,
            UserAgent = log.UserAgent
        };
    }
}
