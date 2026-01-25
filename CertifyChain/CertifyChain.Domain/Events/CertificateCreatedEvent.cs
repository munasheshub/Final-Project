using CertifyChain.Domain.Entities;

namespace CertifyChain.Domain.Events;

public record CertificateCreatedEvent(Certificate Certificate) : IDomainEvent;







