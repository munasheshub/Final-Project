using CertifyChain.Domain.Entities;

namespace CertifyChain.Core.IRepositories;

public interface IStudentRepository : IRepository<Student>
{
    Task<Student?> GetByStudentNumberAsync(string rowStudentNumber, CancellationToken cancellationToken);
}