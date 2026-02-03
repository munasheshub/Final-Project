using CertifyChain.Infrastructure.Shared;
using Microsoft.Extensions.Logging;
using AutoMapper;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Helpers;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Repositories;

namespace CertifyChain.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtUtils _tokenService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly IMapper _mapper;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUserRepository userRepository,
            IJwtUtils tokenService,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEmailService emailService,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _emailService = emailService;
            _logger = logger;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        #region Register

        public ServiceResponse<UserDto> CurrentUserAsync(User account)
        {
            try
            {
                var user = _mapper.Map<UserDto>(account);
                user.Permissions = RoleService.GetRolePermissionsForFrontend(user.Role);
                
                return ServiceResponse<UserDto>.Success(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user");
                return ServiceResponse<UserDto>.Failure();
            }
        }

        public async Task<ServiceResponse<AuthResponseDto>> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                if (await _userRepository.GetByEmailAsync(registerDto.Email) != null)
                    return ServiceResponse<AuthResponseDto>.Failure("Email already exists.");

                await _unitOfWork.BeginTransactionAsync();

                var user =   _mapper.Map<User>(registerDto);
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
                await _userRepository.AddAsync(user);
                await _userRepository.SaveChangesAsync();

                var authResponse = await _tokenService.GenerateAuthResponseAsync(user);

                await _unitOfWork.CommitTransactionAsync();

                return ServiceResponse<AuthResponseDto>.Success(authResponse, "Registration successful.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering user {Email}", registerDto.Email);
                return ServiceResponse<AuthResponseDto>.Failure("An error occurred during registration.");
            }
        }
        #endregion

        #region Login
        public async Task<ServiceResponse<AuthResponseDto>> LoginAsync(LoginDto loginDto)
        {
            try
            {
                var user = await _userRepository.GetByEmailAsync(loginDto.Email);
                if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                    return ServiceResponse<AuthResponseDto>.Failure("Invalid credentials.");

                var authResponse = await _tokenService.GenerateAuthResponseAsync(user);
                return ServiceResponse<AuthResponseDto>.Success(authResponse, "Login successful.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging in user {Email}", loginDto.Email);
                return ServiceResponse<AuthResponseDto>.Failure("An error occurred during login.");
            }
        }
        #endregion

        #region Forgot Password
        public async Task<ServiceResponse<bool>> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
        {
            try
            {
                var user = await _userRepository.GetByEmailAsync(forgotPasswordDto.Email);
                if (user == null)
                    return ServiceResponse<bool>.Failure("Email not found.");

                // Generate reset token (GUID for simplicity)
                var resetToken = Guid.NewGuid().ToString();
                user.PasswordResetToken = resetToken;
                user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(30);

                await _userRepository.SaveChangesAsync();

                //await _emailService.Send(user.Email, "hotto", "ssd");

                return ServiceResponse<bool>.Success(true, "Password reset email sent.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ForgotPassword for {Email}", forgotPasswordDto.Email);
                return ServiceResponse<bool>.Failure("An error occurred while requesting password reset.");
            }
        }
        #endregion

        #region Reset Password
        public async Task<ServiceResponse<bool>> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            try
            {
                var user = await _userRepository.GetByEmailAsync(resetPasswordDto.Email);
                if (user == null 
                    || user.PasswordResetToken != resetPasswordDto.Token 
                    || user.PasswordResetTokenExpiry < DateTime.UtcNow)
                {
                    return ServiceResponse<bool>.Failure("Invalid or expired token.");
                }

                await _unitOfWork.BeginTransactionAsync();

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(resetPasswordDto.NewPassword);
                user.PasswordResetToken = null;
                user.PasswordResetTokenExpiry = null;

                await _userRepository.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return ServiceResponse<bool>.Success(true, "Password reset successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for {Email}", resetPasswordDto.Email);
                return ServiceResponse<bool>.Failure("An error occurred while resetting the password.");
            }
        }

        #region  Logout

        public async Task<ServiceResponse<bool>> Logout(string email)
        {
            try
            {
                var user = await _userRepository.GetByEmailAsync(email);
                
                if (user == null) return ServiceResponse<bool>.Failure("Email not found.");
                user.RefreshToken = null;
                
                _userRepository.Update(user);


                await _userRepository.SaveChangesAsync();

                return ServiceResponse<bool>.Success(true, "Logged out successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging out {Email}", email);
                return ServiceResponse<bool>.Failure("An error occurred while logging out.");
            }
        }

        #endregion

        

        #endregion

        #region Refresh Token
        public async Task<ServiceResponse<AuthResponseDto>> RefreshTokenAsync(RefreshTokenDto refreshTokenDto)
        {
            try
            {
                var user = await _userRepository.GetByRefreshTokenAsync(refreshTokenDto.RefreshToken);
                if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
                    return ServiceResponse<AuthResponseDto>.Failure("Invalid or expired refresh token.");

                var authResponse = await _tokenService.GenerateAuthResponseAsync(user);
                return ServiceResponse<AuthResponseDto>.Success(authResponse, "Token refreshed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token for {RefreshToken}", refreshTokenDto.RefreshToken);
                return ServiceResponse<AuthResponseDto>.Failure("An error occurred while refreshing the token.");
            }
        }
        #endregion
    }
}