
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