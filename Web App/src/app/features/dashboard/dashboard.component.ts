import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { LayoutService } from '@/layout/service/layout.service';
import { DashboardService } from '@/core/services/dashboard.service';
import { AiFraudService } from '@/core/services/ai-fraud.service';
import { AiDashboardStats } from '@/core/models/ai-fraud.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface DashboardMetric {
  label: string;
  value: number | string;
  icon: string;
  change: number;
  changeLabel: string;
  iconColor: string;
  changeType: 'positive' | 'negative';
}

interface Certificate {
  id: string;
  name: string;
  degree: string;
  certNumber: string;
  status: 'active' | 'revoked' | 'pending';
  timestamp: string;
  initials: string;
}
type ActivityType = 'issued' | 'revoked' | 'verified' | 'login';
type Status = 'active' | 'revoked' | 'pending' | 'verified' | 'fraud';
type VerificationStatus = 'verified' | 'pending' | 'fraud';

interface Verification {
  certNumber: string;
  employer: string;
  timestamp: string;
  status: 'verified' | 'pending' | 'fraud';
}

interface Program {
  rank: number;
  name: string;
  count: number;
  change: number;
}

interface ActivityLog {
  user: string;
  action: string;
  certNumber: string;
  timestamp: string;
  type: 'issued' | 'revoked' | 'verified' | 'login';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    ButtonModule,
    BadgeModule,
    TagModule,
    AvatarModule,
    TableModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    ToastModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  layoutService = inject(LayoutService);
  dashboardService = inject(DashboardService);
  aiFraudService = inject(AiFraudService);
  messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  
  metrics: DashboardMetric[] = [];
  activityChartData: any;
  activityChartOptions: any;
  monthlyChartData: any;
  monthlyChartOptions: any;
  
  recentActivity: ActivityLog[] = [];
  recentCertificates: Certificate[] = [];
  verificationRequests: Verification[] = [];
  topPrograms: Program[] = [];

  // ─── AI FRAUD DETECTION STATS ───
  aiStats: AiDashboardStats | null = null;
  aiChartData: any = null;
  aiChartOptions: any = null;
  isLoadingAiStats: boolean = true;

  isDarkTheme?: boolean = false;
  isLoadingMetrics: boolean = true;
  isLoadingCharts: boolean = true;
  isLoadingActivity: boolean = true;

  ngOnInit() {
    // Subscribe to theme changes
    this.isDarkTheme = this.layoutService.layoutConfig().darkTheme;
    
    this.initializeChartOptions();
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Load metrics and charts independently for faster UI updates
    this.loadMetrics();
    this.loadCharts();
    this.loadActivityData();
    this.loadAiStats();
  }

