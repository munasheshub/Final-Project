using CertifyChain.Domain.Enums;

namespace CertiChain.Application.DTOs.Certificate;

public class UpdateCertificateRequest
{
    public int Id { get; set; }
    public string ProgramName { get; set; } = string.Empty;
    public AwardClass AwardClass { get; set; }
    public DateTime GraduationDate { get; set; }
}