using CertifyChain.Domain.AggregateRoots;
using CertifyChain.Domain.Enums;

namespace CertifyChain.Domain.Entities;

// Domain/Entities/User.cs
public class User : AuditableEntity<int>, ITenantEntity
{
    
    public string TenantId { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get;  set; }
    public string FirstName { get;  set; }
    public string LastName { get;  set; }
    public UserRole Role { get;  set; }
    public List<Permission> Permissions { get;  set; } = new();

    public bool IsActive { get; set; } = false;
    public bool EmailConfirmed { get; set; } = false;
    public bool TwoFactorEnabled { get; set; } = false;

    // Google OAuth
    public string? GoogleId { get; set; }
    public string? PhotoUrl { get; set; }

    public DateTime? LastLoginAt { get;  set; }
    public string? RefreshToken { get;  set; }
    public DateTime? RefreshTokenExpiresAt { get;  set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }
    public DateTime RefreshTokenExpiry { get; set; }
    public Institution? Tenant { get; set; }
}
