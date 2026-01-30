using CertifyChain.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace CertiChain.Application.DTOs.Certificate;

public class CreateCertificateRequest
{
    public uint StudentId { get; set; }
    public string ProgramName { get; set; } = string.Empty;
    public QualificationType QualificationType { get; set; }
    public AwardClass AwardClass { get; set; }
    public DateTime GraduationDate { get; set; }
    public IFormFile CertificateFile { get; set; } = null!;
    public bool RunFraudDetection { get; set; } = true;
    public string StudentName { get; set; }
}