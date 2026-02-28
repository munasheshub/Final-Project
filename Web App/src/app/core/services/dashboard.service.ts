import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ServiceResponse } from '@/core/models/service-response.model';
import {
  DashboardMetricsDto,
  ActivityChartDto,
  MonthlyOverviewDto,
  RecentActivityDto,
  RecentCertificateDto,
  VerificationRequestDto,
  TopProgramDto
} from '@/core/models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = `${environment.apiUrl}/dashboard`;
  private http = inject(HttpClient);

  /**
   * Get dashboard metrics (total certificates, verifications, etc.)
   */
  getMetrics(): Observable<ServiceResponse<DashboardMetricsDto>> {
    return this.http.get<ServiceResponse<DashboardMetricsDto>>(`${this.API_URL}/metrics`);
  }

  /**
   * Get activity chart data (monthly issuance and verification trends)
   */
  getActivityChart(): Observable<ServiceResponse<ActivityChartDto>> {
    return this.http.get<ServiceResponse<ActivityChartDto>>(`${this.API_URL}/activity-chart`);
  }

  /**
   * Get monthly overview data (issuance vs revocation)
   */
  getMonthlyOverview(): Observable<ServiceResponse<MonthlyOverviewDto>> {
    return this.http.get<ServiceResponse<MonthlyOverviewDto>>(`${this.API_URL}/monthly-overview`);
  }

  /**
   * Get recent activity log
   * @param limit Number of activities to return (default: 10)
   */
  getRecentActivity(limit: number = 10): Observable<ServiceResponse<RecentActivityDto[]>> {
    return this.http.get<ServiceResponse<RecentActivityDto[]>>(`${this.API_URL}/recent-activity?limit=${limit}`);
  }

  /**
   * Get recently issued certificates
   * @param limit Number of certificates to return (default: 5)
   */
  getRecentCertificates(limit: number = 5): Observable<ServiceResponse<RecentCertificateDto[]>> {
    return this.http.get<ServiceResponse<RecentCertificateDto[]>>(`${this.API_URL}/recent-certificates?limit=${limit}`);
  }

  /**
   * Get recent verification requests
   * @param limit Number of requests to return (default: 10)
   */
  getVerificationRequests(limit: number = 10): Observable<ServiceResponse<VerificationRequestDto[]>> {
    return this.http.get<ServiceResponse<VerificationRequestDto[]>>(`${this.API_URL}/verification-requests?limit=${limit}`);
  }

  /**
   * Get top programs by certificate count
   * @param limit Number of programs to return (default: 5)
   */
  getTopPrograms(limit: number = 5): Observable<ServiceResponse<TopProgramDto[]>> {
    return this.http.get<ServiceResponse<TopProgramDto[]>>(`${this.API_URL}/top-programs?limit=${limit}`);
  }
}
