import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { LayoutService } from '../service/layout.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  styles: [`
  .topbar-start {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topbar-end {
  display: flex;
  align-items: center;
}

.layout-menu-button {
  display: none;

  @media (max-width: 991px) {
    display: flex;
  }
}

.topbar-logo {
  text-decoration: none;
  display: none;

  @media (max-width: 991px) {
    display: flex;
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--layout-primary-600, #2563eb);
    letter-spacing: -0.02em;

    .app-dark &,
    [data-theme="dark"] & {
      color: var(--layout-primary-400, #60a5fa);
    }
  }
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.topbar-action {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--layout-gray-500, #64748b);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;

  i {
    font-size: 1.125rem;
  }

  &:hover {
    background: var(--layout-primary-50, #eff6ff);
    color: var(--layout-primary-600, #2563eb);

    .app-dark &,
    [data-theme="dark"] & {
      background: var(--layout-gray-800, #1e293b);
      color: var(--layout-primary-400, #60a5fa);
    }
  }

  &.topbar-action-highlight {
    background: linear-gradient(135deg, var(--layout-primary-500, #3b82f6), var(--layout-primary-600, #2563eb));
    color: white;
    box-shadow: 0 2px 8px -2px rgba(59, 130, 246, 0.4);

    &:hover {
      background: linear-gradient(135deg, var(--layout-primary-600, #2563eb), var(--layout-primary-700, #1d4ed8));
      transform: translateY(-1px);
    }
  }
}

.topbar-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--card-border, #e2e8f0);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1);
  padding: 0.5rem;
  min-width: 180px;
  z-index: 1000;

  .app-dark &,
  [data-theme="dark"] & {
    background: var(--layout-gray-900, #0f172a);
    border-color: var(--layout-gray-800, #1e293b);
  }
}

.topbar-menu-content {
  display: flex;
  flex-direction: column;

  button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--layout-gray-700, #334155);
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s ease;
    text-align: left;
    width: 100%;

    i {
      font-size: 1rem;
      color: var(--layout-gray-400, #94a3b8);
    }

    &:hover {
      background: var(--layout-primary-50, #eff6ff);

      i {
        color: var(--layout-primary-600, #2563eb);
      }

      .app-dark &,
      [data-theme="dark"] & {
        background: var(--layout-gray-800, #1e293b);

        i {
          color: var(--layout-primary-400, #60a5fa);
        }
      }
    }

    .app-dark &,
    [data-theme="dark"] & {
      color: var(--layout-gray-200, #e2e8f0);
    }
  }
}
    `],
  imports: [RouterModule, CommonModule, StyleClassModule, BadgeModule, RippleModule],
  template: `
    <header class="layout-topbar">
  <div class="topbar-start">
    <button 
      type="button"
      class="layout-menu-button topbar-action"
      (click)="onMenuToggle()"
      pRipple>
      <i class="pi pi-bars"></i>
    </button>

    <a routerLink="/" class="topbar-logo">
      <span class="logo-text">CertChain</span>
    </a>
  </div>

  <div class="topbar-end">
    <div class="topbar-actions">
      <!-- Search -->
      <button type="button" class="topbar-action" pRipple>
        <i class="pi pi-search"></i>
      </button>

      <!-- Notifications -->
      <button type="button" class="topbar-action" pRipple pBadge value="3" severity="danger">
        <i class="pi pi-bell"></i>
      </button>

      <!-- Dark Mode Toggle -->
      <button 
        type="button" 
        class="topbar-action topbar-action-highlight"
        (click)="toggleDarkMode()"
        pRipple>
        <i [class]="layoutService.layoutConfig().darkTheme ? 'pi pi-sun' : 'pi pi-moon'"></i>
      </button>

      <!-- Profile Menu -->
      <button 
        type="button"
        class="topbar-action"
        pStyleClass="@next" 
        enterFromClass="hidden" 
        enterActiveClass="animate-scalein" 
        leaveToClass="hidden" 
        leaveActiveClass="animate-fadeout" 
        [hideOnOutsideClick]="true"
        pRipple>
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="topbar-menu hidden">
        <div class="topbar-menu-content">
          <button type="button" pRipple>
            <i class="pi pi-calendar"></i>
            <span>Calendar</span>
          </button>
          <button type="button" pRipple>
            <i class="pi pi-inbox"></i>
            <span>Messages</span>
          </button>
          <button type="button" pRipple>
            <i class="pi pi-user"></i>
            <span>Profile</span>
          </button>
          <button type="button" pRipple>
            <i class="pi pi-cog"></i>
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</header>
  `
})
export class AppTopbar {
  layoutService = inject(LayoutService);
  
  items!: MenuItem[];

  onMenuToggle() {
    this.layoutService.onMenuToggle();
  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme
    }));
  }
}