using CertifyChain.Data.Persistence;
using CertifyChain.Infrastructure.Entities;
using CertifyChain.Infrastructure.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace CertifyChain.Data.Repositories;

public class ProgramRepository : IProgramRepository {
    
    private readonly ApplicationDbContext _dbContext;
        private readonly DbSet<Program> _Programs;
    
        public ProgramRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
            _Programs = dbContext.Programs;
        }
    public async Task<Program?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _Programs
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        }
    
        public async Task<List<Program>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _Programs
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }
    
        public async Task<Program> AddAsync(Program entity, CancellationToken cancellationToken = default)
        {
            await _Programs.AddAsync(entity, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
            return entity;
        }
    
        public async Task<List<Program>> AddRangeAsync(List<Program> entities, CancellationToken cancellationToken = default)
        {
            await _Programs.AddRangeAsync(entities, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
            return entities;
        }
    
        public async Task UpdateAsync(Program entity, CancellationToken cancellationToken = default)
        {
            _Programs.Update(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    
        public async Task DeleteAsync(Program entity, CancellationToken cancellationToken = default)
        {
            _Programs.Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    
        public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _Programs.AnyAsync(s => s.Id == id, cancellationToken);
        }
    
        public async Task<int> CountAsync(CancellationToken cancellationToken = default)
        {
            return await _Programs.CountAsync(cancellationToken);
        }
    

}