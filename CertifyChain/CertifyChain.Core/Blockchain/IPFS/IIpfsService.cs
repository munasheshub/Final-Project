using CertifyChain.Infrastructure.Shared;

namespace CertifyChain.Infrastructure.Blockchain.IPFS;

public interface IIpfsService
{
    Task<ServiceResponse<string>> UploadFileAsync(byte[] fileData, string fileName);
    Task<byte[]> DownloadFileAsync(string cid);
}


