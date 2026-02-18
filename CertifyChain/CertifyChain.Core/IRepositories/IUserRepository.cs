using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;

namespace CertifyChain.Infrastructure.Repositories;


public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id);

    public void Update(User user);
    Task<User?> GetByRefreshTokenAsync(string refreshToken);
    Task AddAsync(User user);
    Task SaveChangesAsync();

    // Get all users ignoring tenant filter (for SuperAdmin)
    Task<List<User>> GetAllIgnoreFiltersAsync(CancellationToken cancellationToken = default);
}
