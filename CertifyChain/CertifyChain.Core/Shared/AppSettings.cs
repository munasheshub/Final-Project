namespace CertifyChain.Infrastructure.Shared;

public class AppSettings
{
    public string Secret { get; set; } = string.Empty;
    public string EmailFrom { get; set; }
    public string SmtpHost { get; set; }
    public string SmtpPort { get; set; }
    public string SmtpUser { get; set; }
    public string SmtpPass { get; set; }
    public string FrontendUrl { get; set; } = string.Empty;
}