using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Helpers;

namespace CertifyChain.Tests.Helpers;

public class RolePermissionsTests
{
    [Fact]
    public void SuperAdmin_HasAllPermissions()
    {
        var permissions = RolePermissions.GetPermissions(UserRole.SuperAdmin);

        Assert.Equal(Permission.All, permissions);
    }

    [Fact]
    public void InstitutionAdmin_CanManageCertificates()
    {
        var permissions = RolePermissions.GetPermissions(UserRole.InstitutionAdmin);

        Assert.True(permissions.HasFlag(Permission.ViewCertificates));
        Assert.True(permissions.HasFlag(Permission.CreateCertificates));
        Assert.True(permissions.HasFlag(Permission.UpdateCertificates));
        Assert.True(permissions.HasFlag(Permission.DeleteCertificates));
        Assert.True(permissions.HasFlag(Permission.RevokeCertificates));
        Assert.True(permissions.HasFlag(Permission.BatchUploadCertificates));
    }

    [Fact]
    public void InstitutionAdmin_CanManageUsers()
    {
        var permissions = RolePermissions.GetPermissions(UserRole.InstitutionAdmin);

        Assert.True(permissions.HasFlag(Permission.CreateUsers));
        Assert.True(permissions.HasFlag(Permission.ViewUsers));
        Assert.True(permissions.HasFlag(Permission.UpdateUsers));
        Assert.True(permissions.HasFlag(Permission.DeleteUsers));
    }

    [Fact]
    public void Viewer_CanOnlyViewAndVerify()
    {
        var permissions = RolePermissions.GetPermissions(UserRole.Viewer);

        Assert.True(permissions.HasFlag(Permission.ViewCertificates));
        Assert.True(permissions.HasFlag(Permission.VerifyCertificate));
        Assert.True(permissions.HasFlag(Permission.ViewVerificationHistory));

        // Viewer should NOT be able to create or delete
        Assert.False(permissions.HasFlag(Permission.CreateCertificates));
        Assert.False(permissions.HasFlag(Permission.DeleteCertificates));
        Assert.False(permissions.HasFlag(Permission.CreateUsers));
    }

    [Fact]
    public void Auditor_HasReadOnlyAccess()
    {
        var permissions = RolePermissions.GetPermissions(UserRole.Auditor);

        Assert.True(permissions.HasFlag(Permission.ViewCertificates));
        Assert.True(permissions.HasFlag(Permission.ViewAuditLogs));
        Assert.True(permissions.HasFlag(Permission.ExportAuditLogs));
        Assert.True(permissions.HasFlag(Permission.ViewReports));
        Assert.True(permissions.HasFlag(Permission.ExportReports));

        // Should not have write access
        Assert.False(permissions.HasFlag(Permission.CreateCertificates));
        Assert.False(permissions.HasFlag(Permission.DeleteCertificates));
        Assert.False(permissions.HasFlag(Permission.CreateUsers));
    }

    [Fact]
    public void VerificationOfficer_CanRevokeAndVerify()
    {
        var permissions = RolePermissions.GetPermissions(UserRole.VerificationOfficer);

        Assert.True(permissions.HasFlag(Permission.ViewCertificates));
        Assert.True(permissions.HasFlag(Permission.RevokeCertificates));
        Assert.True(permissions.HasFlag(Permission.VerifyCertificate));
        Assert.True(permissions.HasFlag(Permission.RunFraudDetection));

        Assert.False(permissions.HasFlag(Permission.CreateCertificates));
        Assert.False(permissions.HasFlag(Permission.CreateUsers));
    }

    [Fact]
    public void Registrar_CanManageCertificatesAndStudents()
    {
        var permissions = RolePermissions.GetPermissions(UserRole.Registrar);

        Assert.True(permissions.HasFlag(Permission.ViewCertificates));
        Assert.True(permissions.HasFlag(Permission.CreateCertificates));
        Assert.True(permissions.HasFlag(Permission.DeleteCertificates));
        Assert.True(permissions.HasFlag(Permission.ViewStudents));
        Assert.True(permissions.HasFlag(Permission.ManageStudents));
        Assert.True(permissions.HasFlag(Permission.BulkUploadStudents));

        // Registrar should not manage users
        Assert.False(permissions.HasFlag(Permission.CreateUsers));
        Assert.False(permissions.HasFlag(Permission.DeleteUsers));
    }

    [Fact]
    public void FacultyAdmin_CanManageProgramsAndStudents()
    {
        var permissions = RolePermissions.GetPermissions(UserRole.FacultyAdmin);

        Assert.True(permissions.HasFlag(Permission.ViewPrograms));
        Assert.True(permissions.HasFlag(Permission.ManagePrograms));
        Assert.True(permissions.HasFlag(Permission.ViewStudents));
        Assert.True(permissions.HasFlag(Permission.ManageStudents));
        Assert.True(permissions.HasFlag(Permission.ViewCertificates));
        Assert.True(permissions.HasFlag(Permission.CreateCertificates));

        // Faculty admin should not manage users or revoke
        Assert.False(permissions.HasFlag(Permission.CreateUsers));
        Assert.False(permissions.HasFlag(Permission.RevokeCertificates));
    }

    [Theory]
    [InlineData(UserRole.SuperAdmin)]
    [InlineData(UserRole.InstitutionAdmin)]
    [InlineData(UserRole.Registrar)]
    [InlineData(UserRole.FacultyAdmin)]
    [InlineData(UserRole.VerificationOfficer)]
    [InlineData(UserRole.Auditor)]
    [InlineData(UserRole.Viewer)]
    public void AllRoles_HaveViewDashboardOrViewCertificates(UserRole role)
    {
        var permissions = RolePermissions.GetPermissions(role);

        // Every role should be able to view at least certificates
        Assert.True(permissions.HasFlag(Permission.ViewCertificates));
    }

    [Fact]
    public void UnknownRole_ReturnsNoPermissions()
    {
        var permissions = RolePermissions.GetPermissions((UserRole)999);

        Assert.Equal(Permission.None, permissions);
    }
}
