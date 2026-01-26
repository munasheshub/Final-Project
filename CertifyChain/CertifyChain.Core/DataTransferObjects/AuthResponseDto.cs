namespace CertifyChain.Infrastructure.DataTransferObjects;

public class AuthResponseDto
{
    public string Token { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public DateTime Expiration { get; set; }
}