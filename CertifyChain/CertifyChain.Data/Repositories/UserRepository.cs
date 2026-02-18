
using CertifyChain.Data.Persistence;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;

namespace CertifyChain.Domain.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _db;

        public UserRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _db.Users.IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _db.Users
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
        }

        // IRepository implementation with tenant filtering
        public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _db.Users
                .SingleOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);
        }

        public async Task<List<User>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _db.Users
                .Where(u => !u.IsDeleted)
                .ToListAsync(cancellationToken);
        }

        // Get all users ignoring tenant filter (for SuperAdmin)
        public async Task<List<User>> GetAllIgnoreFiltersAsync(CancellationToken cancellationToken = default)
        {
            return await _db.Users
                .IgnoreQueryFilters()
                .Where(u => !u.IsDeleted)
                .ToListAsync(cancellationToken);
        }

        public async Task<User> AddAsync(User entity, CancellationToken cancellationToken = default)
        {
            await _db.Users.AddAsync(entity, cancellationToken);
            return entity;
        }

        public async Task<List<User>> AddRangeAsync(List<User> entities, CancellationToken cancellationToken = default)
        {
            await _db.Users.AddRangeAsync(entities, cancellationToken);
            return entities;
        }

        public async Task UpdateAsync(User entity, CancellationToken cancellationToken = default)
        {
            _db.Users.Update(entity);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(User entity, CancellationToken cancellationToken = default)
        {
            _db.Users.Remove(entity);
            await Task.CompletedTask;
        }

        public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _db.Users.AnyAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);
        }

        public async Task<int> CountAsync(CancellationToken cancellationToken = default)
        {
            return await _db.Users.CountAsync(u => !u.IsDeleted, cancellationToken);
        }

        public void Update(User user)
        {
            _db.Update(user);
        }

        public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
        {
            return await _db.Users
                .SingleOrDefaultAsync(u => u.RefreshToken == refreshToken && u.RefreshTokenExpiry > DateTime.UtcNow);
        }

        public async Task AddAsync(User user)
        {
            await _db.Users.AddAsync(user);
        }

        public async Task SaveChangesAsync()
        {
            await _db.SaveChangesAsync();
        }
    }
}
