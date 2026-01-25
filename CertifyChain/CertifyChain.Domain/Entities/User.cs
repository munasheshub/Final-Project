namespace CertifyChain.Domain.Entities;

// Domain/Entities/User.cs
public class User : AuditableEntity, ITenantEntity
{
    public Guid Id { get; private set; }
    public string TenantId { get; set; }
    
    public string Email { get; private set; }
    public string PasswordHash { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    
    public UserRole Role { get; private set; }
    public List<Permission> Permissions { get; private set; } = new();
    
    public bool IsActive { get; private set; }
    public bool EmailConfirmed { get; private set; }
    public bool TwoFactorEnabled { get; private set; }
    
    public DateTime? LastLoginAt { get; private set; }
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiresAt { get; private set; }
    
    public void UpdatePassword(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
        AddDomainEvent(new PasswordChangedEvent(this));
    }
    
    public void ActivateTwoFactor()
    {
        TwoFactorEnabled = true;
    }
    
    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
    }
}
