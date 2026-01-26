using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Shared;

namespace CertifyChain.Infrastructure.Interfaces;

public interface IAuthService
{
    Task<ServiceResponse<AuthResponseDto>> LoginAsync(LoginDto loginDto);
    Task<ServiceResponse<AuthResponseDto>> RegisterAsync(RegisterDto registerDto);
    Task<ServiceResponse<bool>> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
    Task<ServiceResponse<bool>> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
    Task<ServiceResponse<bool>> Logout(string email);
    Task<ServiceResponse<AuthResponseDto>> RefreshTokenAsync(RefreshTokenDto refreshTokenDto);
}