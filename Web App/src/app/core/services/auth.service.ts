import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  User,
  AuthTokens,
  LoginCredentials,
  TwoFactorVerification,
  PasswordReset,
  PasswordResetConfirm,
  Permission
} from '../models/user.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // Defer initialization to avoid circular dependency with HttpClient/Interceptor
    setTimeout(() => {
      this.initializeAuth();
      this.checkTokenExpiration();
    }, 0);
  }

  /**
   * Initialize authentication state on app load
   */
  private initializeAuth(): void {
    if (!this.isBrowser) return;

    const hasValidAccessToken = this.hasValidToken();
    const refreshToken = this.getRefreshToken();

    if (hasValidAccessToken) {
      // Valid access token exists
      this.isAuthenticatedSubject.next(true);
      this.getCurrentUser().subscribe();
    } else if (refreshToken) {
      // Access token expired but refresh token exists - try to refresh
      this.refreshToken().subscribe({
        next: () => {
          this.isAuthenticatedSubject.next(true);
          this.getCurrentUser().subscribe();
        },
        error: () => {
          // Refresh failed, clear everything
          this.clearStorage();
          this.isAuthenticatedSubject.next(false);
        }
      });
    } else {
      // No valid tokens
      this.isAuthenticatedSubject.next(false);
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(tokens => this.handleAuthSuccess(tokens)),
        catchError(this.handleError)
      );
  }

  /**
   * Verify two-factor authentication code
   */
  verifyTwoFactor(verification: TwoFactorVerification): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.API_URL}/verify-2fa`, verification)
      .pipe(
        tap(tokens => this.handleAuthSuccess(tokens)),
        catchError(this.handleError)
      );
  }

  /**
   * Request password reset
   */
  requestPasswordReset(data: PasswordReset): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/forgot-password`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Confirm password reset with token
   */
  confirmPasswordReset(data: PasswordResetConfirm): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/reset-password`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/profile`)
      .pipe(
        tap(user => {
          this.setUser(user);
          this.currentUserSubject.next(user);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthTokens>(`${this.API_URL}/refresh`, { refreshToken })
      .pipe(
        tap(tokens => {
          this.setTokens(tokens.accessToken, tokens.refreshToken);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          this.clearStorage();
          this.isAuthenticatedSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: Permission): boolean {
    const user = this.currentUserSubject.value;
    return user?.permissions.includes(permission) ?? false;
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if token exists and is valid
   */
  private hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    const payload = parts[1];
    return JSON.parse(atob(payload));
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(tokens: AuthTokens): void {
    this.setTokens(tokens.accessToken, tokens.refreshToken);
    this.isAuthenticatedSubject.next(true);
    this.getCurrentUser().subscribe();
  }

  /**
   * Set tokens in storage
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Set user in storage
   */
  private setUser(user: User): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user from storage
   */
  private getUserFromStorage(): User | null {
    if (!this.isBrowser) return null;
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Clear all auth data from storage
   */
  private clearStorage(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check token expiration periodically and auto-refresh
   */
  private checkTokenExpiration(): void {
    if (!this.isBrowser) return;

    setInterval(() => {
      const hasValid = this.hasValidToken();
      const hasRefresh = this.getRefreshToken();
      const isAuth = this.isAuthenticatedSubject.value;

      if (!hasValid && hasRefresh && isAuth) {
        // Access token expired but refresh token exists, try to refresh
        this.refreshToken().subscribe({
          error: () => this.logout()
        });
      } else if (!hasValid && !hasRefresh && isAuth) {
        // No valid tokens at all, logout
        this.logout();
      }
    }, 60000); // Check every minute
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    console.log('Error in AuthService:', error);
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status) {
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid credentials';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 500:
          errorMessage = 'Server error occurred';
          break;
        default:
          errorMessage = error.error?.message || errorMessage;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}