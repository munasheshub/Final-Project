// src/app/features/dashboard/dashboard.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { BlockchainStats } from '../../core/models/blockchain.model';
import { CertificateStats } from '../../core/models/api-response.model';
import { CertificateService } from '../certificates/services/certificate.service';

interface StatCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: number;
  trendLabel?: string;
}

interface ChartData {
  labels: string[];
  datasets: any[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  Math = Math;
  // Loading states
  loading = true;
  statsLoading = true;

  // Stats
  stats: CertificateStats | null = null;
  blockchainStats: BlockchainStats | null = null;

  // Stat cards
  statCards: StatCard[] = [];

  // Chart data
  monthlyIssuanceChart: ChartData | null = null;
  qualificationTypeChart: ChartData | null = null;
  statusDistributionChart: ChartData | null = null;

  // Chart options
  chartOptions: any;
  pieChartOptions: any;

  // Recent activities
  recentActivities: any[] = [];

  // Date range for filters
  dateRange: Date[] = [];

  constructor(
    private certificateService: CertificateService
  ) {
    this.initializeChartOptions();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all dashboard data
   */
  loadDashboardData(): void {
    this.loading = true;
    this.statsLoading = true;

    this.certificateService.getCertificateStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
          this.buildStatCards(stats);
          this.buildCharts(stats);
          this.statsLoading = false;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading stats:', error);
          this.statsLoading = false;
          this.loading = false;
        }
      });
  }

  /**
   * Build stat cards from certificate stats
   */
  private buildStatCards(stats: CertificateStats): void {
    this.statCards = [
      {
        title: 'Total Certificates Issued',
        value: stats.totalIssued.toLocaleString(),
        icon: 'pi pi-file-check',
        color: '#1976D2',
        trend: 12.5,
        trendLabel: 'vs last month'
      },
      {
        title: 'Verified Certificates',
        value: stats.totalVerified.toLocaleString(),
        icon: 'pi pi-verified',
        color: '#66BB6A',
        trend: 8.3,
        trendLabel: 'vs last month'
      },
      {
        title: 'Pending Issuance',
        value: stats.pendingIssuance.toLocaleString(),
        icon: 'pi pi-clock',
        color: '#FFA726',
        trend: -5.2,
        trendLabel: 'vs last month'
      },
      {
        title: 'Revoked Certificates',
        value: stats.totalRevoked.toLocaleString(),
        icon: 'pi pi-ban',
        color: '#EF5350',
        trend: 2.1,
        trendLabel: 'vs last month'
      }
    ];
  }

  /**
   * Build charts from certificate stats
   */
  private buildCharts(stats: CertificateStats): void {
    // Monthly issuance trend chart
    this.monthlyIssuanceChart = {
      labels: stats.monthlyIssuance.map(m => m.month),
      datasets: [
        {
          label: 'Certificates Issued',
          data: stats.monthlyIssuance.map(m => m.count),
          borderColor: '#1976D2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    // Qualification type distribution (pie chart)
    this.qualificationTypeChart = {
      labels: stats.byQualificationType.map(t => t.type),
      datasets: [
        {
          data: stats.byQualificationType.map(t => t.count),
          backgroundColor: [
            '#1976D2',
            '#7B1FA2',
            '#FFA726',
            '#66BB6A',
            '#42A5F5',
            '#BA68C8'
          ],
          hoverBackgroundColor: [
            '#1565C0',
            '#6A1B9A',
            '#FB8C00',
            '#4CAF50',
            '#1E88E5',
            '#AB47BC'
          ]
        }
      ]
    };

    // Status distribution (doughnut chart)
    this.statusDistributionChart = {
      labels: ['Issued', 'Verified', 'Pending', 'Revoked'],
      datasets: [
        {
          data: [
            stats.totalIssued - stats.totalVerified - stats.pendingIssuance,
            stats.totalVerified,
            stats.pendingIssuance,
            stats.totalRevoked
          ],
          backgroundColor: ['#1976D2', '#66BB6A', '#FFA726', '#EF5350'],
          hoverBackgroundColor: ['#1565C0', '#4CAF50', '#FB8C00', '#E53935']
        }
      ]
    };
  }

  /**
   * Initialize chart options
   */
  private initializeChartOptions(): void {
    // Line/Bar chart options
    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    };

    // Pie/Doughnut chart options
    this.pieChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1,
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          },
          position: 'bottom'
        }
      }
    };
  }

  /**
   * Handle date range change
   */
  onDateRangeChange(): void {
    if (this.dateRange && this.dateRange.length === 2) {
      const [dateFrom, dateTo] = this.dateRange;
      this.certificateService.getCertificateStats(dateFrom, dateTo)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (stats) => {
            this.stats = stats;
            this.buildStatCards(stats);
            this.buildCharts(stats);
          }
        });
    }
  }

  /**
   * Refresh dashboard
   */
  refreshDashboard(): void {
    this.loadDashboardData();
  }
}