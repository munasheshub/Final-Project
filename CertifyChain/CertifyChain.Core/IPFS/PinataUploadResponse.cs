namespace CertifyChain.Infrastructure.Blockchain.IPFS;

public class PinataUploadResponse
{
    public string IpfsHash { get; set; } = default!;
    public long PinSize { get; set; }  
    public DateTime Timestamp { get; set; }
    public string ID { get; set; } = default!; 
    public string Name { get; set; } = default!;  
    public int NumberOfFiles { get; set; }  
    public string MimeType { get; set; } = default!;
    public string? GroupId { get; set; }   
    public object? Keyvalues { get; set; } 
}