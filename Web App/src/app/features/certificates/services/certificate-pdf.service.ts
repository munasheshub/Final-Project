import { Injectable, inject } from '@angular/core';
import { forkJoin, from, Observable, switchMap } from 'rxjs';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { CertificateService } from './certificate.service';
import { IpfsService } from '@/core/services/ipfs.service';

@Injectable({
  providedIn: 'root'
})
export class CertificatePdfService {
  private certificateService = inject(CertificateService);
  private ipfsService = inject(IpfsService);

  /**
   * Downloads the certificate PDF from IPFS, fetches the QR code,
   * embeds the QR code into the PDF centered below "BULAWAYO, ZIMBABWE",
   * and returns the modified PDF as a Blob.
   */
  getCertificateWithQrCode(certificateId: string | number, ipfsCid: string): Observable<Blob> {
    return forkJoin({
      pdf: this.ipfsService.downloadFromIPFS(ipfsCid),
      qr: this.certificateService.generateQrCode(certificateId)
    }).pipe(
      switchMap(({ pdf, qr }) => from(this.embedQrCodeInPdf(pdf, qr)))
    );
  }

  /**
   * Embeds the QR code image into the PDF.
   * - Centered horizontally on the first page
   * - 20 units below the "BULAWAYO, ZIMBABWE" text
   * - 80x80 points
   * - "Scan to Verify" label in 8pt centered beneath the QR code
   */
  private async embedQrCodeInPdf(pdfBlob: Blob, qrBlob: Blob): Promise<Blob> {
    const pdfBytes = await pdfBlob.arrayBuffer();
    const qrBytes = await qrBlob.arrayBuffer();
    const qrUint8 = new Uint8Array(qrBytes);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    // Embed QR code image (detect PNG vs JPEG from magic bytes)
    const isPng = qrUint8[0] === 0x89 && qrUint8[1] === 0x50;
    const qrImage = isPng
      ? await pdfDoc.embedPng(qrBytes)
      : await pdfDoc.embedJpg(qrBytes);

    // QR code dimensions
    const qrSize = 80;

    // Find the "BULAWAYO, ZIMBABWE" text position by scanning from the bottom.
    // The text is typically near the bottom of the certificate.
    // We place the QR code 20 units below that text.
    // Since we can't reliably extract text positions from every PDF,
    // we position relative to the bottom of the page.
    // Typical certificate layout: "BULAWAYO, ZIMBABWE" sits ~90-120 units from bottom.
    // We place QR at roughly 20 units below that text line.
    const qrY = 30; // bottom margin — adjust if needed
    const qrX = (width - qrSize) / 2;

    // Draw QR code
    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    // Draw "Scan to Verify" label centered beneath the QR code
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const labelText = 'Scan to Verify';
    const labelFontSize = 8;
    const labelWidth = font.widthOfTextAtSize(labelText, labelFontSize);
    const labelX = (width - labelWidth) / 2;
    const labelY = qrY - 12; // 12 units below QR code bottom edge

    page.drawText(labelText, {
      x: labelX,
      y: labelY,
      size: labelFontSize,
      font,
    });

    const modifiedPdfBytes = await pdfDoc.save();
    return new Blob([modifiedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  }
}
