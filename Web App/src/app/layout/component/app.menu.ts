import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { Permission, User, UserRole } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    currentUser: User | null = null;
    
      // Sidebar
      sidebarvisible = true;
      sidebarMenuItems: MenuItem[] = [];
    
      // User menu
      userMenuItems: MenuItem[] = [];
    
      // Notifications
      notificationCount = 0;
      notifications: any[] = [];
    
      // Theme
      isDarkMode = false;
    model: MenuItem[] = [];

    constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

    ngOnInit() {
        this.loadCurrentUser();
        this.buildSidebarMenu();
        this.buildUserMenu();
    }

    private loadCurrentUser(): void {
        this.authService.currentUser$.subscribe(user => {
          this.currentUser = user;
          if (user) {
            this.buildSidebarMenu();
          }
        });
      }
    
      /**
       * Build sidebar menu based on user permissions
       */
      private buildSidebarMenu(): void {
        this.model = [
          {
            label: 'Home',
            icon: 'pi pi-home',
            items: [
              {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-home',
                routerLink: ['/'],
                visible: this.hasPermission(Permission.DASHBOARD_VIEW)
              }
            ]
          },
          {
            label: 'Certificates',
            items: [
              {
                label: 'All Certificates',
                icon: 'pi pi-list',
                routerLink: ['/certificates'],
                visible: this.hasPermission(Permission.CERTIFICATE_VIEW)
              },
              {
                label: 'Issue Certificate',
                icon: 'pi pi-plus-circle',
                routerLink: ['/certificates/create'],
                visible: this.hasPermission(Permission.CERTIFICATE_CREATE)
              },
              {
                label: 'Revoke Certificate',
                icon: 'pi pi-ban',
                routerLink: ['/certificates/revoke'],
                visible: this.hasPermission(Permission.CERTIFICATE_REVOKE)
              }
            ]
          },
          {
            label: 'Verification',
            icon: 'pi pi-verified',
            items: [
              {
                label: 'Quick Verify',
                icon: 'pi pi-search',
                routerLink: ['/certificates/verify'],
                visible: this.hasPermission(Permission.VERIFY_CERTIFICATE)
              },
              {
                label: 'AI Flagged Reviews',
                icon: 'pi pi-flag',
                routerLink: ['/certificates/ai-flags'],
                visible: this.hasPermission(Permission.REVIEW_AI_FLAGS)
              },
              {
                label: 'AI Detection Logs',
                icon: 'pi pi-list-check',
                routerLink: ['/certificates/ai-logs'],
                visible: this.hasPermission(Permission.VIEW_VERIFICATION_HISTORY)
              },
              {
                label: 'Verification History',
                icon: 'pi pi-history',
                routerLink: ['/certificates/verification-history'],
                visible: this.hasPermission(Permission.VIEW_VERIFICATION_HISTORY)
              }
            ]
          },
          {
            label: 'Users',
            icon: 'pi pi-users',
            items: [
              {
                label: 'User Accounts',
                icon: 'pi pi-user',
                routerLink: ['/users/accounts'],
                visible: this.hasPermission(Permission.USER_VIEW)
              }
            ]
          },
          {
            label: 'Admin',
            icon: 'pi pi-cog',
            items: [
              {
                label: 'Gas Costs',
                icon: 'pi pi-bolt',
                routerLink: ['/admin/gas-costs'],
                visible: this.isSuperAdmin()
              }
            ]
          },
          {
            separator: true
          },
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            items: [
              {
                label: 'Institutions',
                icon: 'pi pi-building',
                routerLink: ['/settings/institutions'],
                visible: this.hasPermission(Permission.SETTINGS_INSTITUTION)
              },
              {
                label: 'Faculties',
                icon: 'pi pi-building',
                routerLink: ['/settings/faculties'],
                visible: this.hasPermission(Permission.FACULTY_VIEW)
              },
              {
                label: 'Programs',
                icon: 'pi pi-book',
                routerLink: ['/settings/programs'],
                visible: this.hasPermission(Permission.PROGRAM_VIEW)
              },
              {
                label: 'Students',
                icon: 'pi pi-users',
                routerLink: ['/settings/students'],
                visible: this.hasPermission(Permission.STUDENT_VIEW)
              }
            ]
          }
        ];
    
        // Filter out in//visible items
        this.sidebarMenuItems = this.filterMenuItems(this.sidebarMenuItems);
      }
    
      /**
       * Build user menu
       */
      private buildUserMenu(): void {
        this.userMenuItems = [
          {
            label: 'My Profile',
            icon: 'pi pi-user',
            command: () => this.router.navigate(['/profile'])
          },
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            command: () => this.router.navigate(['/settings'])
          },
          {
            separator: true
          },
          {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => this.logout()
          }
        ];
      }
    
      /**
       * Filter menu items based on visibility
       */
      private filterMenuItems(items: MenuItem[]): MenuItem[] {
        return items
          .filter(item => item.visible !== false)
          .map(item => ({
            ...item,
            items: item.items ? this.filterMenuItems(item.items) : undefined
          }));
      }
    
      /**
       * Check if user has permission
       */
      private hasPermission(permission: Permission): boolean {
        return this.authService.hasPermission(permission);
      }

      /**
       * Check if user is SuperAdmin
       */
      private isSuperAdmin(): boolean {
        return this.currentUser?.role === UserRole.SuperAdmin;
      }
    
      /**
       * Load theme preference
       */
      private loadTheme(): void {
        this.themeService.isDarkMode$.subscribe(isDark => {
          this.isDarkMode = isDark;
        });
      }
    
      /**
       * Toggle sidebar visibility
       */
      toggleSidebar(): void {
        this.sidebarvisible = !this.sidebarvisible;
      }
    
      showNotifications(): void {}
    
      /**
       * Toggle dark mode
       */
      toggleTheme(): void {
        this.themeService.toggleTheme();
      }
    
      /**
       * Logout user
       */
      logout(): void {
        this.authService.logout();
      }
}
