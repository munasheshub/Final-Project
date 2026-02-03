using CertifyChain.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CertifyChain.Infrastructure.Helpers;

public static class PermissionMapper
{
    
    public static List<string> ToFrontendPermissions(Permission permissions)
    {
        var list = new List<string>();

        foreach (Permission perm in Enum.GetValues(typeof(Permission)))
        {
            // Skip None and All
            if (perm == Permission.None || perm == Permission.All)
                continue;

            if (permissions.HasFlag(perm))
            {
                list.Add(MapToFrontendString(perm));
            }
        }

        return list;
    }

    /// <summary>
    /// Maps each C# Permission enum to its frontend string equivalent
    /// </summary>
    private static string MapToFrontendString(Permission permission)
    {
        return permission switch
        {
            Permission.ViewCertificates => "certificate:view",
            Permission.CreateCertificates => "certificate:create",
            Permission.UpdateCertificates => "certificate:update",
            Permission.DeleteCertificates => "certificate:delete",
            Permission.RevokeCertificates => "certificate:revoke",
            Permission.BatchUploadCertificates => "certificate:batch-upload",

            Permission.CreateUsers => "user:create",
            Permission.ViewUsers => "user:view",
            Permission.UpdateUsers => "user:update",
            Permission.DeleteUsers => "user:delete",

            Permission.VerifyCertificate => "verify:certificate",
            Permission.ViewVerificationHistory => "verify:history",
            Permission.RunFraudDetection => "verify:fraud-detection",

            Permission.ManageInstitution => "settings:institution",
            Permission.ManageBlockchain => "settings:blockchain",
            Permission.ManageSignatures => "settings:signatures",
            Permission.ManageTemplates => "settings:templates",

            Permission.ViewReports => "reports:view",
            Permission.ExportReports => "reports:export",
            Permission.ViewAuditLogs => "audit:view",
            Permission.ExportAuditLogs => "audit:export",

            _ => throw new ArgumentOutOfRangeException(nameof(permission), $"No frontend mapping for {permission}")
        };
    }
}