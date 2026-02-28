using System.Reflection;
using System.Text;
using AutoMapper;
using CertiChain.Data.Persistence.Repositories;
using CertifyChain.Core.IRepositories;
using CertifyChain.Data.Persistence;
using CertifyChain.Data.Repositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Domain.Repositories;
using CertifyChain.Infrastructure.Blockchain;
using CertifyChain.Infrastructure.Blockchain.IPFS;
using CertifyChain.Infrastructure.Helpers;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.IRepositories;
using CertifyChain.Infrastructure.Logging;
using CertifyChain.Infrastructure.Mapping;
using CertifyChain.Infrastructure.MultiTenancy;
using CertifyChain.Infrastructure.Repositories;
using CertifyChain.Infrastructure.Services;
using CertifyChain.Infrastructure.Shared;
using CertifyChain.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// Add services to container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CertifyChain API",
        Version = "v1"
    });

    options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme."
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("bearer", document)] = []
    });
});

// Multi-Tenancy
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.Configure<AppSettings>(
    builder.Configuration.GetSection("AppSettings")
);
builder.Services.AddHttpClient();
// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


builder.Services.AddAutoMapper((sp, cfg) =>
{
    cfg.AddProfile<AppMappingProfile>();
}, Assembly.GetExecutingAssembly());
//builder.Services.AddValidatorsFromAssembly(typeof(CreateCertificateCommandValidator).Assembly);
//builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
builder.Services.AddHealthChecks();
// Infrastructure Services
builder.Services.AddScoped<ICertificateRepository, CertificateRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddTransient<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IIpfsService, IpfsService>();
builder.Services.AddTransient<IUserContext, UserContext>();
builder.Services.AddTransient<IUserRepository, UserRepository>();
builder.Services.AddTransient<IInstitutionRepository, InstitutionRepository>();
builder.Services.AddTransient<IProgramRepository, ProgramRepository>();
builder.Services.AddTransient<IFacultyRepository, FacultyRepository>();
builder.Services.AddTransient<ITenantRepository, TenantRepository>();
builder.Services.AddTransient<IAddressRepository, AddressRepository>();
builder.Services.AddTransient<IVerificationLogRepository, VerificationLogRepository>();
builder.Services.AddTransient<IJwtUtils, JwtUtils>();
// builder.Services.AddHttpClient<IFraudDetectionService, FraudDetectionService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddTransient<IAuthService, AuthService>();
builder.Services.AddTransient<IStudentService, StudentService>();
builder.Services.AddTransient<IInstitutionService, InstitutionService>();
builder.Services.AddTransient<ICertificateService, CertificateService>();
builder.Services.AddTransient<IProgramService, ProgramService>();
builder.Services.AddTransient<IFacultyService, FacultyService>();
builder.Services.AddTransient<IVerificationLogService, VerificationLogService>();
// builder.Services.AddScoped<ICacheService, RedisCacheService>();

// Authentication

var appSettings = builder.Configuration.GetSection("AppSettings").Get<AppSettings>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(appSettings.Secret))
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://certifyonchain.netlify.app")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// SignalR for real-time notifications
builder.Services.AddSignalR();

// Health Checks
// builder.Services.AddHealthChecks()
//     .AddDbContextCheck<ApplicationDbContext>()
//     .AddCheck<BlockchainHealthCheck>("blockchain")
//     .AddCheck<AIServiceHealthCheck>("ai-service");

var app = builder.Build();


app.UseSwagger();
app.UseSwaggerUI();


app.UseHttpsRedirection();

app.UseCors("AllowAngular");

app.UseMiddleware<JwtMiddleware>();
app.UseMiddleware<TenantMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();


app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();
app.MapHealthChecks("/health");
//app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
