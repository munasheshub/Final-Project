namespace CertifyChain.Domain.ValueObject;


public class ContactInfo : ValueObject
{
    public string Email { get; private set; }
    public string Phone { get; private set; }
    public string? Website { get; private set; }
    
    private ContactInfo() { }
    
    public ContactInfo(string email, string phone)
    {
        Email = Guard.Against.InvalidEmail(email, nameof(email));
        Phone = Guard.Against.NullOrEmpty(phone, nameof(phone));
    }
    
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Email;
        yield return Phone;
    }
}