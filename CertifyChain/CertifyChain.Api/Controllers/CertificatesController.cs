using System.Text.Json;
using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Controllers;
using CertifyChain.Data.Persistence;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Helpers;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using CertifyChain.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CertifyChain.Api.Controllers;

[ApiController]
[Route("api/certificates")]
[Authorize]
[Produces("application/json")]
public class CertificatesController : BaseController
{
    private readonly ICertificateService _certificateService;
    private readonly IAiFraudDetectionService _aiFraudDetectionService;
    private readonly ApplicationDbContext _dbContext;
    private readonly IUserContext _userContext;

    public CertificatesController(
        ICertificateService certificateService,
        IAiFraudDetectionService aiFraudDetectionService,
        ApplicationDbContext dbContext,
        IUserContext userContext)
    {
        _certificateService = certificateService;
        _aiFraudDetectionService = aiFraudDetectionService;
        _dbContext = dbContext;
        _userContext = userContext;
    }

    // ================= CREATE =================

    [HttpPost]
    [RequirePermission(Permission.CreateCertificates)]
    [ProducesResponseType(typeof(ServiceResponse<CertificateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(
        [FromBody] CreateCertificateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.CreateAsync(request, cancellationToken);
        return ToActionResult(result);
    }

    // ================= GET =================

    [HttpGet("{id:int}")]
    [RequirePermission(Permission.ViewCertificates)]
    [ProducesResponseType(typeof(ServiceResponse<CertificateDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.GetByIdAsync(id, cancellationToken);
        return ToActionResult(result);
    }

    [HttpGet("by-number/{certificateNumber}")]
    [RequirePermission(Permission.ViewCertificates)]
    [ProducesResponseType(typeof(ServiceResponse<CertificateDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetByCertificateNumber(
        string certificateNumber,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.GetByCertificateNumberAsync(
            certificateNumber,
            cancellationToken);

        return ToActionResult(result);
    }

    [HttpGet("by-hash/{certHash}")]
    [RequirePermission(Permission.ViewCertificates)]
    [ProducesResponseType(typeof(ServiceResponse<CertificateDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetByCertHash(
        string certHash,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.GetByCertHashAsync(
            certHash,
            cancellationToken);

        return ToActionResult(result);
    }

    [HttpGet]
    [RequirePermission(Permission.ViewCertificates)]
    [ProducesResponseType(typeof(ServiceResponse<PaginatedResult<CertificateDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll(
        [FromQuery] GetCertificatesRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.GetAllAsync(request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpGet("student/{studentId:int}")]
    [RequirePermission(Permission.ViewCertificates)]
    [ProducesResponseType(typeof(ServiceResponse<List<CertificateDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetByStudent(
        int studentId,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.GetByStudentIdAsync(studentId, cancellationToken);
        return ToActionResult(result);
    }

    // ================= UPDATE =================

    [HttpPut("{id:int}")]
    [RequirePermission(Permission.UpdateCertificates)]
    [ProducesResponseType(typeof(ServiceResponse<CertificateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateCertificateRequest request,
        CancellationToken cancellationToken)
    {
        request.Id = id;
        var result = await _certificateService.UpdateAsync(request, cancellationToken);
        return ToActionResult(result);
    }


    // ================= DELETE =================

    [HttpDelete("{id:int}")]
    [RequirePermission(Permission.DeleteCertificates)]
    [ProducesResponseType(typeof(ServiceResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.DeleteAsync(id, cancellationToken);
        return ToActionResult(result);
    }

    // ================= FILES =================

    [HttpGet("{id:int}/qr")]
    [RequirePermission(Permission.ViewCertificates)]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GenerateQrCode(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.GenerateQrCodeAsync(id, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return File(
            result.Data!,
            "image/png",
            $"certificate-{id}-qr.png");
    }

    // ================= BATCH =================



    // ================= HELPER =================

    private IActionResult ToActionResult<T>(ServiceResponse<T> response)
    {
        if (response.IsSuccess)
            return Ok(response);

        return BadRequest(response);
    }

    // ═══════════════════════════════════════════════════════════════
    // ─── AI FRAUD DETECTION ENDPOINTS ───
    // ═══════════════════════════════════════════════════════════════

    /// <summary>
    /// Public endpoint: Analyses an uploaded certificate document (PDF/image) for fraud.
    /// Anyone who scans a certificate can use this to verify its authenticity via AI.
    /// </summary>
    [HttpPost("verify-document")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> VerifyDocument(
        IFormFile file,
        [FromForm] int? institutionId,
        [FromForm] int? studentId,
        CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file provided" });

        if (file.Length > 10 * 1024 * 1024) // 10MB limit
            return BadRequest(new { error = "File size exceeds 10MB limit" });

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream, cancellationToken);
        var fileBytes = memoryStream.ToArray();

        var result = await _aiFraudDetectionService.AnalyseAsync(fileBytes, file.FileName);

        // Resolve tenant from institution if provided
        string tenantId = "00000000-0000-0000-0000-000000000001"; // Default system tenant
        if (institutionId.HasValue && institutionId.Value > 0)
        {
            var inst = await _dbContext.Institutions
                .IgnoreQueryFilters()
                .AsNoTracking()
                .FirstOrDefaultAsync(i => i.Id == institutionId.Value, cancellationToken);
            if (inst != null && !string.IsNullOrEmpty(inst.TenantId))
                tenantId = inst.TenantId;
        }

        // Persist the AI detection log for audit trail
        var aiLog = AiDetectionLog.Create(
            tenantId: tenantId,
            certificateHash: file.FileName,
            studentId: studentId,
            institutionId: institutionId,
            fraudProbability: result.FraudProbability,
            riskLevel: result.RiskLevel,
            verdict: result.Verdict,
            forgeryType: result.ForgeryType,
            inferenceMs: result.InferenceMs,
            handcraftedFeaturesJson: JsonSerializer.Serialize(result.HandcraftedFeatures)
        );

        _dbContext.AiDetectionLogs.Add(aiLog);

        // Ensure user context has tenant for SaveChangesAsync fallback (anonymous endpoint)
        if (string.IsNullOrEmpty(_userContext.TenantId))
            _userContext.TenantId = tenantId;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            id = aiLog.Id,
            fraud_probability = result.FraudProbability,
            risk_level = result.RiskLevel,
            verdict = result.Verdict,
            action = result.Action,
            inference_ms = result.InferenceMs,
            forgery_type = result.ForgeryType,
            handcrafted_features = result.HandcraftedFeatures,
            created_at = aiLog.CreatedAt
        });
    }

    /// <summary>
    /// Analyses a certificate image for fraud using the AI microservice.
    /// Does NOT issue the certificate — only returns the AI analysis result.
    /// </summary>
    [HttpPost("analyse-image")]
    [RequirePermission(Permission.CreateCertificates)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> AnalyseImage(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file provided" });

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream, cancellationToken);
        var fileBytes = memoryStream.ToArray();

        var result = await _aiFraudDetectionService.AnalyseAsync(fileBytes, file.FileName);

        return Ok(new
        {
            fraud_probability = result.FraudProbability,
            risk_level = result.RiskLevel,
            verdict = result.Verdict,
            action = result.Action,
            inference_ms = result.InferenceMs,
            forgery_type = result.ForgeryType,
            handcrafted_features = result.HandcraftedFeatures
        });
    }

    /// <summary>
    /// Issues a certificate with AI fraud screening. The PDF is analysed before issuance.
    /// Returns 422 if blocked, 202 if flagged for review, 200 if cleared.
    /// </summary>
    [HttpPost("issue-with-screening")]
    [RequirePermission(Permission.CreateCertificates)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> IssueWithScreening(
        [FromForm] CreateCertificateRequest request,
        IFormFile certificateFile,
        CancellationToken cancellationToken)
    {
        if (certificateFile == null || certificateFile.Length == 0)
            return BadRequest(new { error = "Certificate file is required" });

        // Step 1: Read file bytes
        using var memoryStream = new MemoryStream();
        await certificateFile.CopyToAsync(memoryStream, cancellationToken);
        var fileBytes = memoryStream.ToArray();

        // Step 2: Call AI fraud detection
        var aiResult = await _aiFraudDetectionService.AnalyseAsync(fileBytes, certificateFile.FileName);

        // Step 3: Log the result
        var aiLog = AiDetectionLog.Create(
            tenantId: GetCurrentTenantId().ToString(),
            certificateHash: request.CertHash ?? "",
            studentId: request.StudentId,
            institutionId: 0, // Will be populated from context
            fraudProbability: aiResult.FraudProbability,
            riskLevel: aiResult.RiskLevel,
            verdict: aiResult.Verdict,
            forgeryType: aiResult.ForgeryType,
            inferenceMs: aiResult.InferenceMs,
            handcraftedFeaturesJson: JsonSerializer.Serialize(aiResult.HandcraftedFeatures)
        );

        _dbContext.AiDetectionLogs.Add(aiLog);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Step 4: Decision gate
        if (aiResult.Verdict == "AI_SERVICE_UNAVAILABLE")
        {
            // Proceed with issuance but include warning
            var result = await _certificateService.CreateAsync(request, cancellationToken);
            if (result.IsSuccess)
            {
                return Ok(new
                {
                    data = result.Data,
                    ai_warning = "AI service unavailable — manual review recommended",
                    ai_log_id = aiLog.Id
                });
            }
            return BadRequest(result);
        }

        if (aiResult.FraudProbability >= 0.70)
        {
            // BLOCKED
            return UnprocessableEntity(new
            {
                blocked = true,
                reason = "AI fraud detection blocked this certificate",
                verdict = aiResult.Verdict,
                fraud_probability = aiResult.FraudProbability,
                forgery_type = aiResult.ForgeryType,
                ai_log_id = aiLog.Id
            });
        }

        if (aiResult.FraudProbability >= 0.30)
        {
            // FLAGGED for human review
            return Accepted(new
            {
                blocked = false,
                flagged = true,
                requires_review = true,
                verdict = "REVIEW REQUIRED",
                fraud_probability = aiResult.FraudProbability,
                ai_log_id = aiLog.Id,
                message = "Certificate flagged for review"
            });
        }

        // CLEARED — proceed with normal issuance
        var issueResult = await _certificateService.CreateAsync(request, cancellationToken);
        if (issueResult.IsSuccess)
        {
            return Ok(new
            {
                data = issueResult.Data,
                ai_score = aiResult.FraudProbability,
                ai_log_id = aiLog.Id
            });
        }
        return BadRequest(issueResult);
    }

    /// <summary>
    /// Resolves a flagged AI detection by confirming fraud or marking as false positive.
    /// If false positive, proceeds with certificate issuance.
    /// </summary>
    [HttpPost("review/{aiLogId:guid}")]
    [RequirePermission(Permission.ReviewAiFlags)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ReviewAiFlag(
        Guid aiLogId,
        [FromBody] ReviewAiFlagRequest reviewRequest,
        CancellationToken cancellationToken)
    {
        var aiLog = await _dbContext.AiDetectionLogs
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == aiLogId && x.TenantId == GetCurrentTenantId().ToString(), cancellationToken);

        if (aiLog == null)
            return NotFound(new { error = "AI detection log not found" });

        if (aiLog.ReviewOutcome != null)
            return BadRequest(new { error = "This flag has already been reviewed" });

        aiLog.MarkReviewed(GetCurrentUserId(), reviewRequest.Outcome, reviewRequest.Notes);
        await _dbContext.SaveChangesAsync(cancellationToken);

        if (reviewRequest.Outcome == "FALSE_POSITIVE")
        {
            return Ok(new
            {
                message = "Marked as false positive. Certificate can now be issued.",
                ai_log_id = aiLogId,
                outcome = reviewRequest.Outcome
            });
        }

        return Ok(new
        {
            message = "Confirmed as fraud. Certificate permanently blocked.",
            ai_log_id = aiLogId,
            outcome = reviewRequest.Outcome
        });
    }

    /// <summary>
    /// Returns paginated AI detection flags pending human review for the current tenant.
    /// </summary>
    [HttpGet("ai-flags")]
    [RequirePermission(Permission.ReviewAiFlags)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAiFlags(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.AiDetectionLogs
            .Include(x => x.Student)
            .Include(x => x.Institution)
            .Where(x => x.ReviewOutcome == null)
            .OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                aiLogId = x.Id,
                studentName = x.Student != null ? x.Student.FirstName + " " + x.Student.LastName : "Unknown",
                institutionName = x.Institution != null ? x.Institution.Name : "Unknown",
                fraudProbability = x.FraudProbability,
                riskLevel = x.RiskLevel,
                forgeryType = x.ForgeryType,
                createdAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            items,
            pageNumber,
            pageSize,
            totalCount,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    /// <summary>
    /// Returns all AI detection logs for the current tenant (history view).
    /// </summary>
    [HttpGet("ai-logs")]
    [RequirePermission(Permission.ViewVerificationHistory)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAiLogs(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.AiDetectionLogs
            .Include(x => x.Student)
            .Include(x => x.Institution)
            .OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                id = x.Id,
                certificateHash = x.CertificateHash,
                studentName = x.Student != null ? x.Student.FirstName + " " + x.Student.LastName : "Unknown",
                institutionName = x.Institution != null ? x.Institution.Name : "Unknown",
                fraudProbability = x.FraudProbability,
                riskLevel = x.RiskLevel,
                verdict = x.Verdict,
                forgeryType = x.ForgeryType,
                inferenceMs = x.InferenceMs,
                createdAt = x.CreatedAt,
                reviewOutcome = x.ReviewOutcome,
                reviewedAt = x.ReviewedAt,
                reviewNotes = x.ReviewNotes
            })
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            data = items,
            pageNumber,
            pageSize,
            totalCount,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }
}

// ─── REQUEST DTOs ───

public class ReviewAiFlagRequest
{
    public string Outcome { get; set; } = string.Empty; // "CONFIRMED_FRAUD" | "FALSE_POSITIVE"
    public string? Notes { get; set; }
}