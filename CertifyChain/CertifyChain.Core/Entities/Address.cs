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
    
}
