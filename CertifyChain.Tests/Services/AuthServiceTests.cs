using AutoMapper;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Helpers;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Repositories;
using CertifyChain.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using Moq;

namespace CertifyChain.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<IJwtUtils> _jwtUtilsMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<ILogger<AuthService>> _loggerMock;
    private readonly Mock<IUserContext> _userContextMock;
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _jwtUtilsMock = new Mock<IJwtUtils>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _emailServiceMock = new Mock<IEmailService>();
        _mapperMock = new Mock<IMapper>();
        _loggerMock = new Mock<ILogger<AuthService>>();
        _userContextMock = new Mock<IUserContext>();

        _sut = new AuthService(
            _userRepoMock.Object,
            _jwtUtilsMock.Object,
            _unitOfWorkMock.Object,
            _mapperMock.Object,
            _emailServiceMock.Object,
            _loggerMock.Object,
            _userContextMock.Object);
    }

    #region RegisterAsync

    [Fact]
    public async Task RegisterAsync_NewEmail_ReturnsSuccess()
    {
        _userRepoMock.Setup(x => x.GetByEmailAsync("new@test.com")).ReturnsAsync((User?)null);

        var user = new User
        {
            TenantId = "t1", Email = "new@test.com", FirstName = "John", LastName = "Doe",
            PasswordHash = "", Role = UserRole.Viewer
        };
        _mapperMock.Setup(x => x.Map<User>(It.IsAny<RegisterDto>())).Returns(user);

        var authResponse = new AuthResponseDto
        {
            AccessToken = "jwt-token",
            RefreshToken = "refresh-token",
            Expiration = DateTime.UtcNow.AddHours(15)
        };
        _jwtUtilsMock.Setup(x => x.GenerateAuthResponseAsync(It.IsAny<User>())).ReturnsAsync(authResponse);

        var request = new RegisterDto
        {
            TenantId = "t1", Email = "new@test.com", FirstName = "John", LastName = "Doe",
            Password = "Password123!", ConfirmPassword = "Password123!", Role = UserRole.Viewer
        };

        var result = await _sut.RegisterAsync(request);

        Assert.True(result.IsSuccess);
        Assert.Equal("jwt-token", result.Data!.AccessToken);
        Assert.Equal("Registration successful.", result.Message);
    }

    [Fact]
    public async Task RegisterAsync_ExistingEmail_ReturnsFailure()
    {
        var existingUser = new User
        {
            TenantId = "t1", Email = "exists@test.com", FirstName = "X", LastName = "Y",
            PasswordHash = "hash", Role = UserRole.Viewer
        };
        _userRepoMock.Setup(x => x.GetByEmailAsync("exists@test.com")).ReturnsAsync(existingUser);

        var request = new RegisterDto
        {
            TenantId = "t1", Email = "exists@test.com", FirstName = "A", LastName = "B",
            Password = "Pass123!", ConfirmPassword = "Pass123!", Role = UserRole.Viewer
        };

        var result = await _sut.RegisterAsync(request);

        Assert.False(result.IsSuccess);
        Assert.Equal("Email already exists.", result.Message);
    }

    #endregion

    #region LoginAsync

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsSuccess()
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
        var user = new User
        {
            TenantId = "t1", Email = "user@test.com", FirstName = "John", LastName = "Doe",
            PasswordHash = passwordHash, Role = UserRole.Viewer
        };

        _userRepoMock.Setup(x => x.GetByEmailAsync("user@test.com")).ReturnsAsync(user);

        var authResponse = new AuthResponseDto
        {
            AccessToken = "jwt-token", RefreshToken = "refresh-token",
            Expiration = DateTime.UtcNow.AddHours(15)
        };
        _jwtUtilsMock.Setup(x => x.GenerateAuthResponseAsync(user)).ReturnsAsync(authResponse);

        var result = await _sut.LoginAsync(new LoginDto { Email = "user@test.com", Password = "Password123!" });

        Assert.True(result.IsSuccess);
        Assert.Equal("Login successful.", result.Message);
        Assert.Equal("jwt-token", result.Data!.AccessToken);
    }

    [Fact]
    public async Task LoginAsync_UserNotFound_ReturnsFailure()
    {
        _userRepoMock.Setup(x => x.GetByEmailAsync("unknown@test.com")).ReturnsAsync((User?)null);

        var result = await _sut.LoginAsync(new LoginDto { Email = "unknown@test.com", Password = "Pass" });

        Assert.False(result.IsSuccess);
        Assert.Equal("Invalid credentials.", result.Message);
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ReturnsFailure()
    {
        var user = new User
        {
            TenantId = "t1", Email = "user@test.com", FirstName = "John", LastName = "Doe",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword"), Role = UserRole.Viewer
        };
        _userRepoMock.Setup(x => x.GetByEmailAsync("user@test.com")).ReturnsAsync(user);

        var result = await _sut.LoginAsync(new LoginDto { Email = "user@test.com", Password = "WrongPassword" });

        Assert.False(result.IsSuccess);
        Assert.Equal("Invalid credentials.", result.Message);
    }

    #endregion

    #region ForgotPasswordAsync

    [Fact]
    public async Task ForgotPasswordAsync_UserExists_ReturnsSuccess()
    {
        var user = new User
        {
            TenantId = "t1", Email = "user@test.com", FirstName = "J", LastName = "D",
            PasswordHash = "hash", Role = UserRole.Viewer
        };
        _userRepoMock.Setup(x => x.GetByEmailAsync("user@test.com")).ReturnsAsync(user);

        var result = await _sut.ForgotPasswordAsync(new ForgotPasswordDto { Email = "user@test.com" });

        Assert.True(result.IsSuccess);
        Assert.Equal("Password reset email sent.", result.Message);
        Assert.NotNull(user.PasswordResetToken);
        Assert.NotNull(user.PasswordResetTokenExpiry);
    }

    [Fact]
    public async Task ForgotPasswordAsync_UserNotFound_ReturnsFailure()
    {
        _userRepoMock.Setup(x => x.GetByEmailAsync("nobody@test.com")).ReturnsAsync((User?)null);

        var result = await _sut.ForgotPasswordAsync(new ForgotPasswordDto { Email = "nobody@test.com" });

        Assert.False(result.IsSuccess);
        Assert.Equal("Email not found.", result.Message);
    }

    #endregion

    #region ResetPasswordAsync

    [Fact]
    public async Task ResetPasswordAsync_ValidToken_ReturnsSuccess()
    {
        var resetToken = Guid.NewGuid().ToString();
        var user = new User
        {
            TenantId = "t1", Email = "user@test.com", FirstName = "J", LastName = "D",
            PasswordHash = "oldhash", Role = UserRole.Viewer,
            PasswordResetToken = resetToken,
            PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(15)
        };
        _userRepoMock.Setup(x => x.GetByEmailAsync("user@test.com")).ReturnsAsync(user);

        var result = await _sut.ResetPasswordAsync(new ResetPasswordDto
        {
            Email = "user@test.com",
            Token = resetToken,
            NewPassword = "NewPassword123!",
            ConfirmPassword = "NewPassword123!"
        });

        Assert.True(result.IsSuccess);
        Assert.Equal("Password reset successfully.", result.Message);
        Assert.Null(user.PasswordResetToken);
        Assert.Null(user.PasswordResetTokenExpiry);
        Assert.True(BCrypt.Net.BCrypt.Verify("NewPassword123!", user.PasswordHash));
    }

    [Fact]
    public async Task ResetPasswordAsync_ExpiredToken_ReturnsFailure()
    {
        var user = new User
        {
            TenantId = "t1", Email = "user@test.com", FirstName = "J", LastName = "D",
            PasswordHash = "hash", Role = UserRole.Viewer,
            PasswordResetToken = "token",
            PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(-5) // expired
        };
        _userRepoMock.Setup(x => x.GetByEmailAsync("user@test.com")).ReturnsAsync(user);

        var result = await _sut.ResetPasswordAsync(new ResetPasswordDto
        {
            Email = "user@test.com", Token = "token",
            NewPassword = "New123!", ConfirmPassword = "New123!"
        });

        Assert.False(result.IsSuccess);
        Assert.Equal("Invalid or expired token.", result.Message);
    }

    [Fact]
    public async Task ResetPasswordAsync_WrongToken_ReturnsFailure()
    {
        var user = new User
        {
            TenantId = "t1", Email = "user@test.com", FirstName = "J", LastName = "D",
            PasswordHash = "hash", Role = UserRole.Viewer,
            PasswordResetToken = "correct-token",
            PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(15)
        };
        _userRepoMock.Setup(x => x.GetByEmailAsync("user@test.com")).ReturnsAsync(user);

        var result = await _sut.ResetPasswordAsync(new ResetPasswordDto
        {
            Email = "user@test.com", Token = "wrong-token",
            NewPassword = "New123!", ConfirmPassword = "New123!"
        });

        Assert.False(result.IsSuccess);
        Assert.Equal("Invalid or expired token.", result.Message);
    }

    #endregion

    #region Logout

    [Fact]
    public async Task Logout_UserExists_ClearsRefreshToken()
    {
        var user = new User
        {
            TenantId = "t1", Email = "user@test.com", FirstName = "J", LastName = "D",
            PasswordHash = "hash", Role = UserRole.Viewer, RefreshToken = "some-token"
        };
        _userRepoMock.Setup(x => x.GetByEmailAsync("user@test.com")).ReturnsAsync(user);

        var result = await _sut.Logout("user@test.com");

        Assert.True(result.IsSuccess);
        Assert.Equal("Logged out successfully.", result.Message);
        Assert.Null(user.RefreshToken);
        _userRepoMock.Verify(x => x.Update(user), Times.Once);
    }

    [Fact]
    public async Task Logout_UserNotFound_ReturnsFailure()
    {
        _userRepoMock.Setup(x => x.GetByEmailAsync("nobody@test.com")).ReturnsAsync((User?)null);

        var result = await _sut.Logout("nobody@test.com");

        Assert.False(result.IsSuccess);
        Assert.Equal("Email not found.", result.Message);
    }

    #endregion

    #region RefreshTokenAsync

    [Fact]
    public async Task RefreshTokenAsync_ValidToken_ReturnsNewTokens()
    {
        var user = new User
        {
            TenantId = "t1", Email = "user@test.com", FirstName = "J", LastName = "D",
            PasswordHash = "hash", Role = UserRole.Viewer,
            RefreshToken = "valid-refresh", RefreshTokenExpiry = DateTime.UtcNow.AddDays(1)
        };
        _userRepoMock.Setup(x => x.GetByRefreshTokenAsync("valid-refresh")).ReturnsAsync(user);

        var authResponse = new AuthResponseDto
        {
            AccessToken = "new-jwt", RefreshToken = "new-refresh",
            Expiration = DateTime.UtcNow.AddHours(15)
        };
        _jwtUtilsMock.Setup(x => x.GenerateAuthResponseAsync(user)).ReturnsAsync(authResponse);

        var result = await _sut.RefreshTokenAsync(new RefreshTokenDto { RefreshToken = "valid-refresh" });

        Assert.True(result.IsSuccess);
        Assert.Equal("new-jwt", result.Data!.AccessToken);
        Assert.Equal("Token refreshed successfully.", result.Message);
    }

    [Fact]
    public async Task RefreshTokenAsync_InvalidToken_ReturnsFailure()
    {
        _userRepoMock.Setup(x => x.GetByRefreshTokenAsync("bad-token")).ReturnsAsync((User?)null);

        var result = await _sut.RefreshTokenAsync(new RefreshTokenDto { RefreshToken = "bad-token" });

        Assert.False(result.IsSuccess);
        Assert.Equal("Invalid or expired refresh token.", result.Message);
    }

    [Fact]
    public async Task RefreshTokenAsync_ExpiredToken_ReturnsFailure()
    {
        var user = new User
        {
            TenantId = "t1", Email = "user@test.com", FirstName = "J", LastName = "D",
            PasswordHash = "hash", Role = UserRole.Viewer,
            RefreshToken = "expired-token", RefreshTokenExpiry = DateTime.UtcNow.AddDays(-1) // expired
        };
        _userRepoMock.Setup(x => x.GetByRefreshTokenAsync("expired-token")).ReturnsAsync(user);

        var result = await _sut.RefreshTokenAsync(new RefreshTokenDto { RefreshToken = "expired-token" });

        Assert.False(result.IsSuccess);
        Assert.Equal("Invalid or expired refresh token.", result.Message);
    }

    #endregion

    #region GetUserByIdAsync

    [Fact]
    public async Task GetUserByIdAsync_UserExists_ReturnsSuccess()
    {
        var user = new User
        {
            TenantId = "t1", Email = "user@test.com", FirstName = "J", LastName = "D",
            PasswordHash = "hash", Role = UserRole.Registrar
        };
        _userRepoMock.Setup(x => x.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(user);

        var userDto = new UserDto { Id = 1, Email = "user@test.com", FirstName = "J", LastName = "D", Role = UserRole.Registrar };
        _mapperMock.Setup(x => x.Map<UserDto>(user)).Returns(userDto);

        var result = await _sut.GetUserByIdAsync(1);

        Assert.True(result.IsSuccess);
        Assert.Equal("user@test.com", result.Data!.Email);
        Assert.NotNull(result.Data.Permissions);
    }

    [Fact]
    public async Task GetUserByIdAsync_UserNotFound_ReturnsFailure()
    {
        _userRepoMock.Setup(x => x.GetByIdAsync(999, It.IsAny<CancellationToken>())).ReturnsAsync((User?)null);

        var result = await _sut.GetUserByIdAsync(999);

        Assert.False(result.IsSuccess);
        Assert.Equal("User not found.", result.Message);
    }

    #endregion

    #region DeleteUserAsync

    [Fact]
    public async Task DeleteUserAsync_UserExists_ReturnsSuccess()
    {
        var user = new User
        {
            TenantId = "t1", Email = "user@test.com", FirstName = "J", LastName = "D",
            PasswordHash = "hash", Role = UserRole.Viewer
        };
        _userRepoMock.Setup(x => x.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(user);

        var result = await _sut.DeleteUserAsync(1);

        Assert.True(result.IsSuccess);
        Assert.Equal("User deleted successfully.", result.Message);
        _unitOfWorkMock.Verify(x => x.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteUserAsync_UserNotFound_ReturnsFailure()
    {
        _userRepoMock.Setup(x => x.GetByIdAsync(999, It.IsAny<CancellationToken>())).ReturnsAsync((User?)null);

        var result = await _sut.DeleteUserAsync(999);

        Assert.False(result.IsSuccess);
        Assert.Equal("User not found.", result.Message);
    }

    #endregion

    #region CurrentUserAsync

    [Fact]
    public void CurrentUserAsync_ValidUser_ReturnsSuccessWithPermissions()
    {
        var user = new User
        {
            TenantId = "t1", Email = "admin@test.com", FirstName = "Admin", LastName = "User",
            PasswordHash = "hash", Role = UserRole.InstitutionAdmin
        };
        var userDto = new UserDto
        {
            Id = 1, Email = "admin@test.com", FirstName = "Admin", LastName = "User",
            Role = UserRole.InstitutionAdmin
        };
        _mapperMock.Setup(x => x.Map<UserDto>(user)).Returns(userDto);

        var result = _sut.CurrentUserAsync(user);

        Assert.True(result.IsSuccess);
        Assert.Equal("admin@test.com", result.Data!.Email);
        Assert.NotNull(result.Data.Permissions);
        Assert.NotEmpty(result.Data.Permissions);
    }

    #endregion
}
