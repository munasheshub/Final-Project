using CertifyChain.Domain.Enums;

namespace CertiChain.Application.DTOs.Certificate;

public class GetCertificatesRequest
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    public CertificateStatus? Status { get; set; }
    public QualificationType? QualificationType { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}
