using CertifyChain.Domain.Entities;

namespace CertifyChain.Domain.Events;


public record PasswordChangedEvent(User User) : IDomainEvent;