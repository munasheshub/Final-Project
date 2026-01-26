namespace CertifyChain.Infrastructure.Interfaces;

public interface IEmailService
{
    Task Send(string to, string subject, string code);
}