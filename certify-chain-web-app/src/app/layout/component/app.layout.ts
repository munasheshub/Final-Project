import { Component, computed, inject, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AppTopbar } from './app.topbar';
import { AppSidebar } from './app.sidebar';
import { AppFooter } from './app.footer';
import { LayoutService } from '../service/layout.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  styles: [`
  // ==============================================
// LAYOUT WRAPPER - Controls all states
// ==============================================

$sidebar-width: 280px;
$sidebar-collapsed-width: 0px;
$topbar-height: 64px;
$transition-duration: 0.3s;

.layout-wrapper {
  min-height: 100vh;
}

// ==============================================
// SIDEBAR
// ==============================================

.layout-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: $sidebar-width;
  background: linear-gradient(180deg, var(--layout-primary-900, #1e3a8a) 0%, var(--layout-primary-950, #172554) 100%);
  border-right: 1px solid var(--layout-primary-800, #1e40af);
  display: flex;
  flex-direction: column;
  z-index: 999;
  transition: transform $transition-duration cubic-bezier(0.4, 0, 0.2, 1);

  // Subtle inner glow
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: radial-gradient(ellipse at top center, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }
}

// ==============================================
// TOPBAR
// ==============================================

.layout-topbar {
  position: fixed;
  top: 0;
  left: $sidebar-width;
  right: 0;
  height: $topbar-height;
  background: var(--topbar-bg, #ffffff);
  border-bottom: 1px solid var(--topbar-border, #e2e8f0);
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  z-index: 998;
  transition: left $transition-duration cubic-bezier(0.4, 0, 0.2, 1);
}

// ==============================================
// MAIN CONTENT
// ==============================================

.layout-main-container {
  margin-left: $sidebar-width;
  padding-top: $topbar-height;
  min-height: 100vh;
  background: var(--content-bg, #f8fafc);
  transition: margin-left $transition-duration cubic-bezier(0.4, 0, 0.2, 1);
}

.layout-main {
  padding: 1.5rem;
  min-height: calc(100vh - $topbar-height - 56px);
}

// ==============================================
// FOOTER
// ==============================================

.layout-footer {
  background: var(--footer-bg, #ffffff);
  border-top: 1px solid var(--footer-border, #e2e8f0);
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  color: var(--footer-text, #64748b);
  text-align: center;

  a {
    color: var(--layout-primary-600, #2563eb);
    font-weight: 600;
    text-decoration: none;

    &:hover {
      color: var(--layout-primary-700, #1d4ed8);
    }
  }
}

// ==============================================
// OVERLAY MASK (Mobile backdrop)
// ==============================================

.layout-mask {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  opacity: 0;
  transition: opacity $transition-duration ease;

  &.layout-mask-active {
    display: block;
    opacity: 1;
  }
}

// ==============================================
// STATIC MODE - Desktop Inactive (Sidebar Hidden)
// ==============================================

.layout-static-inactive {
  .layout-sidebar {
    transform: translateX(-100%);
  }

  .layout-topbar {
    left: 0;
  }

  .layout-main-container {
    margin-left: 0;
  }
}

// ==============================================
// OVERLAY MODE
// ==============================================

.layout-overlay {
  .layout-sidebar {
    transform: translateX(-100%);
  }

  .layout-topbar {
    left: 0;
  }

  .layout-main-container {
    margin-left: 0;
  }

  &.layout-overlay-active {
    .layout-sidebar {
      transform: translateX(0);
    }
  }
}

// ==============================================
// MOBILE (Below 992px)
// ==============================================

@media (max-width: 991px) {
  .layout-sidebar {
    transform: translateX(-100%);
  }

  .layout-topbar {
    left: 0;
  }

  .layout-main-container {
    margin-left: 0;
  }

  // Mobile menu button visible
  .layout-menu-button {
    display: flex !important;
  }

  // Mobile menu active state
  .layout-mobile-active {
    .layout-sidebar {
      transform: translateX(0);
    }

    .layout-mask {
      display: block;
      opacity: 1;
    }
  }
}

// ==============================================
// DARK MODE
// ==============================================

.app-dark,
[data-theme="dark"] {
  .layout-sidebar {
    background: linear-gradient(180deg, var(--layout-gray-900, #0f172a) 0%, var(--layout-gray-950, #020617) 100%);
    border-color: var(--layout-gray-800, #1e293b);
  }

  .layout-topbar {
    background: var(--layout-gray-900, #0f172a);
    border-color: var(--layout-gray-800, #1e293b);
  }

  .layout-main-container {
    background: var(--layout-gray-950, #020617);
  }

  .layout-footer {
    background: var(--layout-gray-900, #0f172a);
    border-color: var(--layout-gray-800, #1e293b);
    color: var(--layout-gray-400, #94a3b8);

    a {
      color: var(--layout-primary-400, #60a5fa);

      &:hover {
        color: var(--layout-primary-300, #93c5fd);
      }
    }
  }
}
    `],
  imports: [CommonModule, RouterModule, AppTopbar, AppSidebar, AppFooter],
  template: `
   <div class="layout-wrapper" [ngClass]="containerClass()">
  <app-topbar></app-topbar>
  <app-sidebar></app-sidebar>
  
  <div class="layout-main-container">
    <div class="layout-main">
      <router-outlet></router-outlet>
    </div>
    <app-footer></app-footer>
  </div>

  <!-- Mobile overlay backdrop -->
  <div 
    class="layout-mask" 
    [class.layout-mask-active]="layoutService.layoutState().staticMenuMobileActive || layoutService.layoutState().overlayMenuActive"
    (click)="hideMenu()">
  </div>
</div>
  `
})
export class AppLayout implements OnDestroy {
  layoutService = inject(LayoutService);
  renderer = inject(Renderer2);
  router = inject(Router);

  overlayMenuOpenSubscription: Subscription;
  menuProfileOutsideClickListener: any;

  @ViewChild(AppSidebar) appSidebar!: AppSidebar;

  // Computed classes for layout container
  containerClass = computed(() => {
    const config = this.layoutService.layoutConfig();
    const state = this.layoutService.layoutState();

    return {
      'layout-overlay': config.menuMode === 'overlay',
      'layout-static': config.menuMode === 'static',
      'layout-static-inactive': state.staticMenuDesktopInactive && config.menuMode === 'static',
      'layout-overlay-active': state.overlayMenuActive,
      'layout-mobile-active': state.staticMenuMobileActive,
      'app-dark': config.darkTheme
    };
  });

  constructor() {
    this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
      if (!this.menuProfileOutsideClickListener) {
        this.menuProfileOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
          const isOutsideClicked = !(
            this.appSidebar?.el.nativeElement.contains(event.target)
          );
          if (isOutsideClicked) {
            this.hideMenu();
          }
        });
      }
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.hideMenu();
    });
  }

  hideMenu() {
    this.layoutService.layoutState.update((prev) => ({
      ...prev,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
      menuHoverActive: false
    }));
    this.unblindMenuOutsideClickListener();
  }

  unblindMenuOutsideClickListener() {
    if (this.menuProfileOutsideClickListener) {
      this.menuProfileOutsideClickListener();
      this.menuProfileOutsideClickListener = null;
    }
  }

  ngOnDestroy() {
    this.overlayMenuOpenSubscription?.unsubscribe();
    this.unblindMenuOutsideClickListener();
  }
}