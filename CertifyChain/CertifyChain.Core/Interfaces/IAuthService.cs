using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Shared;

namespace CertifyChain.Infrastructure.Interfaces;

public interface IAuthService
{
    Task<ServiceResponse<AuthResponseDto>> LoginAsync(LoginDto loginDto);

    ServiceResponse<UserDto> CurrentUserAsync(User account);
    Task<ServiceResponse<AuthResponseDto>> RegisterAsync(RegisterDto registerDto);
    Task<ServiceResponse<bool>> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
    Task<ServiceResponse<bool>> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
    Task<ServiceResponse<bool>> Logout(string email);
    Task<ServiceResponse<AuthResponseDto>> RefreshTokenAsync(RefreshTokenDto refreshTokenDto);

    // Tenant user management
    Task<ServiceResponse<List<UserDto>>> GetAllUsersAsync(CancellationToken cancellationToken = default);
    Task<ServiceResponse<UserDto>> GetUserByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ServiceResponse<UserDto>> UpdateUserAsync(int id, UpdateUserDto updateUserDto, CancellationToken cancellationToken = default);
    Task<ServiceResponse<bool>> DeleteUserAsync(int id, CancellationToken cancellationToken = default);
}

public class UserDto
{
    public int Id { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public string Email { get; set; }
    public bool IsActive { get; set; }
    public string FirstName { get;  set; }
    public string LastName { get;  set; }
    public UserRole Role { get;  set; }
    public List<string> Permissions { get;  set; }
    public DateTime CreationTime  { get; set; }
    public DateTime LastModificationTime  { get; set; }
}