// using System.Security.Cryptography;
// using CertifyChain.Domain.Entities;
// using CertifyChain.Infrastructure.AI;
// using CertifyChain.Infrastructure.AI.Models;
// using CertifyChain.Infrastructure.Blockchain;
// using CertifyChain.Infrastructure.Blockchain.IPFS;
// using CertifyChain.Infrastructure.MultiTenancy;
// using Microsoft.Extensions.Logging;
//
// namespace CertifyChain.Application.Features.Certificates.Commands.CreateCertificate;
//
// public class CreateCertificateCommandHandler 
//     : IRequestHandler<CreateCertificateCommand, Result<CertificateDto>>
// {
//     private readonly IApplicationDbContext _context;
//     private readonly IBlockchainService _blockchain;
//     private readonly IIpfsService _ipfs;
//     private readonly IFraudDetectionService _fraudDetection;
//     private readonly ITenantService _tenantService;
//     private readonly IMapper _mapper;
//     private readonly ILogger<CreateCertificateCommandHandler> _logger;
//     
//     public CreateCertificateCommandHandler(
//         IApplicationDbContext context,
//         IBlockchainService blockchain,
//         IIpfsService ipfs,
//         IFraudDetectionService fraudDetection,
//         ITenantService tenantService,
//         IMapper mapper,
//         ILogger<CreateCertificateCommandHandler> logger)
//     {
//         _context = context;
//         _blockchain = blockchain;
//         _ipfs = ipfs;
//         _fraudDetection = fraudDetection;
//         _tenantService = tenantService;
//         _mapper = mapper;
//         _logger = logger;
//     }
//     
//     public async Task<Result<CertificateDto>> Handle(
//         CreateCertificateCommand request,
//         CancellationToken cancellationToken)
//     {
//         var tenantId = _tenantService.GetCurrentTenantId() 
//             ?? throw new UnauthorizedAccessException("Tenant context required");
//         
//         // 1. Verify student exists
//         var student = await _context.Students
//             .FirstOrDefaultAsync(s => s.Id == request.StudentId, cancellationToken);
//         
//         if (student == null)
//             return Result<CertificateDto>.Failure("Student not found");
//         
//         // 2. Convert file to bytes
//         byte[] fileData;
//         using (var ms = new MemoryStream())
//         {
//             await request.CertificateFile.CopyToAsync(ms, cancellationToken);
//             fileData = ms.ToArray();
//         }
//         
//         // 3. Run AI fraud detection (if enabled)
//         FraudDetectionResult? fraudResult = null;
//         if (request.RunFraudDetection)
//         {
//             fraudResult = await _fraudDetection.AnalyzeCertificateAsync(fileData);
//             
//             if (fraudResult.IsFraudulent && fraudResult.ConfidenceScore > 0.85)
//             {
//                 _logger.LogWarning("Potential fraud detected for student {StudentId}", request.StudentId);
//                 return Result<CertificateDto>.Failure(
//                     $"Document failed fraud detection (confidence: {fraudResult.ConfidenceScore:P})");
//             }
//         }
//         
//         // 4. Generate certificate hash
//         var certificateHash = ComputeSha256Hash(fileData);
//         
//         // 5. Upload to IPFS
//         var ipfsCid = await _ipfs.UploadFileAsync(fileData, request.CertificateFile.FileName);
//         
//         // 6. Get institution
//         var tenant = await _tenantService.GetCurrentTenantAsync();
//         var institutionId = tenant?.InstitutionId 
//             ?? throw new InvalidOperationException("Institution not found");
//         
//         // 7. Create certificate entity
//         var certificate = Certificate.Create(
//             tenantId,
//             request.StudentId,
//             institutionId,
//             new CertificateData
//             {
//                 QualificationType = request.QualificationType,
//                 ProgramName = request.ProgramName,
//                 AwardClass = request.AwardClass,
//                 GraduationDate = request.GraduationDate
//             });
//         
//         // 8. Register on blockchain
//         var blockchainResult = await _blockchain.RegisterCertificateAsync(
//             certificateHash,
//             ipfsCid,
//             certificate.CertificateNumber);
//         
//         if (!blockchainResult.Success)
//         {
//             _logger.LogError("Blockchain registration failed for certificate {Number}", 
//                 certificate.CertificateNumber);
//             return Result<CertificateDto>.Failure("Blockchain registration failed");
//         }
//         
//         certificate.RegisterOnBlockchain(
//             blockchainResult.TransactionHash,
//             ipfsCid,
//             certificateHash);
//         
//         // 9. Store fraud detection results
//         if (fraudResult != null)
//         {
//             if (fraudResult.IsFraudulent)
//             {
//                 certificate.MarkAsFraudulent(
//                     fraudResult.ConfidenceScore,
//                     fraudResult.AnalysisJson);
//             }
//         }
//         
//         // 10. Save to database
//         await _context.Certificates.AddAsync(certificate, cancellationToken);
//         await _context.SaveChangesAsync(cancellationToken);
//         
//         _logger.LogInformation(
//             "Certificate {Number} created successfully for student {StudentId}",
//             certificate.CertificateNumber,
//             request.StudentId);
//         
//         return Result<CertificateDto>.Success(_mapper.Map<CertificateDto>(certificate));
//     }
//     
//     private static string ComputeSha256Hash(byte[] data)
//     {
//         using var sha256 = SHA256.Create();
//         var hash = sha256.ComputeHash(data);
//         return Convert.ToHexString(hash).ToLower();
//     }
// }
