using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CertifyChain.Infrastructure.Persistence.Configurations;


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
        
        // builder.Property(c => c.FraudAnalysisJson)
        //     .HasColumnType("json");        
        builder.HasOne(c => c.Student)
            .WithMany(s => s.Certificates)
            .HasForeignKey(c => c.StudentId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(c => c.Program)
            .WithMany(p => p.Certificates)
            .HasForeignKey(c => c.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);
        
        //builder.Ignore(c => c.DomainEvents);
    }
}