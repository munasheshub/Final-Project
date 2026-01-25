namespace CertifyChain.Domain.ValueObject;

// Domain/ValueObjects/Address.cs
public class Address : ValueObject
{
    public string Street { get; private set; }
    public string City { get; private set; }
    public string Province { get; private set; }
    public string Country { get; private set; }
    public string? PostalCode { get; private set; }
    
    private Address() { } // EF Core
    
    public Address(string street, string city, string province, string country)
    {
        Street = Guard.Against.NullOrEmpty(street, nameof(street));
        City = Guard.Against.NullOrEmpty(city, nameof(city));
        Province = Guard.Against.NullOrEmpty(province, nameof(province));
        Country = Guard.Against.NullOrEmpty(country, nameof(country));
    }
    
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return Province;
        yield return Country;
    }
}
