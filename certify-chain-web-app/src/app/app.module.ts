// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SpeedDialModule } from 'primeng/speeddial';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ChartModule } from 'primeng/chart';
import { TimelineModule } from 'primeng/timeline';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { StepsModule } from 'primeng/steps';
import { PaginatorModule } from 'primeng/paginator';
import { TreeTableModule } from 'primeng/treetable';
import { DataViewModule } from 'primeng/dataview';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ImageModule } from 'primeng/image';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PasswordModule } from 'primeng/password';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToggleButtonModule } from 'primeng/togglebutton';

// PrimeNG Services
import { MessageService, ConfirmationService } from 'primeng/api';

// Core Module
import { CoreModule } from './core/core.module';

// Shared Module
import { SharedModule } from './shared/shared.module';

// Interceptors
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';

// Routing
import { AppRoutingModule } from './app-routing.module';

// Components
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // Angular
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    // PrimeNG Modules
    ButtonModule,
    CardModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    CheckboxModule,
    RadioButtonModule,
    InputTextareaModule,
    InputNumberModule,
    FileUploadModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    SkeletonModule,
    ToastModule,
    MessageModule,
    MessagesModule,
    ConfirmDialogModule,
    DialogModule,
    SidebarModule,
    MenuModule,
    MenubarModule,
    PanelMenuModule,
    BreadcrumbModule,
    TabViewModule,
    AccordionModule,
    FieldsetModule,
    PanelModule,
    ToolbarModule,
    SplitButtonModule,
    SpeedDialModule,
    TagModule,
    ChipModule,
    BadgeModule,
    AvatarModule,
    AvatarGroupModule,
    ChartModule,
    TimelineModule,
    DividerModule,
    TooltipModule,
    RippleModule,
    StepsModule,
    PaginatorModule,
    TreeTableModule,
    DataViewModule,
    OverlayPanelModule,
    ImageModule,
    InputSwitchModule,
    PasswordModule,
    SelectButtonModule,
    ToggleButtonModule,

    // App Modules
    CoreModule,
    SharedModule,
    AppRoutingModule
  ],
  providers: [
    MessageService,
    ConfirmationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }