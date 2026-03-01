using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using CertifyChain.Infrastructure.Services;
using CertifyChain.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CertifyChain.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : BaseController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }


    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var result = await _authService.LoginAsync(loginDto);
        if (!result.IsSuccess)
            return Unauthorized(new { result.Message });

        return Ok(result.Data);
    }

    [HttpPost("google-signin")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GoogleSignIn([FromBody] GoogleSignInDto dto)
    {
        var result = await _authService.GoogleSignInAsync(dto);
        if (!result.IsSuccess)
            return BadRequest(new { result.Message });

        return Ok(result.Data);
    }


    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto refreshDto)
    {
        var result = await _authService.RefreshTokenAsync(refreshDto);
        return result.IsSuccess ? Ok(result.Data) : Unauthorized(new { result.Message });
    }

    [HttpGet("profile")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult GetCurrentUser()
    {
        if (Account == null) return Unauthorized();
        var result = _authService.CurrentUserAsync(Account);
        return result.IsSuccess ? Ok(result.Data) : Unauthorized(new { result.Message });
    }


    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Logout([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        var result = await _authService.Logout(forgotPasswordDto.Email);
        return result.IsSuccess
            ? Ok(new { result.Message })
            : BadRequest(new { result.Message });
    }


    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotDto)
    {
        var result = await _authService.ForgotPasswordAsync(forgotDto);
        return result.IsSuccess
            ? Ok(new { result.Message })
            : BadRequest(new { result.Message });
    }


    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetDto)
    {
        var result = await _authService.ResetPasswordAsync(resetDto);
        return result.IsSuccess
            ? Ok(new { result.Message })
            : BadRequest(new { result.Message });
    }


    [HttpPost("create")]
    [RequirePermission(Permission.CreateUsers)]
    [ProducesResponseType(typeof(ServiceResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateUser([FromBody] RegisterDto registerDto)
    {
        var result = await _authService.RegisterAsync(registerDto);
        return result.IsSuccess
            ? Ok(result)
            : BadRequest(new { result.Message });
    }

    // ================= TENANT USER MANAGEMENT =================

    [HttpGet("users")]
    [RequirePermission(Permission.ViewUsers)]
    [ProducesResponseType(typeof(ServiceResponse<List<UserDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAllUsers(CancellationToken cancellationToken)
    {
        var result = await _authService.GetAllUsersAsync(cancellationToken);
        return result.IsSuccess
            ? Ok(result)
            : BadRequest(new { result.Message });
    }

    [HttpGet("users/{id:int}")]
    [RequirePermission(Permission.ViewUsers)]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUserById(int id, CancellationToken cancellationToken)
    {
        var result = await _authService.GetUserByIdAsync(id, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Data)
            : NotFound(new { result.Message });
    }

    [HttpPut("users/{id:int}")]
    [RequirePermission(Permission.UpdateUsers)]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto, CancellationToken cancellationToken)
    {
        var result = await _authService.UpdateUserAsync(id, updateUserDto, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Data)
            : BadRequest(new { result.Message });
    }

    [HttpDelete("users/{id:int}")]
    [RequirePermission(Permission.DeleteUsers)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteUser(int id, CancellationToken cancellationToken)
    {
        var result = await _authService.DeleteUserAsync(id, cancellationToken);
        return result.IsSuccess
            ? Ok(new { result.Message })
            : BadRequest(new { result.Message });
    }
}