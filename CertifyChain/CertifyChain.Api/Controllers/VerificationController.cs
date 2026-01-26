// using CertifyChain.Domain.Enums;
// using MediatR;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
//
// namespace CertifyChain.Controllers;
//
// [ApiController]
// [Route("api/[controller]")]
// public class VerificationController : ControllerBase
// {
//     private readonly IMediator _mediator;
//     
//     public VerificationController(IMediator mediator)
//     {
//         _mediator = mediator;
//     }
//     
//     /// <summary>
//     /// Verifies a certificate (PUBLIC endpoint - no auth required)
//     /// </summary>
//     [HttpPost("verify")]
//     [AllowAnonymous]
//     [ProducesResponseType(typeof(VerificationResultDto), StatusCodes.Status200OK)]
//     public async Task<IActionResult> Verify([FromBody] VerifyCertificateCommand command)
//     {
//         var result = await _mediator.Send(command);
//         return Ok(result.Data);
//     }
//     
//     [HttpPost("fraud-detection")]
//     [Authorize]
//     [RequirePermission(Permission.ViewCertificates)]
//     public async Task<IActionResult> DetectFraud([FromForm] DetectFraudCommand command)
//     {
//         var result = await _mediator.Send(command);
//         return Ok(result.Data);
//     }
//     
//     [HttpGet("history")]
//     [Authorize]
//     [RequirePermission(Permission.ViewCertificates)]
//     public async Task<IActionResult> GetHistory([FromQuery] GetVerificationHistoryQuery query)
//     {
//         var result = await _mediator.Send(query);
//         return Ok(result);
//     }
// }