using AutoMapper;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.DataTransferObjects;

namespace CertifyChain.Infrastructure.Mapping;

public class AppMappingProfile : Profile
{
    public AppMappingProfile()
    {
        CreateMap<RegisterDto, User>();
    }
        
    
}