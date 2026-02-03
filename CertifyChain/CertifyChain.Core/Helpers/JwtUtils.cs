using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Repositories;
using CertifyChain.Infrastructure.Shared;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CertifyChain.Infrastructure.Helpers;

public interface IJwtUtils
{
    string GenerateJwtToken(User account);

    Task<User?> ValidateJwtToken(string token);
    Task<AuthResponseDto> GenerateAuthResponseAsync(User user);
    string GenerateRefreshToken();
}

public class JwtUtils : IJwtUtils
{
    private readonly IUserRepository _userRepository;
    private readonly AppSettings _appSettings;

    public JwtUtils(IUserRepository userRepository, IOptions<AppSettings> appSettings)
    {
        _userRepository = userRepository;
        _appSettings = appSettings.Value;
    }

    public string GenerateJwtToken(User account)
    {
        JwtSecurityTokenHandler securityTokenHandler = new JwtSecurityTokenHandler();
        byte[] bytes = Encoding.ASCII.GetBytes(_appSettings.Secret);
        List<Claim> claimList = new List<Claim>()
        {
            new Claim("name", account.FirstName + " " + account.LastName),
            new Claim("tenant-id", account.TenantId.ToString()),
            new Claim(ClaimTypes.Role, account.Role.ToString()),
            new Claim("id", account.Id.ToString())
        };
        return securityTokenHandler.WriteToken(securityTokenHandler.CreateToken(new SecurityTokenDescriptor()
        {
            Subject = new ClaimsIdentity( claimList),
            Expires = new DateTime?(DateTime.UtcNow.AddHours(15.0)),
            SigningCredentials = new SigningCredentials((SecurityKey) new SymmetricSecurityKey(bytes), "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256")
        }));
    }

    public async Task<User?> ValidateJwtToken(string token)
    {
        if (token == null)
            return null;

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
        try
        {
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
        
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            var userId = int.Parse(jwtToken.Claims.First(x => x.Type == "id").Value);


            var account = await _userRepository.GetByIdAsync(userId);
            return account;
        }
        catch
        {
            // return null if validation fails
            return null;
        }
   
    }
    
    public async Task<AuthResponseDto> GenerateAuthResponseAsync(User user)
    {
        
        var jwtToken = GenerateJwtToken(user);

        
        var refreshToken = GenerateRefreshToken();

  
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        
        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();

        
        return new AuthResponseDto
        {
            AccessToken = jwtToken,
            RefreshToken = refreshToken,
            Expiration = DateTime.UtcNow.AddHours(15) 
        };
    }


    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = new System.Security.Cryptography.RNGCryptoServiceProvider();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }
}