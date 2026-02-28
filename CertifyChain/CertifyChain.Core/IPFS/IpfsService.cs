using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using CertifyChain.Infrastructure.Shared;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CertifyChain.Infrastructure.Blockchain.IPFS;

public class IpfsService : IIpfsService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;
    private readonly string _gatewayUrl;
    private readonly string _apiKey;
    private readonly string _apiSecret;
    private readonly string _jwtAccessToken;
    private readonly ILogger<IpfsService> _logger;

    public IpfsService(HttpClient httpClient, IConfiguration configuration, ILogger<IpfsService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;

        _apiUrl = configuration["IPFS:ApiUrl"] ?? throw new ArgumentNullException("IPFS:ApiUrl");
        _gatewayUrl = configuration["IPFS:GatewayUrl"] ?? throw new ArgumentNullException("IPFS:GatewayUrl");
        _apiKey = configuration["IPFS:ApiKey"] ?? throw new ArgumentNullException("IPFS:ApiKey");
        _apiSecret = configuration["IPFS:ApiSecret"] ?? throw new ArgumentNullException("IPFS:ApiSecret");
        _jwtAccessToken = configuration["IPFS:ProjectJwtAccessToken"] ?? throw new ArgumentNullException("IPFS:ProjectJwtAccessToken");
    }

    public async Task<ServiceResponse<string>> UploadFileAsync(byte[] fileData, string fileName)
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
        
        

        return result?.IpfsHash != null ? ServiceResponse<string>.Success(result?.IpfsHash) : throw new InvalidOperationException("No CID returned from Pinata");
    }

    public async Task<byte[]> DownloadFileAsync(string cid)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, $"{_gatewayUrl}/ipfs/{cid}");
        request.Headers.Add("x-pinata-gateway-token", _jwtAccessToken);

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            _logger.LogError("Pinata download failed for CID {Cid}: {Body}", cid, body);
            throw new Exception($"Failed to download file from IPFS: {body}");
        }

        return await response.Content.ReadAsByteArrayAsync();
    }
    
    
    

}