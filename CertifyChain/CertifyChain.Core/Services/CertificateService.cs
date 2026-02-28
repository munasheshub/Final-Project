using System.Globalization;
using CertiChain.Application.DTOs.Certificate;
using CertiChain.Application.DTOs.Student;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.MultiTenancy;
using CertifyChain.Infrastructure.Shared;
using CsvHelper;
using Microsoft.Extensions.Logging;
using QRCoder;

namespace CertifyChain.Infrastructure.Services;



public class CertificateService : ICertificateService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantService _tenantService;
    private readonly ILogger<CertificateService> _logger;

    public CertificateService(
        IUnitOfWork unitOfWork,
        ITenantService tenantService,
        ILogger<CertificateService> logger)
    {
        _unitOfWork = unitOfWork;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<ServiceResponse<CertificateDto>> CreateAsync(
        CreateCertificateRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var tenantId = _tenantService.GetCurrentTenantId()
                           ?? throw new UnauthorizedAccessException("Tenant context required");

            var tenant = await _tenantService.GetCurrentTenantAsync()
                         ?? throw new InvalidOperationException("Tenant not found");

            // Verify student exists
            var student = await _unitOfWork.Students.GetByIdAsync(request.StudentId, cancellationToken);
            if (student == null)
                return ServiceResponse<CertificateDto>.Failure("Student not found");

            // Verify program exists
            var program = await _unitOfWork.Programs.GetByIdAsync(request.ProgramId, cancellationToken);
            if (program == null)
                return ServiceResponse<CertificateDto>.Failure("Program not found");

            // Create certificate entity with blockchain data from frontend
            var certificate = Certificate.Create(
                tenantId,
                request.StudentId,
                request.ProgramId,
                new CertificateData
                {
                    QualificationType = request.QualificationType,
                    ProgramName = request.ProgramName,
                    AwardClass = request.AwardClass,
                    GraduationDate = request.GraduationDate
                });

            // Set blockchain data received from frontend
            certificate.RegisterOnBlockchain(
                request.TransactionHash,
                request.IpfsCID,
                request.CertHash);

            // Save to database
            await _unitOfWork.Certificates.AddAsync(certificate, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Certificate {Number} created successfully for student {StudentId}",
                certificate.CertificateNumber,
                request.StudentId);

            return ServiceResponse<CertificateDto>.Success(
                MapToCertificateDto(certificate),
                "Certificate created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating certificate");
            return ServiceResponse<CertificateDto>.Failure("An error occurred while creating the certificate");
        }
    }



    public async Task<ServiceResponse<CertificateDetailDto>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var certificate = await _unitOfWork.Certificates.GetByIdWithDetailsAsync(id, cancellationToken);

            if (certificate == null)
            {
                return ServiceResponse<CertificateDetailDto>.Failure("Certificate not found");
            }

            return ServiceResponse<CertificateDetailDto>.Success(MapToCertificateDetailDto(certificate));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving certificate {Id}", id);
            return ServiceResponse<CertificateDetailDto>.Failure("An error occurred while retrieving the certificate");
        }
    }

    public async Task<ServiceResponse<CertificateDetailDto>> GetByCertificateNumberAsync(
        string certificateNumber,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var certificate = await _unitOfWork.Certificates.GetByCertificateNumberAsync(
                certificateNumber,
                cancellationToken);

            if (certificate == null)
            {
                return ServiceResponse<CertificateDetailDto>.Failure("Certificate not found");
            }

            return ServiceResponse<CertificateDetailDto>.Success(MapToCertificateDetailDto(certificate));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving certificate {Number}", certificateNumber);
            return ServiceResponse<CertificateDetailDto>.Failure("An error occurred while retrieving the certificate");
        }
    }

    public async Task<ServiceResponse<PaginatedResult<CertificateDto>>> GetAllAsync(
        GetCertificatesRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var certificates = await _unitOfWork.Certificates.GetAllAsync(cancellationToken);

            var dtos = certificates.Select(MapToCertificateDto).ToList();

            var result = new PaginatedResult<CertificateDto>(
                dtos,
                dtos.Count,
                1,
                dtos.Count);

            return ServiceResponse<PaginatedResult<CertificateDto>>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving certificates");
            return ServiceResponse<PaginatedResult<CertificateDto>>.Failure(
                "An error occurred while retrieving certificates");
        }
    }

    public async Task<ServiceResponse<CertificateDto>> UpdateAsync(
        UpdateCertificateRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var certificate = await _unitOfWork.Certificates.GetByIdAsync(request.Id, cancellationToken);

            if (certificate == null)
            {
                return ServiceResponse<CertificateDto>.Failure("Certificate not found");
            }

            if (certificate.Status == CertificateStatus.Revoked)
            {
                return ServiceResponse<CertificateDto>.Failure("Cannot update a revoked certificate");
            }

            // Update allowed fields
            // certificate.UpdateDetails(
            //     request.ProgramName,
            //     request.AwardClass,
            //     request.GraduationDate);

            await _unitOfWork.Certificates.UpdateAsync(certificate, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Certificate {Id} updated successfully", request.Id);

            return ServiceResponse<CertificateDto>.Success(
                MapToCertificateDto(certificate),
                "Certificate updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating certificate {Id}", request.Id);
            return ServiceResponse<CertificateDto>.Failure("An error occurred while updating the certificate");
        }
    }

   



    public async Task<ServiceResponse<CertificateDetailDto>> GetByCertHashAsync(
        string certHash,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var certificate = await _unitOfWork.Certificates.GetByCertHashWithDetailsAsync(
                certHash,
                cancellationToken);

            if (certificate == null)
                return ServiceResponse<CertificateDetailDto>.Failure("Certificate not found");

            return ServiceResponse<CertificateDetailDto>.Success(MapToCertificateDetailDto(certificate));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving certificate by hash {CertHash}", certHash);
            return ServiceResponse<CertificateDetailDto>.Failure("An error occurred while retrieving the certificate");
        }
    }

    public async Task<ServiceResponse<bool>> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            var certificate = await _unitOfWork.Certificates.GetByIdAsync(id, cancellationToken);

            if (certificate == null)
                return ServiceResponse<bool>.Failure("Certificate not found");

            // Only allow deletion of draft certificates
            if (certificate.Status != CertificateStatus.Draft)
                return ServiceResponse<bool>.Failure("Only draft certificates can be deleted");

            await _unitOfWork.Certificates.DeleteAsync(certificate, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Certificate {Id} deleted successfully", id);

            return ServiceResponse<bool>.Success(true, "Certificate deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting certificate {Id}", id);
            return ServiceResponse<bool>.Failure("An error occurred while deleting the certificate");
        }
    }

    public async Task<ServiceResponse<byte[]>> GenerateQrCodeAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var certificate = await _unitOfWork.Certificates.GetByIdAsync(id, cancellationToken);

            if (certificate == null)
            {
                return ServiceResponse<byte[]>.Failure("Certificate not found");
            }

            using var qrGenerator = new QRCodeGenerator();
            using var qrCodeData = qrGenerator.CreateQrCode(
                certificate.CertificateHash,
                QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrCodeData);

            var qrCodeBytes = qrCode.GetGraphic(20);

            return ServiceResponse<byte[]>.Success(qrCodeBytes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating QR code for certificate {Id}", id);
            return ServiceResponse<byte[]>.Failure("An error occurred while generating the QR code");
        }
    }

    public async Task<ServiceResponse<List<CertificateDto>>> GetByStudentIdAsync(
        int studentId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var certificates = await _unitOfWork.Certificates.GetByStudentIdAsync(
                studentId,
                cancellationToken);

            var dtos = certificates.Select(MapToCertificateDto).ToList();

            return ServiceResponse<List<CertificateDto>>.Success(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving certificates for student {StudentId}", studentId);
            return ServiceResponse<List<CertificateDto>>.Failure(
                "An error occurred while retrieving student certificates");
        }
    }

    #region Private Helper Methods

    private static CertificateDto MapToCertificateDto(Certificate certificate)
    {
        return new CertificateDto
        {
            Id = certificate.Id,
            CertificateNumber = certificate.CertificateNumber,
            StudentName = certificate?.Student?.FirstName + " " + certificate?.Student?.LastName,
            ProgramName = certificate?.ProgramName ?? "",
            QualificationType = certificate?.QualificationType.ToString() ?? "",
            AwardClass = certificate?.AwardClass.ToString() ?? "",
            GraduationDate = certificate?.GraduationDate ?? default,
            CertificateHash = certificate?.CertificateHash ?? "",
            Status = "success",
            BlockchainTxHash = certificate?.BlockchainTxHash ?? "",
            IpfsCid = certificate?.IpfsCid ?? "",
            VerificationCode = certificate?.VerificationCode ?? "",
            CreatedAt = certificate?.CreationDate ?? default
        };
    }

    private static CertificateDetailDto MapToCertificateDetailDto(Certificate certificate)
    {
        return new CertificateDetailDto
        {
            Id = certificate.Id,
            CertificateNumber = certificate.CertificateNumber,
            StudentName = certificate?.Student?.FirstName + " " + certificate?.Student?.LastName,
            ProgramName = certificate?.ProgramName ?? "",
            QualificationType = certificate?.QualificationType.ToString() ?? "",
            AwardClass = certificate?.AwardClass.ToString() ?? "",
            GraduationDate = certificate?.GraduationDate ?? default,
            Status = certificate?.Status.ToString() ?? "",
            BlockchainTxHash = certificate?.BlockchainTxHash ?? "",
            IpfsCid = certificate?.IpfsCid ?? "",
            VerificationCode = certificate?.VerificationCode ?? "",
            CreatedAt = certificate?.CreationDate ?? default,
            Student = new StudentDto
            {
                Id = certificate?.Student?.Id ?? default,
                StudentNumber = certificate?.Student?.StudentNumber ?? "",
                FirstName = certificate?.Student?.FirstName ?? "",
                LastName = certificate?.Student?.LastName ?? "",
                Email = certificate?.Student?.Email ?? "",
                DateOfBirth = certificate?.Student?.DateOfBirth ?? default,
                PhotoUrl = certificate?.Student?.PhotoUrl ?? ""
            },
            Institution = new InstitutionDto
            {
                Id = certificate?.Program?.Faculty?.Institution?.Id ?? default,
                Name = certificate?.Program?.Faculty?.Institution?.Name ?? "",
                Code = certificate?.Program?.Faculty?.Institution?.Code ?? "",
                LogoUrl = certificate?.Program?.Faculty?.Institution?.LogoUrl ?? ""
            },
            CertificateHash = certificate?.CertificateHash ?? "",
            QrCodeData = certificate?.QrCodeData ?? "",
            RevokedAt = certificate?.RevokedAt ?? default,
            RevocationReason = certificate?.RevocationReason ?? "",
            FraudConfidenceScore = 90,
            FraudDetected = false,
            VerificationLogs = certificate.VerificationLogs.Select(v => new VerificationLogDto
            {
                Id = v.Id,
                VerifiedAt = v.VerifiedAt,
                VerifiedBy = v.VerifiedBy,
                Method = "dhdh",
                Result = "737"
            }).ToList()
        };
    }
    #endregion
}

