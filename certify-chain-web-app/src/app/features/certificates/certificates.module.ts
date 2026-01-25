import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { FileUploadModule } from 'primeng/fileupload';
import { StepsModule } from 'primeng/steps';
import { CertificateCreateComponent } from './certificate-create/certificate-create';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { KnobModule } from 'primeng/knob';
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
  declarations: [
    CertificateCreateComponent
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
    FileUploadModule,
    StepsModule,
    ToolbarModule,
    ReactiveFormsModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    DividerModule,
    MessageModule,
    KnobModule,
    CheckboxModule

  ],
  
  providers: [ConfirmationService, MessageService]
})
export class CertificatesModule { }
