using System.Reflection;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.MultiTenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CertifyChain.Infrastructure.Persistence;

// Infrastructure/Persistence/ApplicationDbContext.cs
public class ApplicationDbContext : DbContext
{
    private readonly ITenantService _tenantService;
    private readonly string? _tenantId;
    
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ITenantService tenantService) : base(options)
    {
        _tenantService = tenantService;
        _tenantId = _tenantService.GetCurrentTenantId();
    }
    
    public DbSet<Certificate> Certificates => Set<Certificate>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Institution> Institutions => Set<Institution>();
    public DbSet<User> Users => Set<User>();
    public DbSet<VerificationLog> VerificationLogs => Set<VerificationLog>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apply all configurations
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        
        // Apply global query filters for multi-tenancy
        ApplyTenantFilters(modelBuilder);
    }
    
    private void ApplyTenantFilters(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ITenantEntity).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(ApplicationDbContext)
                    .GetMethod(nameof(SetTenantFilter), BindingFlags.NonPublic | BindingFlags.Instance)
                    ?.MakeGenericMethod(entityType.ClrType);
                
                method?.Invoke(this, new object[] { modelBuilder });
            }
        }
    }
    
    private void SetTenantFilter<TEntity>(ModelBuilder modelBuilder)
        where TEntity : class, ITenantEntity
    {
        modelBuilder.Entity<TEntity>().HasQueryFilter(e => e.TenantId == _tenantId);
    }
    
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Set TenantId for new entities
        foreach (var entry in ChangeTracker.Entries<ITenantEntity>())
        {
            if (entry.State == EntityState.Added && string.IsNullOrEmpty(entry.Entity.TenantId))
            {
                entry.Entity.TenantId = _tenantId ?? throw new InvalidOperationException("Tenant ID is required");
            }
        }
        
        // Handle audit fields
        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
                entry.Entity.CreatedBy = GetCurrentUserId();
            }
            
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
                entry.Entity.UpdatedBy = GetCurrentUserId();
            }
        }
        
        return await base.SaveChangesAsync(cancellationToken);
    }
    
    private string? GetCurrentUserId()
    {
        // Get from HttpContext or current user service
        return null; // Implement based on your auth setup
    }
}

// Infrastructure/Persistence/Configurations/CertificateConfiguration.cs
public class CertificateConfiguration : IEntityTypeConfiguration<Certificate>
{
    public void Configure(EntityTypeBuilder<Certificate> builder)
    {
        builder.ToTable("Certificates");
        
        builder.HasKey(c => c.Id);
        
        builder.Property(c => c.TenantId)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(c => c.CertificateNumber)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.HasIndex(c => new { c.TenantId, c.CertificateNumber })
            .IsUnique();
        
        builder.Property(c => c.VerificationCode)
            .IsRequired()
            .HasMaxLength(12);
        
        builder.HasIndex(c => c.VerificationCode).IsUnique();
        
        builder.Property(c => c.ProgramName)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(c => c.BlockchainTxHash)
            .HasMaxLength(66);
        
        builder.Property(c => c.IpfsCid)
            .HasMaxLength(100);
        
        builder.Property(c => c.CertificateHash)
            .HasMaxLength(64);
        
        builder.Property(c => c.RevocationReason)
            .HasMaxLength(500);
        
        builder.Property(c => c.FraudAnalysisJson)
            .HasColumnType("json");
        
        builder.HasOne(c => c.Student)
            .WithMany(s => s.Certificates)
            .HasForeignKey(c => c.StudentId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(c => c.Institution)
            .WithMany(i => i.Certificates)
            .HasForeignKey(c => c.InstitutionId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.Ignore(c => c.DomainEvents);
    }
}