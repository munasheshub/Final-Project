using AutoMapper;
using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Entities;
using CertifyChain.Infrastructure.Interfaces;

namespace CertifyChain.Infrastructure.Mapping;

public class AppMappingProfile : Profile
{
    public AppMappingProfile()
    {
        CreateMap<RegisterDto, User>();
        CreateMap<CreateInstitutionRequest, Institution>();
        CreateMap<Institution, InstitutionDto>();
        CreateMap<Program, ProgramDto>().ReverseMap();
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Permissions, opt => opt.Ignore());
    }
        
    
}