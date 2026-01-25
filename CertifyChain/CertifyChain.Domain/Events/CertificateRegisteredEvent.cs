using CertifyChain.Domain.Entities;

namespace CertifyChain.Domain.Events;

public record CertificateRegisteredEvent(Certificate Certificate) : IDomainEvent;