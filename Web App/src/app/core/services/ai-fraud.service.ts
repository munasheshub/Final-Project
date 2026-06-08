// src/app/core/services/ai-fraud.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AiFraudResult, AiFlagPagedResult, AiLogPagedResult, AiDashboardStats } from '@/core/models/ai-fraud.model';

@Injectable({
  providedIn: 'root'
})
export class AiFraudService {
  private readonly API_URL = `${environment.apiUrl}/certificates`;
  private readonly DASHBOARD_URL = `${environment.apiUrl}/dashboard`;
  private http = inject(HttpClient);

  /**
   * Analyses a certificate image for fraud indicators via the AI microservice.
   * Calls the lightweight backend endpoint that ONLY runs AI analysis.
   */
  analyseImage(file: File): Observable<AiFraudResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<AiFraudResult>(`${this.API_URL}/analyse-image`, formData);
  }

  /**
   * Returns paginated list of AI flags pending human review.
   */
  getPendingFlags(page: number = 1, size: number = 10): Observable<AiFlagPagedResult> {
    return this.http.get<AiFlagPagedResult>(
      `${this.API_URL}/ai-flags?pageNumber=${page}&pageSize=${size}`
    );
  }

  /**
   * Submits a human review decision for a flagged AI detection.
   */
  reviewFlag(aiLogId: string, outcome: string, notes?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/review/${aiLogId}`, { outcome, notes });
  }

  /**
   * Returns AI fraud detection statistics for the dashboard widget.
   */
  getAiStats(): Observable<AiDashboardStats> {
    return this.http.get<AiDashboardStats>(`${this.DASHBOARD_URL}/ai-stats`);
  }

  /**
   * Returns paginated list of ALL AI detection logs (history view).
   */
  getAiLogs(page: number = 1, size: number = 20): Observable<AiLogPagedResult> {
    return this.http.get<AiLogPagedResult>(
      `${this.API_URL}/ai-logs?pageNumber=${page}&pageSize=${size}`
    );
  }
}
