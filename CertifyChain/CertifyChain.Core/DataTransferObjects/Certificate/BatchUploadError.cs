namespace CertiChain.Application.DTOs.Certificate;

public class BatchUploadError
{
    public int RowNumber { get; set; }
    public string StudentNumber { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new();
}