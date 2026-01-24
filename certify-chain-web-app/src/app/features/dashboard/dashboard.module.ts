import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChartModule } from 'primeng/chart';
import { TimelineModule } from 'primeng/timeline';
import { ProgressBarModule } from 'primeng/progressbar';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TableModule,
    PaginatorModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    DatePickerModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    TagModule,
    SkeletonModule,
    FormsModule,
    ProgressSpinnerModule,
    ChartModule,
    TimelineModule,
    ProgressBarModule,
    RouterModule
    
  ]
})
export class DashboardModule { }
