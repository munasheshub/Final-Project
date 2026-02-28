using CertifyChain.Data.Persistence;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace CertifyChain.Data.Repositories;

public class FacultyRepository : IFacultyRepository
{
    private readonly ApplicationDbContext _dbContext;
    private readonly DbSet<Faculty> _faculties;

    public FacultyRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
        _faculties = dbContext.Faculties;
    }

    public async Task<Faculty?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _faculties
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<List<Faculty>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _faculties
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Faculty>> GetByInstitutionIdAsync(int institutionId, CancellationToken cancellationToken = default)
    {
        return await _faculties
            .AsNoTracking()
            .Where(f => f.InstitutionId == institutionId)
            .ToListAsync(cancellationToken);
    }

    public async Task<Faculty> AddAsync(Faculty entity, CancellationToken cancellationToken = default)
    {
        await _faculties.AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<List<Faculty>> AddRangeAsync(List<Faculty> entities, CancellationToken cancellationToken = default)
    {
        await _faculties.AddRangeAsync(entities, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entities;
    }

    public async Task UpdateAsync(Faculty entity, CancellationToken cancellationToken = default)
    {
        _faculties.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Faculty entity, CancellationToken cancellationToken = default)
    {
        _faculties.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _faculties.AnyAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await _faculties.CountAsync(cancellationToken);
    }
}
