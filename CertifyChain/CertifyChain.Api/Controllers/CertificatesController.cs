using CertifyChain.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CertifyChain.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CertificatesController : ControllerBase
{
    private readonly IMediator _mediator;
    
    public CertificatesController(IMediator mediator)
    {
        _mediator = mediator;
    }
    
    /// <summary>
    /// Creates a new certificate
    /// </summary>
    /// <remarks>
    /// Requires: CreateCertificates permission
    /// </remarks>
    [HttpPost]
    [RequirePermission(Permission.CreateCertificates)]
    [ProducesResponseType(typeof(CertificateDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromForm] CreateCertificateCommand command)
    {
        var result = await _mediator.Send(command);
        
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data)
            : BadRequest(result.Errors);
    }
    
    [HttpGet("{id:guid}")]
    [RequirePermission(Permission.ViewCertificates)]
    [ProducesResponseType(typeof(CertificateDetailDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetCertificateQuery(id));
        
        return result.IsSuccess ? Ok(result.Data) : NotFound(result.Errors);
    }
    
    [HttpGet]
    [RequirePermission(Permission.ViewCertificates)]
    [ProducesResponseType(typeof(PaginatedResult<CertificateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] GetCertificatesQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }
    
    [HttpPost("{id:guid}/revoke")]
    [RequirePermission(Permission.RevokeCertificates)]
    public async Task<IActionResult> Revoke(Guid id, [FromBody] RevokeCertificateCommand command)
    {
        command = command with { CertificateId = id };
        var result = await _mediator.Send(command);
        
        return result.IsSuccess ? NoContent() : BadRequest(result.Errors);
    }
    
    [HttpPost("batch")]
    [RequirePermission(Permission.CreateCertificates)]
    [RequestSizeLimit(50 * 1024 * 1024)] // 50MB
    public async Task<IActionResult> BatchUpload([FromForm] BatchUploadCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }
    
    [HttpGet("{id:guid}/download")]
    [RequirePermission(Permission.ViewCertificates)]
    public async Task<IActionResult> Download(Guid id)
    {
        var result = await _mediator.Send(new DownloadCertificateQuery(id));
        
        if (!result.IsSuccess)
            return NotFound();
        
        return File(result.Data!.FileData, result.Data.ContentType, result.Data.FileName);
    }
}
