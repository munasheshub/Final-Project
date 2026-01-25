using CertifyChain.Domain.Entities;

namespace CertifyChain.Domain.Events;

public record CertificateRevokedEvent(Certificate Certificate, Guid RevokedBy) : IDomainEvent;