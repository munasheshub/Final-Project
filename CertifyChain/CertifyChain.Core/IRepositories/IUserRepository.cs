using CertifyChain.Domain.Entities;

namespace CertifyChain.Infrastructure.Repositories;


public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id);
    
    public void Update(User user);
    Task<User?> GetByRefreshTokenAsync(string refreshToken);
    Task AddAsync(User user);
    Task SaveChangesAsync();
}
