using CertifyChain.Data.Persistence;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace CertifyChain.Data.Repositories;

public class VerificationLogRepository : IVerificationLogRepository
{
    private readonly ApplicationDbContext _dbContext;
    private readonly DbSet<VerificationLog> _verificationLogs;

    public VerificationLogRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
        _verificationLogs = dbContext.VerificationLogs;
    }

    public async Task<VerificationLog?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        throw new NotSupportedException("VerificationLog uses Guid as ID. Use GetByCertificateHashAsync instead.");
    }

    public async Task<List<VerificationLog>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _verificationLogs
            .AsNoTracking()
            .Include(v => v.Certificate)
            .Include(v => v.Creator)
            .OrderByDescending(v => v.VerifiedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<VerificationLog> AddAsync(VerificationLog entity, CancellationToken cancellationToken = default)
    {
        await _verificationLogs.AddAsync(entity, cancellationToken);
        return entity;
    }

    public async Task<List<VerificationLog>> AddRangeAsync(List<VerificationLog> entities, CancellationToken cancellationToken = default)
    {
        await _verificationLogs.AddRangeAsync(entities, cancellationToken);
        return entities;
    }

    public async Task UpdateAsync(VerificationLog entity, CancellationToken cancellationToken = default)
    {
        _verificationLogs.Update(entity);
        await Task.CompletedTask;
    }

    public async Task DeleteAsync(VerificationLog entity, CancellationToken cancellationToken = default)
    {
        _verificationLogs.Remove(entity);
        await Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
    {
        throw new NotSupportedException("VerificationLog uses Guid as ID.");
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await _verificationLogs.CountAsync(cancellationToken);
    }

    public async Task<List<VerificationLog>> GetByCertificateHashAsync(string certificateHash, CancellationToken cancellationToken = default)
    {
        return await _verificationLogs
            .AsNoTracking()
            .Where(v => v.CertificateHash == certificateHash)
            .OrderByDescending(v => v.VerifiedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<VerificationLog>> GetByCertificateIdAsync(int certificateId, CancellationToken cancellationToken = default)
    {
        return await _verificationLogs
            .AsNoTracking()
            .Where(v => v.CertificateId == certificateId)
            .OrderByDescending(v => v.VerifiedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<VerificationLog>> GetByCreatorIdAsync(int creatorId, CancellationToken cancellationToken = default)
    {
        return await _verificationLogs
            .AsNoTracking()
            .Where(v => v.CreatorId == creatorId)
            .OrderByDescending(v => v.VerifiedAt)
            .ToListAsync(cancellationToken);
    }
}
