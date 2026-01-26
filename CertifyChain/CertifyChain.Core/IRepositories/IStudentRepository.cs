using CertifyChain.Domain.Entities;

namespace CertifyChain.Core.IRepositories;

public interface IStudentRepository
{
    Task<Student?> GetByStudentNumberAsync(string rowStudentNumber, CancellationToken cancellationToken);
}