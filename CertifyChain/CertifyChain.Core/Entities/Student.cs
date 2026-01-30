using CertifyChain.Domain.AggregateRoots;
using CertifyChain.Domain.ValueObject;

namespace CertifyChain.Domain.Entities;


public class Student : AuditableEntity<int>, ITenantEntity
{
    public string TenantId { get; set; }
    
    public string StudentNumber { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string Email { get; private set; }
    public DateTime DateOfBirth { get; private set; }
    
    public string? PhotoUrl { get; private set; }
    public string? PhoneNumber { get; private set; }
    
    public List<Certificate> Certificates { get; private set; } = new();


    public static Student Create( string studentNumber, string firstName, string lastName, string email, DateTime dateOfBirth, string phoneNumber, string photoUrl)
    {
        

        return new Student
        {
            StudentNumber = studentNumber,
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            DateOfBirth = dateOfBirth,
            PhoneNumber = phoneNumber,
            PhotoUrl = photoUrl
            

        };
    }
    
    public void UpdateProfile(string firstName, string lastName, string email, string? phoneNumber, string? photoUrl)
    {
        if (!string.IsNullOrWhiteSpace(firstName)) FirstName = firstName;
        if (!string.IsNullOrWhiteSpace(lastName)) LastName = lastName;
        if (!string.IsNullOrWhiteSpace(email)) Email = email;
        PhoneNumber = phoneNumber;
        PhotoUrl = photoUrl;
    }
}
