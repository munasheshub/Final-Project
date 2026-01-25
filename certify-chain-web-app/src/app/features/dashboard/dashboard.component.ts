import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: number;
  trendLabel?: string;
}

interface Activity {
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}

interface DashboardStats {
  totalIssued: number;
  pendingVerifications: number;
  activePrograms: number;
  totalInstitutions: number;
  byProgram: { program: string; count: number }[];
  byQualificationType: { type: string; count: number }[];
  byStatus: { status: string; count: number }[];
  monthlyIssuance: { month: string; count: number }[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ChartModule,
    DatePickerModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    TimelineModule,
    TagModule,
    TooltipModule,
    RippleModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  dateRange: Date[] = [];
  
  stats = signal<DashboardStats | null>(null);
  
  statCards = computed<StatCard[]>(() => {
    const s = this.stats();
    if (!s) return [];
    
    return [
      {
        title: 'Total Certificates',
        value: s.totalIssued.toLocaleString(),
        icon: 'pi pi-file-check',
        color: '#3b82f6',
        trend: 12.5,
        trendLabel: 'vs last month'
      },
      {
        title: 'Pending Verifications',
        value: s.pendingVerifications,
        icon: 'pi pi-clock',
        color: '#f59e0b',
        trend: -8.2,
        trendLabel: 'vs last week'
      },
      {
        title: 'Active Programs',
        value: s.activePrograms,
        icon: 'pi pi-book',
        color: '#10b981',
        trend: 5.1,
        trendLabel: 'new this month'
      },
      {
        title: 'Institutions',
        value: s.totalInstitutions,
        icon: 'pi pi-building',
        color: '#8b5cf6',
        trend: 2.3,
        trendLabel: 'growth'
      }
    ];
  });

  recentActivities = signal<Activity[]>([
    {
      title: 'Certificate Issued',
      description: 'BSc Computer Science for John Doe',
      time: '2 minutes ago',
      icon: 'pi pi-check',
      color: '#10b981'
    },
    {
      title: 'Verification Request',
      description: 'Employer verification for Jane Smith',
      time: '15 minutes ago',
      icon: 'pi pi-search',
      color: '#3b82f6'
    },
    {
      title: 'Batch Upload Complete',
      description: '45 certificates processed successfully',
      time: '1 hour ago',
      icon: 'pi pi-upload',
      color: '#8b5cf6'
    },
    {
      title: 'New Program Added',
      description: 'Master of Data Science registered',
      time: '3 hours ago',
      icon: 'pi pi-plus',
      color: '#f59e0b'
    }
  ]);

  monthlyIssuanceChart = computed(() => {
    const s = this.stats();
    if (!s) return null;

    return {
      labels: s.monthlyIssuance.map(m => m.month),
      datasets: [
        {
          label: 'Certificates Issued',
          data: s.monthlyIssuance.map(m => m.count),
          fill: true,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  });

  qualificationTypeChart = computed(() => {
    const s = this.stats();
    if (!s) return null;

    return {
      labels: s.byQualificationType.map(q => q.type),
      datasets: [
        {
          data: s.byQualificationType.map(q => q.count),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
          borderWidth: 0
        }
      ]
    };
  });

  statusDistributionChart = computed(() => {
    const s = this.stats();
    if (!s) return null;

    return {
      labels: s.byStatus.map(st => st.status),
      datasets: [
        {
          data: s.byStatus.map(st => st.count),
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'],
          borderWidth: 0
        }
      ]
    };
  });

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  };

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading.set(true);
    
    // Simulate API call
    setTimeout(() => {
      this.stats.set({
        totalIssued: 12458,
        pendingVerifications: 23,
        activePrograms: 156,
        totalInstitutions: 42,
        byProgram: [
          { program: 'Computer Science', count: 2450 },
          { program: 'Business Administration', count: 1980 },
          { program: 'Engineering', count: 1756 },
          { program: 'Medicine', count: 1234 },
          { program: 'Law', count: 987 }
        ],
        byQualificationType: [
          { type: 'Bachelor\'s', count: 5600 },
          { type: 'Master\'s', count: 3200 },
          { type: 'PhD', count: 1200 },
          { type: 'Diploma', count: 2458 }
        ],
        byStatus: [
          { status: 'Active', count: 10500 },
          { status: 'Pending', count: 800 },
          { status: 'Revoked', count: 158 },
          { status: 'Expired', count: 1000 }
        ],
        monthlyIssuance: [
          { month: 'Jan', count: 850 },
          { month: 'Feb', count: 920 },
          { month: 'Mar', count: 1100 },
          { month: 'Apr', count: 980 },
          { month: 'May', count: 1250 },
          { month: 'Jun', count: 1400 },
          { month: 'Jul', count: 1150 },
          { month: 'Aug', count: 1300 },
          { month: 'Sep', count: 1450 },
          { month: 'Oct', count: 1280 },
          { month: 'Nov', count: 1380 },
          { month: 'Dec', count: 1398 }
        ]
      });
      this.loading.set(false);
    }, 1000);
  }

  getMath() {
    return Math;
  }

  onDateRangeChange() {
    this.loadDashboardData();
  }

  refreshDashboard() {
    this.loadDashboardData();
  }
}