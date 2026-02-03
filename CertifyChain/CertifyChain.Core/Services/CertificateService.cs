using System.Globalization;
using System.Security.Cryptography;
using CertiChain.Application.DTOs.Certificate;
using CertiChain.Application.DTOs.Certificate.CertiChain.Application.DTOs.Student;
using CertiChain.Application.DTOs.Certificate.CertiChain.Application.DTOs.Student.CertiChain.Application.DTOs.Verification;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.AI;
using CertifyChain.Infrastructure.AI.Models;
using CertifyChain.Infrastructure.Blockchain;
using CertifyChain.Infrastructure.Blockchain.Dtos;
using CertifyChain.Infrastructure.Blockchain.IPFS;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.MultiTenancy;
using CertifyChain.Infrastructure.Shared;
using CsvHelper;
using Microsoft.Extensions.Logging;
using Nethereum.Contracts.QueryHandlers.MultiCall;
using QRCoder;

namespace CertifyChain.Infrastructure.Services;



public class CertificateService : ICertificateService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IBlockchainService _blockchain;
    private readonly IIpfsService _ipfs;
    private readonly ITenantService _tenantService;
    private readonly IEmailService _emailService;
    private readonly ILogger<CertificateService> _logger;
    private readonly CertificateDataGenerator _certificateDataGenerator;

    public CertificateService(
        IUnitOfWork unitOfWork,
        IBlockchainService blockchain,
        IIpfsService ipfs,
        ITenantService tenantService,
        IEmailService emailService,
        CertificateDataGenerator certificateDataGenerator,
        ILogger<CertificateService> logger)
    {
        _unitOfWork = unitOfWork;
        _blockchain = blockchain;
        _ipfs = ipfs;
        _tenantService = tenantService;
        _emailService = emailService;
        _logger = logger;
        _certificateDataGenerator = certificateDataGenerator;
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

            
            
            byte[] fileData;
            using (var ms = new MemoryStream())
            {
                await request.CertificateFile.CopyToAsync(ms, cancellationToken);
                fileData = ms.ToArray();
            }




            string ipfsCid = "";
            
            
            var generatedCertficateData = await _certificateDataGenerator.GenerateCertificateData(new GenerateCertificateDataRequest
            {
                StudentName = request.StudentName,
                StudentId = request.StudentId,
                InstitutionId = (ushort)tenant.InstitutionId,
                Qualification = request.QualificationType.ToString(),
                IssueDate = request.GraduationDate,
                IpfsCID = ipfsCid,
                CertificateFile = request.CertificateFile
            });

            
            
            Certificate certificate = Certificate.Create(
                tenantId,
                (int)request.StudentId,
                tenant.InstitutionId ?? 0,
                new CertificateData
                {
                    QualificationType = request.QualificationType,
                    ProgramName = request.ProgramName,
                    AwardClass = request.AwardClass,
                    GraduationDate = request.GraduationDate
                });

            // 9. Register on blockchain
            TransactionResult blockchainServiceResponse;
            try
            {
                var newCertificate = new IssueCertificateRequest
                {
                    CertHash = generatedCertficateData.CertHash,
                    StudentId = (int)request.StudentId,
                    IssueDate = request.GraduationDate,
                    IpfsCID = ipfsCid

                };
                blockchainServiceResponse = await _blockchain.IssueCertificate(
                    newCertificate);

                if (!blockchainServiceResponse.Success)
                {
                    _logger.LogError("Blockchain registration failed for certificate {Number}",
                        certificate);
                    return ServiceResponse<CertificateDto>.Failure("Blockchain registration failed");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Blockchain service error");
                return ServiceResponse<CertificateDto>.Failure("Failed to register certificate on blockchain");
            }

            certificate.RegisterOnBlockchain(
                blockchainServiceResponse.TransactionHash,
                ipfsCid,
                generatedCertficateData.CertHash);

            
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
            var ServiceResponse = await _unitOfWork.Certificates.GetPaginatedAsync(
                request.PageNumber,
                request.PageSize,
                request.SearchTerm,
                request.Status,
                request.QualificationType,
                request.FromDate,
                request.ToDate,
                request.SortBy,
                request.SortDescending,
                cancellationToken);

            var dtoServiceResponse = new PaginatedResult<CertificateDto>(
                ServiceResponse.Items.Select(MapToCertificateDto).ToList(),
                ServiceResponse.TotalCount,
                ServiceResponse.PageNumber,
                ServiceResponse.PageSize);

            return ServiceResponse<PaginatedResult<CertificateDto>>.Success(dtoServiceResponse);
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

   

    public async Task<ServiceResponse<bool>> RevokeAsync(
        RevokeCertificateRequest request,
        User account,
        CancellationToken cancellationToken = default
        )
    {
        try
        {
            // Get certificate
            var certificate = await _unitOfWork.Certificates.GetByCertHashWithDetailsAsync(
                request.CertHash,
                cancellationToken);

            if (certificate == null)
            {
                return ServiceResponse<bool>.Failure("Certificate not found");
            }

            if (certificate.Status == CertificateStatus.Revoked)
            {
                return ServiceResponse<bool>.Failure("Certificate is already revoked");
            }

            // 3. Revoke on blockchain
            try
            {
                var cert = new RevokeCertificateRequest
                {
                    CertHash = certificate.CertificateHash,
                    Reason = request.Reason
                };
                var blockchainServiceResponse = await _blockchain.RevokeCertificate(
                    cert);

                if (!blockchainServiceResponse.Success)
                {
                    _logger.LogError(
                        "Blockchain revocation failed for certificate {Number}",
                        certificate.CertificateNumber);
                    return ServiceResponse<bool>.Failure("Blockchain revocation failed");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Blockchain service error during revocation");
                return ServiceResponse<bool>.Failure("Failed to revoke certificate on blockchain");
            }

            // 4. Update certificate entity
            
            //certificate.Revoke(request.Reason, account.Id);

            await _unitOfWork.Certificates.UpdateAsync(certificate, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Certificate {Number} revoked successfully by user {UserId}",
                certificate.CertificateNumber,
                account.Id);

            // 5. Send notification email
            // if (request.SendNotification)
            // {
            //     try
            //     {
            //         await _emailService.SendCertificateRevokedEmailAsync(
            //             certificate.Student.Email,
            //             certificate.Student.FullName,
            //             certificate.CertificateNumber,
            //             request.Reason);
            //     }
            //     catch (Exception ex)
            //     {
            //         _logger.LogWarning(ex, "Failed to send revocation notification email");
            //     }
            // }

            return ServiceResponse<bool>.Success(true,"Certificate revoked successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking certificate {Id}", request.CertHash);
            return ServiceResponse<bool>.Failure("An error occurred while revoking the certificate");
        }
    }

    public async Task<ServiceResponse<CertificateVerificationResult>> VerifyCertificate(string certHash, CancellationToken cancellationToken = default)
    {
        try
        {
            var blockchainServiceResponse = await _blockchain.VerifyCertificate(
                certHash);

            if (blockchainServiceResponse == null)
            {
                _logger.LogError(
                    "Blockchain revocation failed for certificate {Number}",
                    certHash);
                return ServiceResponse<CertificateVerificationResult>.Failure("Blockchain revocation failed");
            }
            
            return ServiceResponse<CertificateVerificationResult>.Success(blockchainServiceResponse, "Blockchain revocation failed");

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error  certificate {Id}", certHash);
            return ServiceResponse<CertificateVerificationResult>.Failure("An error occurred while verifying the certificate");
        }
    }

    public async Task<ServiceResponse<bool>> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            var certificate = await _unitOfWork.Certificates.GetByIdAsync(id, cancellationToken);

            if (certificate == null)
            {
                return ServiceResponse<bool>.Failure("Certificate not found");
            }

            // Only allow deletion of draft certificates
            if (certificate.Status != CertificateStatus.Draft)
            {
                return ServiceResponse<bool>.Failure("Only draft certificates can be deleted");
            }

            await _unitOfWork.Certificates.DeleteAsync(certificate, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Certificate {Id} deleted successfully", id);

            return ServiceResponse<bool>.Success(true,"Certificate deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting certificate {Id}", id);
            return ServiceResponse<bool>.Failure("An error occurred while deleting the certificate");
        }
    }

    public async Task<ServiceResponse<BatchUploadResult>> BatchUploadAsync(
        BatchUploadRequest request,
        CancellationToken cancellationToken = default)
    {
        var ServiceResponse = new BatchUploadResult();

        try
        {
            // 1. Parse CSV file
            List<CertificateCsvRow> rows;
            using (var reader = new StreamReader(request.CsvFile.OpenReadStream()))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                rows = csv.GetRecords<CertificateCsvRow>().ToList();
            }

            ServiceResponse.TotalRecords = rows.Count;

            if (request.ValidateOnly)
            {
                // Only validate, don't create
                await ValidateBatchRows(rows, ServiceResponse, cancellationToken);
                return ServiceResponse<BatchUploadResult>.Success(ServiceResponse);
            }

            // 2. Begin transaction
            await _unitOfWork.BeginTransactionAsync(cancellationToken);

            try
            {
                // 3. Process each row
                for (int i = 0; i < rows.Count; i++)
                {
                    var row = rows[i];
                    var rowNumber = i + 2; // +2 for header and 1-based indexing

                    try
                    {
                        // Validate row
                        var errors = await ValidateRow(row, cancellationToken);
                        if (errors.Any())
                        {
                            ServiceResponse.Errors.Add(new BatchUploadError
                            {
                                RowNumber = rowNumber,
                                StudentNumber = row.StudentNumber,
                                Errors = errors
                            });
                            ServiceResponse.FailureCount++;
                            continue;
                        }

                        //Get student
                        var student = await _unitOfWork.Students.GetByStudentNumberAsync(
                            row.StudentNumber,
                            cancellationToken);
                        
                        if (student == null)
                        {
                            ServiceResponse.Errors.Add(new BatchUploadError
                            {
                                RowNumber = rowNumber,
                                StudentNumber = row.StudentNumber,
                                Errors = new List<string> { "Student not found" }
                            });
                            ServiceResponse.FailureCount++;
                            continue;
                        }

                        // Create certificate (without file - will be uploaded separately)
                        var createRequest = new CreateCertificateRequest
                        {
                            StudentId = (uint)student.Id,
                            ProgramName = row.ProgramName,
                            QualificationType = Enum.Parse<QualificationType>(row.QualificationType),
                            AwardClass = Enum.Parse<AwardClass>(row.AwardClass),
                            GraduationDate = DateTime.Parse(row.GraduationDate),
                            RunFraudDetection = false // Skip for batch
                        };

                        // Note: For batch upload, you'll need to handle files differently
                        // This is a simplified version
                        // In reality, you'd need to map files to student numbers

                        ServiceResponse.SuccessCount++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing row {RowNumber}", rowNumber);
                        ServiceResponse.Errors.Add(new BatchUploadError
                        {
                            RowNumber = rowNumber,
                            StudentNumber = row.StudentNumber,
                            Errors = new List<string> { $"Processing error: {ex.Message}" }
                        });
                        ServiceResponse.FailureCount++;
                    }
                }

                // 4. Commit transaction
                await _unitOfWork.CommitTransactionAsync(cancellationToken);

                return ServiceResponse<BatchUploadResult>.Success(ServiceResponse, "Batch upload completed");
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                throw;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during batch upload");
            return ServiceResponse<BatchUploadResult>.Failure("An error occurred during batch upload");
        }
    }

    public async Task<ServiceResponse<byte[]>> DownloadAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            var certificate = await _unitOfWork.Certificates.GetByIdAsync(id, cancellationToken);

            if (certificate == null)
            {
                return ServiceResponse<byte[]>.Failure("Certificate not found");
            }

            if (string.IsNullOrEmpty(certificate.IpfsCid))
            {
                return ServiceResponse<byte[]>.Failure("Certificate file not available");
            }

            var fileData = await _ipfs.DownloadFileAsync(certificate.IpfsCid);

            return ServiceResponse<byte[]>.Success(fileData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading certificate {Id}", id);
            return ServiceResponse<byte[]>.Failure("An error occurred while downloading the certificate");
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
                certificate.VerificationCode,
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

    private static string ComputeSha256Hash(byte[] data)
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(data);
        return Convert.ToHexString(hash).ToLower();
    }

    private async Task<List<string>> ValidateRow(CertificateCsvRow row, CancellationToken cancellationToken)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(row.StudentNumber))
            errors.Add("Student number is required");

        if (string.IsNullOrWhiteSpace(row.ProgramName))
            errors.Add("Program name is required");

        if (!Enum.TryParse<QualificationType>(row.QualificationType, out _))
            errors.Add("Invalid qualification type");

        if (!Enum.TryParse<AwardClass>(row.AwardClass, out _))
            errors.Add("Invalid award class");

        if (!DateTime.TryParse(row.GraduationDate, out var gradDate))
            errors.Add("Invalid graduation date");
        else if (gradDate > DateTime.Today)
            errors.Add("Graduation date cannot be in the future");

        return errors;
    }

    private async Task ValidateBatchRows(
        List<CertificateCsvRow> rows,
        BatchUploadResult ServiceResponse,
        CancellationToken cancellationToken)
    {
        for (int i = 0; i < rows.Count; i++)
        {
            var row = rows[i];
            var rowNumber = i + 2;

            var errors = await ValidateRow(row, cancellationToken);
            if (errors.Any())
            {
                ServiceResponse.Errors.Add(new BatchUploadError
                {
                    RowNumber = rowNumber,
                    StudentNumber = row.StudentNumber,
                    Errors = errors
                });
                ServiceResponse.FailureCount++;
            }
            else
            {
                ServiceResponse.SuccessCount++;
            }
        }
    }

    private static CertificateDto MapToCertificateDto(Certificate certificate)
    {
        return new CertificateDto
        {
            Id = certificate.Id,
            CertificateNumber = certificate.CertificateNumber,
            StudentName = certificate.Student.FirstName + " " + certificate.Student.LastName,
            ProgramName = certificate.ProgramName,
            QualificationType = certificate.QualificationType.ToString(),
            AwardClass = certificate.AwardClass.ToString(),
            GraduationDate = certificate.GraduationDate,
            Status = "success",
            BlockchainTxHash = certificate.BlockchainTxHash,
            IpfsCid = certificate.IpfsCid,
            VerificationCode = certificate.VerificationCode,
            CreatedAt = certificate.CreationDate
        };
    }

    private static CertificateDetailDto MapToCertificateDetailDto(Certificate certificate)
    {
        return new CertificateDetailDto
        {
            Id = certificate.Id,
            CertificateNumber = certificate.CertificateNumber,
            StudentName = certificate.Student.FirstName + " " + certificate.Student.LastName,
            ProgramName = certificate.ProgramName,
            QualificationType = certificate.QualificationType.ToString(),
            AwardClass = certificate.AwardClass.ToString(),
            GraduationDate = certificate.GraduationDate,
            Status = certificate.Status.ToString(),
            BlockchainTxHash = certificate.BlockchainTxHash,
            IpfsCid = certificate.IpfsCid,
            VerificationCode = certificate.VerificationCode,
            CreatedAt = certificate.CreationDate,
            Student = new StudentDto
            {
                Id = certificate.Student.Id,
                StudentNumber = certificate.Student.StudentNumber,
                FirstName = certificate.Student.FirstName,
                LastName = certificate.Student.LastName,
                Email = certificate.Student.Email,
                DateOfBirth = certificate.Student.DateOfBirth,
                PhotoUrl = certificate.Student.PhotoUrl
            },
            Institution = new InstitutionDto
            {
                Id = certificate.Institution.Id,
                Name = certificate.Institution.Name,
                Code = certificate.Institution.Code,
                LogoUrl = certificate.Institution.LogoUrl
            },
            CertificateHash = certificate.CertificateHash,
            QrCodeData = certificate.QrCodeData,
            RevokedAt = certificate.RevokedAt,
            RevocationReason = certificate.RevocationReason,
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



public class CertificateCsvRow
{
    public string StudentNumber { get; set; } = string.Empty;
    public string ProgramName { get; set; } = string.Empty;
    public string QualificationType { get; set; } = string.Empty;
    public string AwardClass { get; set; } = string.Empty;
    public string GraduationDate { get; set; } = string.Empty;
}

public class BlockchainTransactionServiceResponse
{
    public bool Success { get; set; }
    public string? TransactionHash { get; set; }
    public string? Error { get; set; }
}

