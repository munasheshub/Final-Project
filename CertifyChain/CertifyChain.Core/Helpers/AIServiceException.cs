namespace CertifyChain.Infrastructure.Helpers;

public class AIServiceException : Exception
{
    public AIServiceException() { }

    public AIServiceException(string message) 
        : base(message) { }

    public AIServiceException(string message, Exception innerException) 
        : base(message, innerException) { }
}