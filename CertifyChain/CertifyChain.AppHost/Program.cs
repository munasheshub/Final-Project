var builder = DistributedApplication.CreateBuilder(args);

// .NET API backend
var api = builder.AddProject<Projects.CertifyChain_Api>("api");

// Python AI fraud detection service
// Uses AddExecutable since AddPythonApp requires a virtual environment
var aiService = builder.AddExecutable("ai-service", "python", "../../ai_service",
    "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000")
    .WithHttpEndpoint(targetPort: 8000, name: "http");

// Angular web app — ng serve always binds to 4200; use targetPort so Aspire
// proxies to it without claiming that port itself.
var webApp = builder.AddNpmApp("web-app", "../../Web App", "start")
    .WithHttpEndpoint(targetPort: 4200)
    .WithExternalHttpEndpoints();

// Next.js marketing website
var website = builder.AddNpmApp("website", "../../Website", "dev")
    .WithHttpEndpoint(targetPort: 3000)
    .WithExternalHttpEndpoints();

// Pass AI service endpoint to API via environment variable
api.WithEnvironment("AI_SERVICE_URL", aiService.GetEndpoint("http"));

builder.Build().Run();
