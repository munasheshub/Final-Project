using CertifyChain.Core.IRepositories;
using CertifyChain.Data.Persistence;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;

namespace CertifyChain.Data.Repositories;

public class StudentRepository : IStudentRepository
{
    private readonly ApplicationDbContext _dbContext;
    private readonly DbSet<Student> _students;

    public StudentRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
        _students = dbContext.Students;
    }

    public async Task<Student?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _students
            .Include(s => s.StudentPrograms)
                .ThenInclude(sp => sp.Program)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<List<Student>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _students
            .Include(s => s.StudentPrograms)
                .ThenInclude(sp => sp.Program)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Student> AddAsync(Student entity, CancellationToken cancellationToken = default)
    {
        await _students.AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<List<Student>> AddRangeAsync(List<Student> entities, CancellationToken cancellationToken = default)
    {
        await _students.AddRangeAsync(entities, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entities;
    }

    public async Task UpdateAsync(Student entity, CancellationToken cancellationToken = default)
    {
        _students.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Student entity, CancellationToken cancellationToken = default)
    {
        _students.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _students.AnyAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await _students.CountAsync(cancellationToken);
    }

    public async Task<Student?> GetByStudentNumberAsync(string rowStudentNumber, CancellationToken cancellationToken)
    {
        return await _students
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.StudentNumber == rowStudentNumber, cancellationToken);
    }
}