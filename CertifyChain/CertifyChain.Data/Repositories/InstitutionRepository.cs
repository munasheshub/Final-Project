using CertifyChain.Data.Persistence;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace CertifyChain.Data.Repositories;

public class InstitutionRepository : IInstitutionRepository {
    
    private readonly ApplicationDbContext _dbContext;
        private readonly DbSet<Institution> _Institutions;
    
        public InstitutionRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
            _Institutions = dbContext.Institutions;
        }
    public async Task<Institution?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _Institutions
                .IgnoreQueryFilters()
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        }
    
        public async Task<List<Institution>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _Institutions
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }
    
        public async Task<Institution> AddAsync(Institution entity, CancellationToken cancellationToken = default)
        {
            await _Institutions.AddAsync(entity, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
            return entity;
        }
    
        public async Task<List<Institution>> AddRangeAsync(List<Institution> entities, CancellationToken cancellationToken = default)
        {
            await _Institutions.AddRangeAsync(entities, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
            return entities;
        }
    
        public async Task UpdateAsync(Institution entity, CancellationToken cancellationToken = default)
        {
            _Institutions.Update(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    
        public async Task DeleteAsync(Institution entity, CancellationToken cancellationToken = default)
        {
            _Institutions.Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    
        public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _Institutions.AnyAsync(s => s.Id == id, cancellationToken);
        }
    
        public async Task<int> CountAsync(CancellationToken cancellationToken = default)
        {
            return await _Institutions.CountAsync(cancellationToken);
        }
    

}