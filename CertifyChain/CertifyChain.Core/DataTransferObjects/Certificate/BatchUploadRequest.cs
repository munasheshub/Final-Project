using Microsoft.AspNetCore.Http;

namespace CertiChain.Application.DTOs.Certificate;

public class BatchUploadRequest
{
    public IFormFile CsvFile { get; set; } = null!;
    public bool ValidateOnly { get; set; } = false;
    public bool RunFraudDetection { get; set; } = true;
}

// Application/DTOs/Certificate/BatchUploadResult.cs
;