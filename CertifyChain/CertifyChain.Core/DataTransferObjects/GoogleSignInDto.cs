using System.ComponentModel.DataAnnotations;

namespace CertifyChain.Infrastructure.DataTransferObjects;

public class GoogleSignInDto
{
    [Required]
    public string Name { get; set; } = null!;

    [Required, EmailAddress]
    public string Email { get; set; } = null!;

    public string? Image { get; set; }

    [Required]
    public string GoogleId { get; set; } = null!;
}
