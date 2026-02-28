using System.Reflection;
using CertifyChain.Domain.AggregateRoots;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Domain.ValueObject;
using CertifyChain.Infrastructure.Entities;
using CertifyChain.Infrastructure.Helpers;
using CertifyChain.Infrastructure.MultiTenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CertifyChain.Data.Persistence;


public class ApplicationDbContext : DbContext
{
    private readonly IUserContext? _userContext;
    
    public ApplicationDbContext( IUserContext? userContext,
        DbContextOptions<ApplicationDbContext> options) : base(options)
    {
        _userContext = userContext;
    }
    
    public DbSet<Certificate> Certificates { get; set; }
    public DbSet<Student> Students {  get; set; }
    public DbSet<Institution> Institutions { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<VerificationLog> VerificationLogs { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<Program>  Programs { get; set; }
    public DbSet<Faculty> Faculties { get; set; }
    public DbSet<StudentProgram> StudentPrograms { get; set; }
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<Address>  Addresses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        ApplyTenantFilters(modelBuilder);
        
        ConfigureAuditedEntity<User, int>(modelBuilder.Entity<User>());
        ConfigureAuditedEntity<Institution, int>(modelBuilder.Entity<Institution>());
        ConfigureAuditedEntity<VerificationLog, Guid>(modelBuilder.Entity<VerificationLog>());
        ConfigureAuditedEntity<AuditLog, int>(modelBuilder.Entity<AuditLog>());
        ConfigureAuditedEntity<Tenant, Guid>(modelBuilder.Entity<Tenant>());
        ConfigureAuditedEntity<Certificate, int>(modelBuilder.Entity<Certificate>());
        ConfigureAuditedEntity<Student, int>(modelBuilder.Entity<Student>());
        ConfigureAuditedEntity<Program, int>(modelBuilder.Entity<Program>());
        ConfigureAuditedEntity<Faculty, int>(modelBuilder.Entity<Faculty>());

        // StudentProgram many-to-many join
        modelBuilder.Entity<StudentProgram>(entity =>
        {
            entity.HasOne(sp => sp.Student)
                .WithMany(s => s.StudentPrograms)
                .HasForeignKey(sp => sp.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(sp => sp.Program)
                .WithMany(p => p.StudentPrograms)
                .HasForeignKey(sp => sp.ProgramId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(sp => new { sp.StudentId, sp.ProgramId }).IsUnique();
        });

        // Faculty -> Institution
        modelBuilder.Entity<Faculty>(entity =>
        {
            entity.HasOne(f => f.Institution)
                .WithMany(i => i.Faculties)
                .HasForeignKey(f => f.InstitutionId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Program -> Faculty
        modelBuilder.Entity<Program>(entity =>
        {
            entity.HasOne(p => p.Faculty)
                .WithMany(f => f.Programs)
                .HasForeignKey(p => p.FacultyId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                TenantId = "00000000-0000-0000-0000-000000000001",
                FirstName = "Super",
                LastName = "Admin",
                Email = "superadmin@certifychain.com",
                PasswordHash = "$2a$11$siaOlSdDJPbSsIHX2wN7Neazwi.oSHFrrtz.CUKruPM/hs/wHzi26",
                Role = UserRole.SuperAdmin,
                CreationDate = new DateTime(2026, 1, 26, 12, 0, 0),
                CreatorId = 1
            }
        );

        modelBuilder.Entity<Tenant>().HasData(
            new Tenant
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Name = "System Tenant",
                Subdomain = "system", 
                IsActive = true,
                InstitutionId = null,
                CreationDate = new DateTime(2026, 1, 26, 12, 0, 0), 
                CreatorId = 1     
            }
        );
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
        modelBuilder.Entity<TEntity>().HasQueryFilter(e => e.TenantId == _userContext.TenantId);
    }
    
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Set TenantId for new entities
        foreach (var entry in ChangeTracker.Entries<ITenantEntity>())
        {
            if (entry.State == EntityState.Added && string.IsNullOrEmpty(entry.Entity.TenantId))
            {
                entry.Entity.TenantId = _userContext.TenantId ?? throw new InvalidOperationException("Tenant ID is required");
            }
        }
        
        // Handle audit fields
        foreach (var entry in ChangeTracker.Entries<AuditableEntity<int>>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreationDate = DateTime.UtcNow;
                entry.Entity.CreatorId = _userContext.UserId ?? throw new InvalidOperationException("Creator ID is required");
            }
            
            
        }
        
        foreach (var entry in ChangeTracker.Entries<AuditableEntity<Guid>>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreationDate = DateTime.UtcNow;
                if (_userContext?.UserId != null)
                    entry.Entity.CreatorId = _userContext.UserId.Value;
                else if (entry.Entity is not VerificationLog)
                    throw new InvalidOperationException("Creator ID is required");
            }
            
            
        }
        
        foreach (var entry in ChangeTracker.Entries<FullyAuditableEntity>())
        {
            
            
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.LastModificationDate = DateTime.UtcNow;
                entry.Entity.LastModifierId = _userContext.UserId ?? throw new InvalidOperationException("Last modifier ID is required");
            }
        }
        
        return await base.SaveChangesAsync(cancellationToken);
    }
    
    public static void ConfigureAuditedEntity<TEntity, TKey>(EntityTypeBuilder<TEntity> entity) where TEntity : AuditableEntity<TKey>
    {
        // Configure the relationship for Creator
        entity.HasOne<User>("Creator")
            .WithMany()
            .HasForeignKey("CreatorId")
            .OnDelete(DeleteBehavior.Restrict);

        // Configure the relationship for Deleter
        entity.HasOne<User>("Deleter")
            .WithMany()
            .HasForeignKey("DeleterId")
            .OnDelete(DeleteBehavior.Restrict);

        // If the entity is of type FullAuditedAggregateRoot, configure LastModifierUser
        if (typeof(FullyAuditableEntity).IsAssignableFrom(typeof(TEntity)))
        {
            entity.HasOne<User>("LastModifier")
                .WithMany()
                .HasForeignKey("LastModifierId")
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
    
    
}

