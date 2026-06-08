import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { BlockchainService } from '@/core/services/blockchain.service';
import { BlockchainTransaction, BlockchainStats, GasEstimate, TransactionStatus, TransactionType } from '@/core/models/blockchain.model';

@Component({
    selector: 'app-gas-costs',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TableModule,
        TagModule,
        SelectModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        ToastModule,
        ProgressSpinnerModule
    ],
    providers: [MessageService],
    templateUrl: './gas-costs.html'
})
export class GasCostsComponent implements OnInit {
    private blockchainService = inject(BlockchainService);
    private messageService = inject(MessageService);

    transactions = signal<BlockchainTransaction[]>([]);
    stats = signal<BlockchainStats | null>(null);
    gasEstimates = signal<{ operation: string; estimate: GasEstimate }[]>([]);
    isLoading = signal(false);
    totalRecords = signal(0);
    currentPage = signal(1);
    pageSize = signal(20);
    searchValue = signal('');
    selectedType = signal('All Types');

    typeOptions = [
        { label: 'All Types', value: 'All Types' },
        { label: 'Issue', value: TransactionType.CERTIFICATE_ISSUE },
        { label: 'Revoke', value: TransactionType.CERTIFICATE_REVOKE },
        { label: 'Update', value: TransactionType.CERTIFICATE_UPDATE },
        { label: 'Verify', value: TransactionType.CERTIFICATE_VERIFY }
    ];

    filteredTransactions = computed(() => {
        let txs = this.transactions();
        const search = this.searchValue().toLowerCase();
        const type = this.selectedType();

        if (search) {
            txs = txs.filter(tx =>
                tx.transactionHash?.toLowerCase().includes(search) ||
                tx.certificateNumber?.toLowerCase().includes(search) ||
                tx.initiatedBy?.toLowerCase().includes(search)
            );
        }
        if (type !== 'All Types') {
            txs = txs.filter(tx => tx.type === type);
        }
        return txs;
    });

    totalGasUsed = computed(() => {
        return this.filteredTransactions().reduce((sum, tx) => {
            return sum + (tx.gasUsed ? parseFloat(tx.gasUsed) : 0);
        }, 0);
    });

    totalGasFee = computed(() => {
        return this.filteredTransactions().reduce((sum, tx) => {
            return sum + (tx.gasFee ? parseFloat(tx.gasFee) : 0);
        }, 0);
    });

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading.set(true);
        this.loadTransactions();
        this.loadStats();
        this.loadGasEstimates();
    }

    loadTransactions(): void {
        this.blockchainService.getTransactionHistory(this.currentPage(), this.pageSize()).subscribe({
            next: (res) => {
                this.transactions.set(res.data);
                this.totalRecords.set(res.total);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load transactions' });
                this.isLoading.set(false);
            }
        });
    }

    loadStats(): void {
        this.blockchainService.getBlockchainStats().subscribe({
            next: (stats) => this.stats.set(stats),
            error: () => {}
        });
    }

    loadGasEstimates(): void {
        const operations = ['issueCertificate', 'revokeCertificate', 'verifyCertificate'];
        operations.forEach(op => {
            this.blockchainService.estimateGas(op).subscribe({
                next: (estimate) => {
                    this.gasEstimates.update(list => [...list, { operation: op, estimate }]);
                },
                error: () => {}
            });
        });
    }

    onPage(event: any): void {
        this.currentPage.set(Math.floor(event.first / event.rows) + 1);
        this.pageSize.set(event.rows);
        this.loadTransactions();
    }

    onSearch(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.searchValue.set(value);
    }

    onTypeChange(event: any): void {
        this.selectedType.set(event.value);
    }

    refresh(): void {
        this.gasEstimates.set([]);
        this.loadData();
    }

    getStatusSeverity(status: TransactionStatus): 'success' | 'warn' | 'danger' | 'info' {
        switch (status) {
            case TransactionStatus.CONFIRMED: return 'success';
            case TransactionStatus.PENDING: return 'warn';
            case TransactionStatus.FAILED: return 'danger';
            default: return 'info';
        }
    }

    getTypeLabel(type: TransactionType): string {
        switch (type) {
            case TransactionType.CERTIFICATE_ISSUE: return 'Issue';
            case TransactionType.CERTIFICATE_REVOKE: return 'Revoke';
            case TransactionType.CERTIFICATE_UPDATE: return 'Update';
            case TransactionType.CERTIFICATE_VERIFY: return 'Verify';
            default: return type;
        }
    }

    getOperationLabel(op: string): string {
        switch (op) {
            case 'issueCertificate': return 'Issue Certificate';
            case 'revokeCertificate': return 'Revoke Certificate';
            case 'verifyCertificate': return 'Verify Certificate';
            default: return op;
        }
    }

    formatGas(value: string | undefined): string {
        if (!value) return '—';
        const num = parseFloat(value);
        return num.toLocaleString();
    }

    formatEth(value: string | undefined): string {
        if (!value) return '—';
        const num = parseFloat(value);
        return num.toFixed(6) + ' ETH';
    }

    truncateHash(hash: string | undefined): string {
        if (!hash) return '—';
        return hash.substring(0, 10) + '...' + hash.substring(hash.length - 8);
    }

    formatTimestamp(date: Date): string {
        return new Date(date).toLocaleString();
    }
}
