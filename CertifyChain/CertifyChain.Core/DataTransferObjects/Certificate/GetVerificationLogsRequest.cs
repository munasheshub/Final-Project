namespace CertiChain.Application.DTOs.Certificate;

public class GetVerificationLogsRequest
{
    public string? CertificateHash { get; set; }
    public int? CertificateId { get; set; }
    public bool? IsSuccess { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? IpAddress { get; set; }
}
