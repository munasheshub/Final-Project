// using CertifyChain.Domain.Enums;
//
// namespace CertifyChain.Application.Features.Certificates.Commands.CreateCertificate;
//
// public record CreateCertificateCommand : IRequest<Result<CertificateDto>>
// {
//     public Guid StudentId { get; init; }
//     public QualificationType QualificationType { get; init; }
//     public string ProgramName { get; init; } = string.Empty;
//     public AwardClass AwardClass { get; init; }
//     public DateTime GraduationDate { get; init; }
//     public IFormFile CertificateFile { get; init; } = null!;
//     public bool RunFraudDetection { get; init; } = true;
// }