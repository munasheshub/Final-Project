using CertifyChain.Infrastructure.Shared;
using Microsoft.Extensions.Logging;
using AutoMapper;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
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
        private readonly IUserContext _userContext;

        public AuthService(
            IUserRepository userRepository,
            IJwtUtils tokenService,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEmailService emailService,
            ILogger<AuthService> logger,
            IUserContext userContext)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _emailService = emailService;
            _logger = logger;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _userContext = userContext;
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

        #region Tenant User Management

        public async Task<ServiceResponse<List<UserDto>>> GetAllUsersAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                List<User> users;

                // Check if current user is SuperAdmin
                if (_userContext.UserId.HasValue)
                {
                    var currentUser = await _userRepository.GetByIdAsync(_userContext.UserId.Value);

                    // SuperAdmin can see all users across all tenants
                    if (currentUser != null && currentUser.Role == UserRole.SuperAdmin)
                    {
                        users = await _userRepository.GetAllIgnoreFiltersAsync(cancellationToken);
                    }
                    else
                    {
                        // Regular users see only users in their tenant
                        users = await _userRepository.GetAllAsync(cancellationToken);
                    }
                }
                else
                {
                    // Default to tenant-filtered query
                    users = await _userRepository.GetAllAsync(cancellationToken);
                }

                var userDtos = users.Select(u =>
                {
                    var dto = _mapper.Map<UserDto>(u);
                    dto.Permissions = RoleService.GetRolePermissionsForFrontend(u.Role);
                    return dto;
                }).ToList();

                return ServiceResponse<List<UserDto>>.Success(userDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return ServiceResponse<List<UserDto>>.Failure("An error occurred while retrieving users.");
            }
        }

        public async Task<ServiceResponse<UserDto>> GetUserByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                // DbContext tenant filtering will automatically apply
                var user = await _userRepository.GetByIdAsync(id, cancellationToken);
                if (user == null)
                    return ServiceResponse<UserDto>.Failure("User not found.");

                var userDto = _mapper.Map<UserDto>(user);
                userDto.Permissions = RoleService.GetRolePermissionsForFrontend(user.Role);

                return ServiceResponse<UserDto>.Success(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user {Id}", id);
                return ServiceResponse<UserDto>.Failure("An error occurred while retrieving the user.");
            }
        }

        public async Task<ServiceResponse<UserDto>> UpdateUserAsync(int id, UpdateUserDto updateUserDto, CancellationToken cancellationToken = default)
        {
            try
            {
                // DbContext tenant filtering will automatically apply
                var user = await _userRepository.GetByIdAsync(id, cancellationToken);
                if (user == null)
                    return ServiceResponse<UserDto>.Failure("User not found.");

                // Check if email is being changed and if it's already taken
                if (user.Email != updateUserDto.Email)
                {
                    var existingUser = await _userRepository.GetByEmailAsync(updateUserDto.Email);
                    if (existingUser != null)
                        return ServiceResponse<UserDto>.Failure("Email already exists.");
                }

                await _unitOfWork.BeginTransactionAsync(cancellationToken);

                try
                {
                    // Update user properties
                    user.FirstName = updateUserDto.FirstName;
                    user.LastName = updateUserDto.LastName;
                    user.Email = updateUserDto.Email;
                    user.Role = updateUserDto.Role;
                    user.IsActive = updateUserDto.IsActive;

                    _userRepository.Update(user);
                    await _userRepository.SaveChangesAsync();

                    await _unitOfWork.CommitTransactionAsync(cancellationToken);

                    var userDto = _mapper.Map<UserDto>(user);
                    userDto.Permissions = RoleService.GetRolePermissionsForFrontend(user.Role);

                    _logger.LogInformation("User {Id} updated successfully", id);
                    return ServiceResponse<UserDto>.Success(userDto, "User updated successfully.");
                }
                catch
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {Id}", id);
                return ServiceResponse<UserDto>.Failure("An error occurred while updating the user.");
            }
        }

        public async Task<ServiceResponse<bool>> DeleteUserAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                // DbContext tenant filtering will automatically apply
                var user = await _userRepository.GetByIdAsync(id, cancellationToken);
                if (user == null)
                    return ServiceResponse<bool>.Failure("User not found.");

                await _unitOfWork.BeginTransactionAsync(cancellationToken);

                try
                {
                    await _userRepository.DeleteAsync(user, cancellationToken);
                    await _userRepository.SaveChangesAsync();

                    await _unitOfWork.CommitTransactionAsync(cancellationToken);

                    _logger.LogInformation("User {Id} deleted successfully", id);
                    return ServiceResponse<bool>.Success(true, "User deleted successfully.");
                }
                catch
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {Id}", id);
                return ServiceResponse<bool>.Failure("An error occurred while deleting the user.");
            }
        }

        #endregion
    }
}