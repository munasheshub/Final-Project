using AutoMapper;
using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.ValueObject;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Entities;
using CertifyChain.Infrastructure.Interfaces;

namespace CertifyChain.Infrastructure.Mapping;

public class AppMappingProfile : Profile
{
    public AppMappingProfile()
    {
        CreateMap<RegisterDto, User>();

        // Address mappings
        CreateMap<CreateAddressRequest, Address>();
        CreateMap<Address, AddressDto>();

        // Institution mappings
        CreateMap<CreateInstitutionRequest, Institution>()
            .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.PhoneNumber))
            .ForMember(dest => dest.Address, opt => opt.Ignore()); // Handle manually in service

        CreateMap<Institution, InstitutionDto>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreationDate));

        // Program mappings
        CreateMap<Program, ProgramDto>().ReverseMap();

        // Faculty mappings
        CreateMap<Faculty, FacultyDto>().ReverseMap();
        CreateMap<CreateFacultyRequest, Faculty>();

        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Permissions, opt => opt.Ignore());
    }
}