import { Component, ElementRef, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppMenu } from './app.menu';
import { LayoutService } from '../service/layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  styles: [`
      .sidebar-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 1;
    }

    .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    text-decoration: none;
    }

    .sidebar-logo-icon {
    width: 42px;
    height: 42px;
    background: linear-gradient(135deg, var(--layout-primary-500, #3b82f6) 0%, var(--layout-primary-600, #2563eb) 100%);
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.4);
    flex-shrink: 0;

    i {
        color: white;
        font-size: 1.25rem;
    }
    }

    .sidebar-logo-text {
    display: flex;
    flex-direction: column;
    }

    .sidebar-logo-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: white;
    letter-spacing: -0.02em;
    line-height: 1.2;
    }

    .sidebar-logo-subtitle {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 400;
    }

    .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 0;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;

        &:hover {
        background: rgba(255, 255, 255, 0.3);
        }
    }
    }
    `],
  imports: [CommonModule, RouterModule, AppMenu],
  template: `
    <aside class="layout-sidebar">
  <div class="sidebar-header">
    <a routerLink="/" class="sidebar-logo">
      <div class="sidebar-logo-icon">
        <i class="pi pi-shield"></i>
      </div>
      <div class="sidebar-logo-text">
        <span class="sidebar-logo-title">CertChain</span>
        <span class="sidebar-logo-subtitle">Secure Credentials</span>
      </div>
    </a>
  </div>
  
  <div class="sidebar-content">
    <app-menu></app-menu>
  </div>
</aside>
  `
})
export class AppSidebar {
  layoutService = inject(LayoutService);
  
  constructor(public el: ElementRef) {}
}