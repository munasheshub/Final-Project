using CertifyChain.Infrastructure.Blockchain.IPFS;
using CertifyChain.Infrastructure.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace CertifyChain.Controllers;

[ApiController]
[Route("api/ipfs")]
[Authorize]
public class IpfsController(IIpfsService ipfsService) : ControllerBase
{
    private readonly IIpfsService _ipfsService = ipfsService;
    
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create(
        [FromForm] UploadToIpfs request)
    {
        byte[] fileData;
        using (var ms = new MemoryStream())
        {
            await request.CertificateFile.CopyToAsync(ms);
            fileData = ms.ToArray();
        }
        var result = await _ipfsService.UploadFileAsync(fileData, request.FileName);
        return Ok(result);
    }
   
}

public class UploadToIpfs
{
    public IFormFile CertificateFile { get; set; } = null!;
    public string FileName { get; set; } = null!;
}