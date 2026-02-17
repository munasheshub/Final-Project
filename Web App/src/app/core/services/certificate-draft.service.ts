import { Injectable, signal } from '@angular/core';
import { BlockchainCertificateIssueDto } from '../../features/certificates/services/certificate.service';

export interface CertificateDraft extends BlockchainCertificateIssueDto {
  draftId: string;
  draftStatus: 'blockchain_only' | 'pending_retry';
  savedAt: string;
  retryCount: number;
  lastError?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateDraftService {
  private readonly STORAGE_KEY = 'certificate_drafts';
  
  // Signal to track drafts
  drafts = signal<CertificateDraft[]>([]);

  constructor() {
    this.loadDrafts();
  }

  /**
   * Load drafts from localStorage
   */
  private loadDrafts(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const drafts = JSON.parse(stored) as CertificateDraft[];
        this.drafts.set(drafts);
      }
    } catch (error) {
      console.error('Failed to load drafts:', error);
      this.drafts.set([]);
    }
  }

  /**
   * Save drafts to localStorage
   */
  private saveDrafts(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.drafts()));
    } catch (error) {
      console.error('Failed to save drafts:', error);
    }
  }

  /**
   * Add a new draft (blockchain registered but backend failed)
   */
  addDraft(data: BlockchainCertificateIssueDto, error?: string): CertificateDraft {
    const draft: CertificateDraft = {
      ...data,
      draftId: this.generateDraftId(),
      draftStatus: 'blockchain_only',
      savedAt: new Date().toISOString(),
      retryCount: 0,
      lastError: error
    };

    const currentDrafts = this.drafts();
    this.drafts.set([...currentDrafts, draft]);
    this.saveDrafts();

    return draft;
  }

  /**
   * Update draft retry count and error
   */
  updateDraft(draftId: string, updates: Partial<CertificateDraft>): void {
    const currentDrafts = this.drafts();
    const updatedDrafts = currentDrafts.map(draft => 
      draft.draftId === draftId ? { ...draft, ...updates } : draft
    );
    this.drafts.set(updatedDrafts);
    this.saveDrafts();
  }

  /**
   * Remove draft after successful backend submission
   */
  removeDraft(draftId: string): void {
    const currentDrafts = this.drafts();
    const filtered = currentDrafts.filter(draft => draft.draftId !== draftId);
    this.drafts.set(filtered);
    this.saveDrafts();
  }

  /**
   * Get draft by ID
   */
  getDraft(draftId: string): CertificateDraft | undefined {
    return this.drafts().find(draft => draft.draftId === draftId);
  }

  /**
   * Get all drafts
   */
  getAllDrafts(): CertificateDraft[] {
    return this.drafts();
  }

  /**
   * Clear all drafts
   */
  clearAllDrafts(): void {
    this.drafts.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Generate unique draft ID
   */
  private generateDraftId(): string {
    return `draft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get draft count
   */
  getDraftCount(): number {
    return this.drafts().length;
  }
}
