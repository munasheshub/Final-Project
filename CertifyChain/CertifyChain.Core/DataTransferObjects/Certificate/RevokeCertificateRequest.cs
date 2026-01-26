namespace CertiChain.Application.DTOs.Certificate;

public class RevokeCertificateRequest
{
    public Guid CertificateId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime? EffectiveDate { get; set; }
    public bool SendNotification { get; set; } = true;
}