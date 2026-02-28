namespace CertifyChain.Infrastructure.DataTransferObjects.Dashboard;

public class DashboardMetricsDto
{
    public int TotalCertificates { get; set; }
    public double TotalCertificatesChange { get; set; }
    public int ActiveCertificates { get; set; }
    public double ActiveCertificatesChange { get; set; }
    public int RevokedCertificates { get; set; }
    public double RevokedCertificatesChange { get; set; }
    public int TotalVerifications { get; set; }
    public double TotalVerificationsChange { get; set; }
    public int PendingVerifications { get; set; }
    public double PendingVerificationsChange { get; set; }
    public int FraudDetected { get; set; }
    public double FraudDetectedChange { get; set; }
    public double GasSpentEth { get; set; }
    public double GasSpentChange { get; set; }
}

public class ActivityChartDto
{
    public List<string> Labels { get; set; } = new();
    public List<int> Issued { get; set; } = new();
    public List<int> Verified { get; set; } = new();
}

public class VerificationSourcesDto
{
    public int Employers { get; set; }
    public int EducationalInstitutions { get; set; }
    public int Government { get; set; }
    public int Others { get; set; }
}

public class MonthlyOverviewDto
{
    public List<string> Labels { get; set; } = new();
    public List<int> Issued { get; set; } = new();
    public List<int> Revoked { get; set; } = new();
}

public class RecentActivityDto
{
    public string User { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? CertNumber { get; set; }
    public DateTime Timestamp { get; set; }
    public string Type { get; set; } = string.Empty;
}

public class RecentCertificateDto
{
    public int Id { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string ProgramName { get; set; } = string.Empty;
    public string CertificateNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime IssuedDate { get; set; }
    public string StudentInitials { get; set; } = string.Empty;
}

public class VerificationRequestDto
{
    public string CertificateNumber { get; set; } = string.Empty;
    public string VerifierName { get; set; } = string.Empty;
    public DateTime VerificationDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class TopProgramDto
{
    public int Rank { get; set; }
    public string ProgramName { get; set; } = string.Empty;
    public int CertificateCount { get; set; }
    public double ChangePercentage { get; set; }
}
