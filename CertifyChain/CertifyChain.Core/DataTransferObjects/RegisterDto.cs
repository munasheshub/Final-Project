using System.ComponentModel.DataAnnotations;
using CertifyChain.Domain.Enums;

namespace CertifyChain.Infrastructure.DataTransferObjects;

public class RegisterDto
{
    public required string TenantId { get; set; }
    [EmailAddress]
    public required string Email { get; set; }
    public required UserRole Role { get; set; }
    public required string FirstName { get;  set; }
    public required string LastName { get;  set; }
    public required string Password { get; set; } = null!;
    public required string ConfirmPassword { get; set; } = null!;
}