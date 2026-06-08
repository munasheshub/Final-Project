// CertifyChain.Core/Interfaces/IAiFraudDetectionService.cs
using CertifyChain.Infrastructure.AI.Models;

namespace CertifyChain.Infrastructure.Interfaces;

/// <summary>
/// Service for analysing certificate images using the AI fraud detection microservice.
/// </summary>
public interface IAiFraudDetectionService
{
    /// <summary>
    /// Analyses a certificate image for signs of tampering or fraud.
    /// </summary>
    /// <param name="imageData">Raw bytes of the certificate image/PDF.</param>
    /// <param name="filename">Original filename of the uploaded document.</param>
    /// <returns>The AI fraud detection analysis result.</returns>
    Task<AiFraudDetectionResult> AnalyseAsync(byte[] imageData, string filename);

    /// <summary>
    /// Checks whether the AI service is online and the model is loaded.
    /// </summary>
    Task<bool> IsHealthyAsync();
}
