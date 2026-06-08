using System.Net;
using System.Net.Sockets;

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
    public string VerificationBaseUrl { get; set; } = string.Empty;

    /// <summary>
    /// Returns the VerificationBaseUrl with localhost replaced by the machine's LAN IP
    /// so that QR codes scanned from a phone on the same network will resolve correctly.
    /// </summary>
    public string GetNetworkVerificationBaseUrl()
    {
        if (string.IsNullOrEmpty(VerificationBaseUrl))
            return string.Empty;

        var uri = new Uri(VerificationBaseUrl);
        if (uri.Host is "localhost" or "127.0.0.1")
        {
            var lanIp = GetLanIpAddress();
            if (lanIp != null)
            {
                var builder = new UriBuilder(uri) { Host = lanIp };
                return builder.Uri.ToString().TrimEnd('/');
            }
        }

        return VerificationBaseUrl;
    }

    private static string? GetLanIpAddress()
    {
        try
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            var ip = host.AddressList
                .FirstOrDefault(a => a.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(a));
            return ip?.ToString();
        }
        catch
        {
            return null;
        }
    }
}