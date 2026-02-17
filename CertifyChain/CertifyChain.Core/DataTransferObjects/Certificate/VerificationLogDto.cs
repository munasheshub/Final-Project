namespace CertiChain.Application.DTOs.Certificate;

public class VerificationLogDto
{
    public Guid Id { get; set; }
    public DateTime VerifiedAt { get; set; }
    public string? VerifiedBy { get; set; }
    public string Method { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty;
}