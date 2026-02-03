using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using CertifyChain.Infrastructure.Services;
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
    [Authorize(Roles = nameof(UserRole.SuperAdmin))]
    public async Task<IActionResult> CreateUser([FromBody] RegisterDto registerDto)
    {
        var result = await _authService.RegisterAsync(registerDto);
        return result.IsSuccess
            ? Ok(result.Data)
            : BadRequest(new { result.Message });
    }
}