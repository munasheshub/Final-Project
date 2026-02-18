import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { Permission, User } from '../../core/models/user.model';
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
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }],
            
          },
          {
            label: 'Certificates',
            
            items: [
              {
                label: 'All Certificates',
                icon: 'pi pi-list',
                routerLink: ['/certificates'],
                ////visible: this.hasPermission(Permission.CERTIFICATE_VIEW)
              },
              {
                label: 'Issue Certificate',
                icon: 'pi pi-plus-circle',
                routerLink: ['/certificates/create'],
                ////visible: this.hasPermission(Permission.CERTIFICATE_CREATE)
              },
              {
                label: 'Batch Upload',
                icon: 'pi pi-upload',
                routerLink: ['/certificates/batch-upload'],
                ////visible: this.hasPermission(Permission.CERTIFICATE_BATCH_UPLOAD)
              },
              {
                label: 'Revoked Certificates',
                icon: 'pi pi-ban',
                routerLink: ['/certificates/revoked'],
                ////visible: this.hasPermission(Permission.CERTIFICATE_VIEW)
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
                routerLink: ['/verification/quick-verify'],
                //visible: this.hasPermission(Permission.VERIFY_CERTIFICATE)
              },
              {
                label: 'AI Fraud Detection',
                icon: 'pi pi-shield',
                routerLink: ['/verification/fraud-detection'],
                //visible: this.hasPermission(Permission.RUN_FRAUD_DETECTION)
              },
              {
                label: 'Verification History',
                icon: 'pi pi-history',
                routerLink: ['/verification/history'],
                //visible: this.hasPermission(Permission.VIEW_VERIFICATION_HISTORY)
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
                //visible: this.hasPermission(Permission.USER_VIEW)
              }
            ]
          },
          {
            label: 'Reports',
            icon: 'pi pi-chart-line',
            items: [
              {
                label: 'Certificate Reports',
                icon: 'pi pi-file-pdf',
                routerLink: ['/reports/certificates'],
                //visible: this.hasPermission(Permission.REPORTS_VIEW)
              },
              {
                label: 'Verification Reports',
                icon: 'pi pi-check-circle',
                routerLink: ['/reports/verification'],
                //visible: this.hasPermission(Permission.REPORTS_VIEW)
              },
              {
                label: 'Blockchain Analytics',
                icon: 'pi pi-sitemap',
                routerLink: ['/reports/blockchain'],
                //visible: this.hasPermission(Permission.REPORTS_VIEW)
              }
            ]
          },
          {
            label: 'Audit Logs',
            icon: 'pi pi-book',
            items: [
              {
                label: 'System Logs',
                icon: 'pi pi-list',
                routerLink: ['/audit/logs'],
                //visible: this.hasPermission(Permission.AUDIT_VIEW)
              },
              {
                label: 'Blockchain Transactions',
                icon: 'pi pi-link',
                routerLink: ['/audit/blockchain'],
                //visible: this.hasPermission(Permission.AUDIT_VIEW)
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
                label: 'Institution Profile',
                icon: 'pi pi-building',
                routerLink: ['/settings/institution'],
                //visible: this.hasPermission(Permission.SETTINGS_INSTITUTION)
              },
              {
                label: 'Blockchain Config',
                icon: 'pi pi-sitemap',
                routerLink: ['/settings/blockchain'],
                //visible: this.hasPermission(Permission.SETTINGS_BLOCKCHAIN)
              },
              {
                label: 'Signature Management',
                icon: 'pi pi-pencil',
                routerLink: ['/settings/signatures'],
                //visible: this.hasPermission(Permission.SETTINGS_SIGNATURES)
              },
              {
                label: 'Templates',
                icon: 'pi pi-file-edit',
                routerLink: ['/settings/templates'],
                //visible: this.hasPermission(Permission.SETTINGS_TEMPLATES)
              },
              {
                label: 'Programs & Courses',
                icon: 'pi pi-book',
                routerLink: ['/settings/programs'],
                //visible: this.hasPermission(Permission.SETTINGS_TEMPLATES)
              },
              {
                label: 'Students',
                icon: 'pi pi-users',
                routerLink: ['/settings/students'],
                //visible: this.hasPermission(Permission.SETTINGS_TEMPLATES)
              },
              {
                label: 'Institutions',
                icon: 'pi pi-building',
                routerLink: ['/settings/institutions'],
                //visible: this.hasPermission(Permission.SETTINGS_INSTITUTION)
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
