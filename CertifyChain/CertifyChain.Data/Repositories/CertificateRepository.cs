using CertifyChain.Data.Persistence;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.IRepositories;
using CertifyChain.Infrastructure.Shared;
using Microsoft.EntityFrameworkCore;

namespace CertifyChain.Domain.Repositories;


public class CertificateRepository : Repository<Certificate>, ICertificateRepository
{
    public CertificateRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Certificate?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Student)
            .Include(c => c.Institution)
            .Include(c => c.VerificationLogs)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }



    public async Task<Certificate?> GetByCertHashWithDetailsAsync(string hash, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .IgnoreQueryFilters()
            .Include(c => c.Student)
            .Include(c => c.Institution)
            .FirstOrDefaultAsync(c => c.CertificateHash == hash, cancellationToken);
    }

    public async Task<Certificate?> GetByCertificateNumberAsync(string certificateNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Student)
            .Include(c => c.Institution)
            .FirstOrDefaultAsync(c => c.CertificateNumber == certificateNumber, cancellationToken);
    }

    public async Task<Certificate?> GetByVerificationCodeAsync(string verificationCode, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Student)
            .Include(c => c.Institution)
            .FirstOrDefaultAsync(c => c.VerificationCode == verificationCode, cancellationToken);
    }

    public async Task<PaginatedResult<Certificate>> GetPaginatedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        CertificateStatus? status = null,
        QualificationType? qualificationType = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? sortBy = null,
        bool sortDescending = true,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(c => c.Student)
            .Include(c => c.Institution)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(c =>
                c.CertificateNumber.Contains(searchTerm) ||
                c.Student.FirstName.Contains(searchTerm) ||
                c.Student.LastName.Contains(searchTerm) ||
                c.ProgramName.Contains(searchTerm));
        }

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        if (qualificationType.HasValue)
        {
            query = query.Where(c => c.QualificationType == qualificationType.Value);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(c => c.GraduationDate >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(c => c.GraduationDate <= toDate.Value);
        }

        // Apply sorting
        query = (sortBy?.ToLower()) switch
        {
            "certificatenumber" => sortDescending 
                ? query.OrderByDescending(c => c.CertificateNumber)
                : query.OrderBy(c => c.CertificateNumber),
            "studentname" => sortDescending
                ? query.OrderByDescending(c => c.Student.LastName)
                : query.OrderBy(c => c.Student.LastName),
            "programname" => sortDescending
                ? query.OrderByDescending(c => c.ProgramName)
                : query.OrderBy(c => c.ProgramName),
            "graduationdate" => sortDescending
                ? query.OrderByDescending(c => c.GraduationDate)
                : query.OrderBy(c => c.GraduationDate),
            _ => sortDescending
                ? query.OrderByDescending(c => c.CreationDate)
                : query.OrderBy(c => c.CreationDate)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PaginatedResult<Certificate>(items, totalCount, pageNumber, pageSize);
    }



    public async Task<List<Certificate>> GetByStudentIdAsync(int studentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Institution)
            .Where(c => c.StudentId == studentId)
            .OrderByDescending(c => c.GraduationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Certificate>> GetByStatusAsync(CertificateStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Student)
            .Include(c => c.Institution)
            .Where(c => c.Status == status)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> CertificateNumberExistsAsync(string certificateNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(c => c.CertificateNumber == certificateNumber, cancellationToken);
    }

    public async Task<int> CountByStatusAsync(CertificateStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet.CountAsync(c => c.Status == status, cancellationToken);
    }

    public async Task<int> CountByDateRangeAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet.CountAsync(c => c.GraduationDate >= fromDate && c.GraduationDate <= toDate, cancellationToken);
    }
}