using CertifyChain.Domain.AggregateRoots;
using CertifyChain.Domain.Entities;

namespace CertifyChain.Domain.ValueObject;

// Domain/ValueObjects/Address.cs
public class Address : BaseEntity<int>
{
    public string Street { get; private set; }
    public string City { get; private set; }
    public string Province { get; private set; }
    public string Country { get; private set; }
    public string? PostalCode { get; private set; }
    public Institution? Institutions { get; private set; }

    private Address() { }

    public static Address Create(
        string street,
        string city,
        string province,
        string country,
        string? postalCode = null)
    {
        return new Address
        {
            Street = street,
            City = city,
            Province = province,
            Country = country,
            PostalCode = postalCode
        };
    }

    public void Update(
        string street,
        string city,
        string province,
        string country,
        string? postalCode = null)
    {
        Street = street;
        City = city;
        Province = province;
        Country = country;
        PostalCode = postalCode;
    }
}
