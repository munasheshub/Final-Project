namespace CertiChain.Application.DTOs.Certificate;

public class BatchUploadResult
{
    public int TotalRecords { get; set; }
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public List<BatchUploadError> Errors { get; set; } = new();
    public List<CertificateDto> CreatedCertificates { get; set; } = new();
}