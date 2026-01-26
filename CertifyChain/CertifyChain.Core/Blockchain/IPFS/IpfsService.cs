using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CertifyChain.Infrastructure.Blockchain.IPFS;

public class IpfsService : IIpfsService
{
    private readonly HttpClient _httpClient;
    private readonly string _ipfsApiUrl;
    private readonly ILogger<IpfsService> _logger;
    
    public IpfsService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<IpfsService> logger)
    {
        _httpClient = httpClient;
        _ipfsApiUrl = configuration["IPFS:ApiUrl"] ?? "https://ipfs.infura.io:5001";
        _logger = logger;
    }
    
    public async Task<string> UploadFileAsync(byte[] fileData, string fileName)
    {
        using var content = new MultipartFormDataContent();
        content.Add(new ByteArrayContent(fileData), "file", fileName);
        
        var response = await _httpClient.PostAsync($"{_ipfsApiUrl}/api/v0/add", content);
        response.EnsureSuccessStatusCode();
        
        var result = await response.Content.ReadFromJsonAsync<IpfsUploadResponse>();
        
        _logger.LogInformation("File uploaded to IPFS with CID: {Cid}", result?.Hash);
        
        return result?.Hash ?? throw new InvalidOperationException("Failed to get IPFS CID");
    }
    
    public async Task<byte[]> DownloadFileAsync(string cid)
    {
        var response = await _httpClient.GetAsync($"{_ipfsApiUrl}/api/v0/cat?arg={cid}");
        response.EnsureSuccessStatusCode();
        
        return await response.Content.ReadAsByteArrayAsync();
    }
    
    public async Task<bool> IsPinnedAsync(string cid)
    {
        // Implement pin check logic
        return true;
    }
}

public class IpfsUploadResponse
{
    public string Hash { get; set; }
}