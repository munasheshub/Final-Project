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
public class AuthController : BaseController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }


    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var result = await _authService.LoginAsync(loginDto);
        if (!result.IsSuccess)
            return Unauthorized(new { result.Message });

        return Ok(result.Data);
    }


    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto refreshDto)
    {
        var result = await _authService.RefreshTokenAsync(refreshDto);
        return result.IsSuccess ? Ok(result.Data) : Unauthorized(new { result.Message });
    }

    [HttpGet("profile")]
    [AllowAnonymous]
    public IActionResult GetCurrentUser()
    {
        if (Account == null) return Unauthorized();
        var result = _authService.CurrentUserAsync(Account);
        return result.IsSuccess ? Ok(result.Data) : Unauthorized(new { result.Message });
    }


    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        var result = await _authService.Logout(forgotPasswordDto.Email);
        return result.IsSuccess
            ? Ok(new { result.Message })
            : BadRequest(new { result.Message });
    }


    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotDto)
    {
        var result = await _authService.ForgotPasswordAsync(forgotDto);
        return result.IsSuccess
            ? Ok(new { result.Message })
            : BadRequest(new { result.Message });
    }


    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetDto)
    {
        var result = await _authService.ResetPasswordAsync(resetDto);
        return result.IsSuccess
            ? Ok(new { result.Message })
            : BadRequest(new { result.Message });
    }


    [HttpPost("create")]
    [RequirePermission(Permission.CreateUsers)]
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
    public async Task<IActionResult> GetAllUsers(CancellationToken cancellationToken)
    {
        var result = await _authService.GetAllUsersAsync(cancellationToken);
        return result.IsSuccess
            ? Ok(result)
            : BadRequest(new { result.Message });
    }

    [HttpGet("users/{id:int}")]
    [RequirePermission(Permission.ViewUsers)]
    public async Task<IActionResult> GetUserById(int id, CancellationToken cancellationToken)
    {
        var result = await _authService.GetUserByIdAsync(id, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Data)
            : NotFound(new { result.Message });
    }

    [HttpPut("users/{id:int}")]
    [RequirePermission(Permission.UpdateUsers)]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto, CancellationToken cancellationToken)
    {
        var result = await _authService.UpdateUserAsync(id, updateUserDto, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Data)
            : BadRequest(new { result.Message });
    }

    [HttpDelete("users/{id:int}")]
    [RequirePermission(Permission.DeleteUsers)]
    public async Task<IActionResult> DeleteUser(int id, CancellationToken cancellationToken)
    {
        var result = await _authService.DeleteUserAsync(id, cancellationToken);
        return result.IsSuccess
            ? Ok(new { result.Message })
            : BadRequest(new { result.Message });
    }
}