  loadMetrics() {
    this.isLoadingMetrics = true;
    this.dashboardService.getMetrics().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.processMetrics(response.data);
        }
        this.isLoadingMetrics = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load metrics'
        });
        this.isLoadingMetrics = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCharts() {
    this.isLoadingCharts = true;
    
    // Load activity chart
    this.dashboardService.getActivityChart().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.processActivityChart(response.data);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load activity chart'
        });
        this.cdr.detectChanges();
      }
    });

    // Load monthly overview
    this.dashboardService.getMonthlyOverview().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.processMonthlyOverview(response.data);
        }
        this.isLoadingCharts = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load monthly overview'
        });
        this.isLoadingCharts = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAiStats() {
    this.isLoadingAiStats = true;
    this.aiFraudService.getAiStats().subscribe({
      next: (stats) => {
        this.aiStats = stats;
        this.buildAiChart(stats);
        this.isLoadingAiStats = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingAiStats = false;
        this.cdr.detectChanges();
      }
    });
  }

  buildAiChart(stats: AiDashboardStats) {
    const labels = stats.dailyScans.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-GB', { weekday: 'short' });
    });
    const data = stats.dailyScans.map(d => d.count);

    this.aiChartData = {
      labels,
      datasets: [{
        label: 'AI Scans',
        data,
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1
      }]
    };

    this.aiChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: true, grid: { display: false } },
        y: { display: true, beginAtZero: true, ticks: { stepSize: 1 } }
      }
    };
  }

  loadActivityData() {
    this.isLoadingActivity = true;

    // Load recent activity
    this.dashboardService.getRecentActivity(4).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.recentActivity = response.data.map(activity => ({
            user: activity.user,
            action: activity.action,
            certNumber: activity.certNumber || '',
            timestamp: this.formatTimestamp(activity.timestamp),
            type: activity.type
          }));
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load recent activity'
        });
        this.cdr.detectChanges();
      }
    });

    // Load recent certificates
    this.dashboardService.getRecentCertificates(5).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.recentCertificates = response.data.map(cert => ({
            id: cert.id.toString(),
            name: cert.studentName,
            degree: this.truncateText(cert.programName, 30),
            certNumber: cert.certificateNumber,
            status: cert.status,
            timestamp: this.formatTimestamp(cert.issuedDate),
            initials: cert.studentInitials || this.getInitials(cert.studentName)
          }));
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load recent certificates'
        });
        this.cdr.detectChanges();
      }
    });

    // Load verification requests
    this.dashboardService.getVerificationRequests(4).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.verificationRequests = response.data.map(req => ({
            certNumber: req.certificateNumber,
            employer: req.verifierName,
            timestamp: this.formatTimestamp(req.verificationDate),
            status: req.status
          }));
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load verification requests'
        });
        this.cdr.detectChanges();
      }
    });

    // Load top programs
    this.dashboardService.getTopPrograms(5).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.topPrograms = response.data.map(program => ({
            rank: program.rank,
            name: this.truncateText(program.programName, 20),
            count: program.certificateCount,
            change: program.changePercentage
          }));
        }
        this.isLoadingActivity = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load top programs'
        });
        this.isLoadingActivity = false;
        this.cdr.detectChanges();
      }
    });
  }

  processMetrics(data: any) {
    this.metrics = [
      {
        label: 'Total Certificates',
        value: this.formatNumber(data.totalCertificates),
        icon: 'pi pi-file',
        change: data.totalCertificatesChange,
        changeLabel: 'All time issued',
        iconColor: 'var(--primary-color)',
        changeType: data.totalCertificatesChange >= 0 ? 'positive' : 'negative'
      },
      {
        label: 'Active Certificates',
        value: this.formatNumber(data.activeCertificates),
        icon: 'pi pi-check-circle',
        change: data.activeCertificatesChange,
        changeLabel: 'Currently valid',
        iconColor: 'var(--green-500)',
        changeType: data.activeCertificatesChange >= 0 ? 'positive' : 'negative'
      },
      {
        label: 'Revoked Certificates',
        value: this.formatNumber(data.revokedCertificates),
        icon: 'pi pi-times-circle',
        change: data.revokedCertificatesChange,
        changeLabel: 'Total revoked',
        iconColor: 'var(--red-500)',
        changeType: data.revokedCertificatesChange >= 0 ? 'positive' : 'negative'
      },
      {
        label: 'Total Verifications',
        value: this.formatNumber(data.totalVerifications),
        icon: 'pi pi-shield',
        change: data.totalVerificationsChange,
        changeLabel: 'This month',
        iconColor: 'var(--blue-500)',
        changeType: data.totalVerificationsChange >= 0 ? 'positive' : 'negative'
      },
      {
        label: 'Pending Verifications',
        value: this.formatNumber(data.pendingVerifications),
        icon: 'pi pi-clock',
        change: data.pendingVerificationsChange,
        changeLabel: 'Awaiting review',
        iconColor: 'var(--orange-500)',
        changeType: data.pendingVerificationsChange >= 0 ? 'positive' : 'negative'
      },
      {
        label: 'Fraud Detected',
        value: this.formatNumber(data.fraudDetected),
        icon: 'pi pi-exclamation-triangle',
        change: data.fraudDetectedChange,
        changeLabel: 'AI flagged',
        iconColor: 'var(--red-500)',
        changeType: data.fraudDetectedChange >= 0 ? 'positive' : 'negative'
      },
      {
        label: 'Gas Spent (ETH)',
        value: data.gasSpentEth.toFixed(3),
        icon: 'pi pi-bolt',
        change: data.gasSpentChange,
        changeLabel: 'Blockchain costs',
        iconColor: 'var(--purple-500)',
        changeType: data.gasSpentChange >= 0 ? 'positive' : 'negative'
      }
    ];
  }

  processActivityChart(data: any) {
    const isDark = this.layoutService.layoutConfig().darkTheme;

    this.activityChartData = {
      labels: data.labels,
      datasets: [
        {
          label: 'Issued',
          data: data.issued,
          borderColor: 'var(--primary-color)',
          backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Verified',
          data: data.verified,
          borderColor: 'var(--green-500)',
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }

  processMonthlyOverview(data: any) {
    const isDark = this.layoutService.layoutConfig().darkTheme;

    this.monthlyChartData = {
      labels: data.labels,
      datasets: [
        {
          label: 'Issued',
          data: data.issued,
          backgroundColor: isDark ? 'var(--surface-100)' : 'var(--surface-900)'
        },
        {
          label: 'Revoked',
          data: data.revoked,
          backgroundColor: isDark ? 'var(--surface-400)' : 'var(--surface-200)'
        }
      ]
    };
  }

  initializeChartOptions() {
    const isDark = this.layoutService.layoutConfig().darkTheme;
    const textColor = isDark ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

    this.activityChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
            color: textColor,
            font: {
              size: 12,
              family: "'Inter', sans-serif"
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor
          },
          grid: {
            color: gridColor
          }
        }
      }
    };

    // Monthly Overview Chart Options

    this.monthlyChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            boxWidth: 15,
            boxHeight: 15,
            padding: 15,
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor
          },
          grid: {
            color: gridColor
          }
        }
      }
    };
  }

  // Helper methods
  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 3);
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  getActivityIcon(type: ActivityType): string {
    const icons = {
      'issued': 'pi-file',
      'revoked': 'pi-times-circle',
      'verified': 'pi-check-circle',
      'login': 'pi-sign-in'
    };
    return icons[type] || 'pi-info-circle';
  }

  getActivityIconColor(type: ActivityType): string {
    const colors = {
      'issued': 'var(--green-500)',
      'revoked': 'var(--red-500)',
      'verified': 'var(--blue-500)',
      'login': 'var(--surface-500)'
    };
    return colors[type] || 'var(--surface-500)';
  }

  getStatusSeverity(status: Status): 'success' | 'danger' | 'warning' | 'info' {
    const severityMap = {
      'active': 'info',
      'revoked': 'danger',
      'pending': 'warning',
      'verified': 'success',
      'fraud': 'danger'
    };
    return severityMap[status] as 'success' | 'danger' | 'warning' | 'info';
  }

  getVerificationIcon(status: VerificationStatus): string {
    const icons = {
      'verified': 'pi-check-circle',
      'pending': 'pi-clock',
      'fraud': 'pi-exclamation-triangle'
    };
    return icons[status] || 'pi-info-circle';
  }
}