
using CertifyChain.Infrastructure.Helpers;
using FluentValidation;

namespace CertifyChain.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    
    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }
    
    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var (statusCode, message) = exception switch
        {
            ValidationException => (StatusCodes.Status400BadRequest, "Validation error"),
            //NotFoundException => (StatusCodes.Status404NotFound, exception.Message),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            //ForbiddenException => (StatusCodes.Status403Forbidden, "Forbidden"),
            BlockchainException => (StatusCodes.Status500InternalServerError, "Blockchain operation failed"),
            AIServiceException => (StatusCodes.Status500InternalServerError, "AI service unavailable"),
            _ => (StatusCodes.Status500InternalServerError, "An error occurred")
        };
        
        context.Response.StatusCode = statusCode;
        
        var response = new
        {
            error = message,
            details = exception is ValidationException validationEx 
                ? validationEx.Errors 
                : null
        };
        
        await context.Response.WriteAsJsonAsync(response);
    }
}