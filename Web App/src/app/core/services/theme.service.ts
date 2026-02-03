import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app_theme';
  private isDarkModeSubject = new BehaviorSubject<boolean>(this.getStoredTheme());
  
  public isDarkMode$ = this.isDarkModeSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.applyTheme(this.isDarkModeSubject.value);
  }

  /**
   * Toggle between light and dark mode
   */
  toggleTheme(): void {
    const newTheme = !this.isDarkModeSubject.value;
    this.isDarkModeSubject.next(newTheme);
    this.applyTheme(newTheme);
    this.storeTheme(newTheme);
  }

  /**
   * Set specific theme
   */
  setTheme(isDark: boolean): void {
    this.isDarkModeSubject.next(isDark);
    this.applyTheme(isDark);
    this.storeTheme(isDark);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): boolean {
    return this.isDarkModeSubject.value;
  }

  /**
   * Apply theme to document
   */
  private applyTheme(isDark: boolean): void {
    if (this.isBrowser) {
      const body = document.body;
      
      if (isDark) {
        body.classList.add('dark-theme');
        this.loadPrimeNGTheme('lara-dark-blue');
      } else {
        body.classList.remove('dark-theme');
        this.loadPrimeNGTheme('lara-light-blue');
      }
    }
  }

  /**
   * Load PrimeNG theme dynamically
   */
  private loadPrimeNGTheme(theme: string): void {
    if (this.isBrowser) {
      const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
      
      if (themeLink) {
        themeLink.href = `${theme}.css`;
      }
    }
  }

  /**
   * Get stored theme preference
   */
  private getStoredTheme(): boolean {
    if (this.isBrowser) {
      const stored = localStorage.getItem(this.THEME_KEY);
      return stored === 'dark';
    }
    return false;
  }

  /**
   * Store theme preference
   */
  private storeTheme(isDark: boolean): void {
    if (this.isBrowser) {
      localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
    }
  }
}
