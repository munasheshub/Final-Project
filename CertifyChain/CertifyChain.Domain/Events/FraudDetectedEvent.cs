using CertifyChain.Domain.Entities;

namespace CertifyChain.Domain.Events;

public record FraudDetectedEvent(Certificate Certificate) : IDomainEvent;