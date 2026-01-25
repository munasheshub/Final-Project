using CertifyChain.Domain.Enums;
using MediatR;

namespace CertifyChain.Application.Features.Certificates.Queries.GetCertificate;

public record GetCertificatesQuery : IRequest<PaginatedResult<CertificateDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public CertificateStatus? Status { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}