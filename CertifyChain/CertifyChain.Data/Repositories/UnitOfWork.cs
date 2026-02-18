using CertifyChain.Core.IRepositories;
using CertifyChain.Data.Persistence;
using CertifyChain.Infrastructure.IRepositories;
using CertifyChain.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore.Storage;


namespace CertiChain.Data.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;

    public ICertificateRepository Certificates { get; }
    public IStudentRepository Students { get; }

    public IInstitutionRepository Institutions { get; }
    public IProgramRepository Programs { get; }
    public IUserRepository Users { get; }
    public ITenantRepository Tenants { get; }
    public IAddressRepository Addresses { get; }
    //public IVerificationLogRepository VerificationLogs { get; }
    //public IAuditLogRepository AuditLogs { get; }

    public UnitOfWork(
        ApplicationDbContext context,
        ICertificateRepository certificates,
        IStudentRepository students,
        IInstitutionRepository institutions,
        IProgramRepository programs,
        IUserRepository users,
        ITenantRepository tenants,
        IAddressRepository addresses
        //IVerificationLogRepository verificationLogs,
        //IAuditLogRepository auditLogs
        )
    {
        _context = context;
        Certificates = certificates;
        Students = students;
        Users = users;
        Institutions = institutions;
        Programs = programs;
        Tenants = tenants;
        Addresses = addresses;
        //VerificationLogs = verificationLogs;
        //AuditLogs = auditLogs;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await SaveChangesAsync(cancellationToken);
            
            if (_transaction != null)
            {
                await _transaction.CommitAsync(cancellationToken);
            }
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}