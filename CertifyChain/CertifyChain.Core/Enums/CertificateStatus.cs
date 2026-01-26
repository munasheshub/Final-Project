namespace CertifyChain.Domain.Enums;


public enum CertificateStatus
{
    Draft = 0,
    PendingVerification = 1,
    Verified = 2,
    Revoked = 3,
    Flagged = 4,
    Expired = 5
}


