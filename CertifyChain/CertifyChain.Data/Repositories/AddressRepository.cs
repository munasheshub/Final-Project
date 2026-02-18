using CertifyChain.Data.Persistence;
using CertifyChain.Domain.ValueObject;
using CertifyChain.Infrastructure.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace CertifyChain.Data.Repositories;

public class AddressRepository : IAddressRepository
{
    private readonly ApplicationDbContext _dbContext;
    private readonly DbSet<Address> _addresses;

    public AddressRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
        _addresses = dbContext.Addresses;
    }

    public async Task<Address?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _addresses
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<List<Address>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _addresses
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Address> AddAsync(Address entity, CancellationToken cancellationToken = default)
    {
        await _addresses.AddAsync(entity, cancellationToken);
        return entity;
    }

    public async Task<List<Address>> AddRangeAsync(List<Address> entities, CancellationToken cancellationToken = default)
    {
        await _addresses.AddRangeAsync(entities, cancellationToken);
        return entities;
    }

    public async Task UpdateAsync(Address entity, CancellationToken cancellationToken = default)
    {
        _addresses.Update(entity);
        await Task.CompletedTask;
    }

    public async Task DeleteAsync(Address entity, CancellationToken cancellationToken = default)
    {
        _addresses.Remove(entity);
        await Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _addresses.AnyAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await _addresses.CountAsync(cancellationToken);
    }
}
