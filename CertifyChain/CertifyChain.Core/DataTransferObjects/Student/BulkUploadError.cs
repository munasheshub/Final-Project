namespace CertiChain.Application.DTOs.Student;

public class BulkUploadError
{
    public int RowNumber { get; set; }
    public string StudentNumber { get; set; }
    public string ErrorMessage { get; set; }
}
