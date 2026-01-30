using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CertifyChain.Infrastructure.Blockchain.IPFS;

public class IpfsService : IIpfsService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;
    private readonly string _apiKey;
    private readonly string _apiSecret;
    private readonly ILogger<IpfsService> _logger;
    
    

    public IpfsService(HttpClient httpClient, IConfiguration configuration, ILogger<IpfsService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;

        _apiUrl = configuration["IPFS:ApiUrl"] ?? throw new ArgumentNullException("Pinata:ApiUrl");
        _apiKey = configuration["IPFS:ApiKey"] ?? throw new ArgumentNullException("Pinata:ApiKey");
        _apiSecret = configuration["IPFS:ApiSecret"] ?? throw new ArgumentNullException("Pinata:ApiSecret");
    }

    public async Task<string> UploadFileAsync(byte[] fileData, string fileName)
    {
        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(fileData);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        content.Add(fileContent, "file", fileName);

        var request = new HttpRequestMessage(HttpMethod.Post, _apiUrl)
        {
            Content = content
        };

        request.Headers.Add("pinata_api_key", _apiKey);
        request.Headers.Add("pinata_secret_api_key", _apiSecret);

        using var response = await _httpClient.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Pinata upload failed: {Body}", responseBody);
            throw new Exception(responseBody);
        }

        var result = JsonSerializer.Deserialize<PinataUploadResponse>(responseBody);

        _logger.LogInformation("File uploaded to Pinata with CID: {Cid}", result?.IpfsHash);

        return result?.IpfsHash ?? throw new InvalidOperationException("No CID returned from Pinata");
    }

    public async Task<byte[]> DownloadFileAsync(string cid)
    {
        var response = await _httpClient.GetAsync($"https://aqua-leading-monkey-937.mypinata.cloud/ipfs/{cid}");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsByteArrayAsync();
    }
    
    
    

}