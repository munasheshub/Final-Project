namespace CertiChain.Application.DTOs.Student;

public class BulkUploadResult
{
    public int TotalRecords { get; set; }
    public int SuccessfulRecords { get; set; }
    public int FailedRecords { get; set; }
    public List<BulkUploadError> Errors { get; set; } = new();
}
