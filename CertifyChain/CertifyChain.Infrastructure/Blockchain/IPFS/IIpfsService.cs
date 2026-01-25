namespace CertifyChain.Infrastructure.Blockchain.IPFS;

public interface IIpfsService
{
    Task<string> UploadFileAsync(byte[] fileData, string fileName);
    Task<byte[]> DownloadFileAsync(string cid);
    Task<bool> IsPinnedAsync(string cid);
}


