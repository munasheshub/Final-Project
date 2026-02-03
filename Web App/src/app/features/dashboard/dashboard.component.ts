import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LayoutService } from '@/layout/service/layout.service';

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
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    ButtonModule,
    BadgeModule,
    TagModule,
    AvatarModule,
    TableModule,
    ProgressSpinnerModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  layoutService = inject(LayoutService);
  
  metrics: DashboardMetric[] = [];
  activityChartData: any;
  activityChartOptions: any;
  monthlyChartData: any;
  monthlyChartOptions: any;
  verificationSourcesData: any;
  verificationSourcesOptions: any;
  
  recentActivity: ActivityLog[] = [];
  recentCertificates: Certificate[] = [];
  verificationRequests: Verification[] = [];
  topPrograms: Program[] = [];

  isDarkTheme?: boolean = false;

  ngOnInit() {
    // Subscribe to theme changes
    this.isDarkTheme = this.layoutService.layoutConfig().darkTheme;
    
    this.initializeMetrics();
    this.initializeCharts();
    this.loadRecentData();
  }

  initializeMetrics() {
    this.metrics = [
      {
        label: 'Total Certificates',
        value: '2,847',
        icon: 'pi pi-file',
        change: 12.5,
        changeLabel: 'All time issued',
        iconColor: 'var(--primary-color)',
        changeType: 'positive'
      },
      {
        label: 'Active Certificates',
        value: '2,789',
        icon: 'pi pi-check-circle',
        change: 8.2,
        changeLabel: 'Currently valid',
        iconColor: 'var(--green-500)',
        changeType: 'positive'
      },
      {
        label: 'Revoked Certificates',
        value: '58',
        icon: 'pi pi-times-circle',
        change: -3.1,
        changeLabel: 'Total revoked',
        iconColor: 'var(--red-500)',
        changeType: 'negative'
      },
      {
        label: 'Total Verifications',
        value: '15,234',
        icon: 'pi pi-shield',
        change: 24.3,
        changeLabel: 'This month',
        iconColor: 'var(--blue-500)',
        changeType: 'positive'
      },
      {
        label: 'Pending Verifications',
        value: '23',
        icon: 'pi pi-clock',
        change: -15.2,
        changeLabel: 'Awaiting review',
        iconColor: 'var(--orange-500)',
        changeType: 'negative'
      },
      {
        label: 'Fraud Detected',
        value: '47',
        icon: 'pi pi-exclamation-triangle',
        change: 2.1,
        changeLabel: 'AI flagged',
        iconColor: 'var(--red-500)',
        changeType: 'positive'
      },
      {
        label: 'Gas Spent (ETH)',
        value: '2.458',
        icon: 'pi pi-bolt',
        change: -5.4,
        changeLabel: 'Blockchain costs',
        iconColor: 'var(--purple-500)',
        changeType: 'negative'
      }
    ];
  }

  initializeCharts() {
    const isDark = this.layoutService.layoutConfig().darkTheme;
    const textColor = isDark ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const surfaceColor = isDark ? '#1e293b' : '#ffffff';

    // Activity Chart
    this.activityChartData = {
      labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
      datasets: [
        {
          label: 'Issued',
          data: [150, 90, 240, 580, 420, 310],
          borderColor: 'var(--primary-color)',
          backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Verified',
          data: [120, 80, 200, 520, 380, 280],
          borderColor: 'var(--green-500)',
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

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

    // Monthly Overview Chart
    this.monthlyChartData = {
      labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
      datasets: [
        {
          label: 'Issued',
          data: [150, 90, 240, 580, 420, 310],
          backgroundColor: isDark ? 'var(--surface-100)' : 'var(--surface-900)'
        },
        {
          label: 'Revoked',
          data: [10, 5, 15, 25, 20, 12],
          backgroundColor: isDark ? 'var(--surface-400)' : 'var(--surface-200)'
        }
      ]
    };

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

    // Verification Sources (Donut Chart)
    this.verificationSourcesData = {
      labels: ['Employers', 'Educational Institutions', 'Government', 'Others'],
      datasets: [
        {
          data: [45, 30, 15, 10],
          backgroundColor: [
            isDark ? 'var(--surface-100)' : 'var(--surface-900)',
            isDark ? 'var(--surface-300)' : 'var(--surface-600)',
            isDark ? 'var(--surface-500)' : 'var(--surface-400)',
            isDark ? 'var(--surface-700)' : 'var(--surface-200)'
          ],
          borderWidth: 0
        }
      ]
    };

    this.verificationSourcesOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          display: false
        }
      }
    };
  }

  loadRecentData() {
    this.recentActivity = [
      {
        user: 'Dr. Sarah Moyo',
        action: 'Issued certificate',
        certNumber: 'NUST/BSC/CS/2025/0001 t...',
        timestamp: '1 day ago',
        type: 'issued'
      },
      {
        user: 'Mr. John Sibanda',
        action: 'Revoked certificate',
        certNumber: 'NUST/DIP/IT/2024/0089 -...',
        timestamp: '1 day ago',
        type: 'revoked'
      },
      {
        user: 'Ms. Grace Ndlovu',
        action: 'Verified certificate',
        certNumber: 'NUST/BSC/EE/2025/0042 -...',
        timestamp: '1 day ago',
        type: 'verified'
      },
      {
        user: 'Dr. Sarah Moyo',
        action: 'Successful login with 2FA',
        certNumber: '',
        timestamp: '1 day ago',
        type: 'login'
      }
    ];

    this.recentCertificates = [
      {
        id: '1',
        name: 'Munashe Keith Gandari',
        degree: 'Bachelor of Science Honours i',
        certNumber: 'NUST/BSC/CS/2025/0001',
        status: 'active',
        timestamp: '1 day ago',
        initials: 'MKG'
      },
      {
        id: '2',
        name: 'Tatenda Chikwanha',
        degree: 'Bachelor of Science Honours i',
        certNumber: 'NUST/BSC/EE/2025/0042',
        status: 'active',
        timestamp: '1 day ago',
        initials: 'TC'
      },
      {
        id: '3',
        name: 'Rumbidzai Nyathi',
        degree: 'Master of Business Administra',
        certNumber: 'NUST/MBA/2025/0015',
        status: 'active',
        timestamp: '1 day ago',
        initials: 'RN'
      },
      {
        id: '4',
        name: 'Blessing Moyo',
        degree: 'Diploma in Information Techno',
        certNumber: 'NUST/DIP/IT/2024/0089',
        status: 'revoked',
        timestamp: '1 day ago',
        initials: 'BM'
      },
      {
        id: '5',
        name: 'Tanaka Mutasa',
        degree: 'Bachelor of Science Honours i',
        certNumber: '',
        status: 'pending',
        timestamp: '1 day ago',
        initials: 'TM'
      }
    ];

    this.verificationRequests = [
      {
        certNumber: 'NUST/BSC/CS/2025/0OC',
        employer: 'TechCorp Zimbabwe',
        timestamp: '1 day ago',
        status: 'verified'
      },
      {
        certNumber: 'NUST/BSC/EE/2025/004',
        employer: 'ZESA Holdings',
        timestamp: '1 day ago',
        status: 'verified'
      },
      {
        certNumber: 'NUST/FAKE/2025/0099',
        employer: 'Unknown Employer',
        timestamp: '1 day ago',
        status: 'fraud'
      },
      {
        certNumber: 'NO222O198L',
        employer: 'Delta Corporation',
        timestamp: '1 day ago',
        status: 'pending'
      }
    ];

    this.topPrograms = [
      { rank: 1, name: 'Computer Science', count: 234, change: 12 },
      { rank: 2, name: 'Electronic Enginee...', count: 189, change: 8 },
      { rank: 3, name: 'Business Administr...', count: 156, change: -3 },
      { rank: 4, name: 'Information Techn...', count: 145, change: 5 },
      { rank: 5, name: 'Civil Engineering', count: 132, change: 2 }
    ];
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