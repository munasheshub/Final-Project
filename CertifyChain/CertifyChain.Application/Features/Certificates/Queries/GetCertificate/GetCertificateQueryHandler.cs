using AutoMapper;
using MediatR;

namespace CertifyChain.Application.Features.Certificates.Queries.GetCertificate;

public class GetCertificateQueryHandler 
    : IRequestHandler<GetCertificateQuery, Result<CertificateDetailDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    
    public GetCertificateQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }
    
    public async Task<Result<CertificateDetailDto>> Handle(
        GetCertificateQuery request,
        CancellationToken cancellationToken)
    {
        var certificate = await _context.Certificates
            .Include(c => c.Student)
            .Include(c => c.Institution)
            .Include(c => c.VerificationLogs)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        
        if (certificate == null)
            return Result<CertificateDetailDto>.Failure("Certificate not found");
        
        return Result<CertificateDetailDto>.Success(
            _mapper.Map<CertificateDetailDto>(certificate));
    }
}