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
   * Downloads the certificate file from IPFS, fetches the QR code,
   * embeds the QR code, and returns the result as a downloadable Blob.
   * Supports both PDF and image (PNG/JPEG) uploads.
   */
  getCertificateWithQrCode(certificateId: string | number, ipfsCid: string): Observable<Blob> {
    return forkJoin({
      file: this.ipfsService.downloadFromIPFS(ipfsCid),
      qr: this.certificateService.generateQrCode(certificateId)
    }).pipe(
      switchMap(({ file, qr }) => from(this.embedQrCode(file, qr)))
    );
  }

  /**
   * Detects file type and delegates to the appropriate handler.
   */
  private async embedQrCode(fileBlob: Blob, qrBlob: Blob): Promise<Blob> {
    const fileBytes = new Uint8Array(await fileBlob.arrayBuffer());

    // Detect file type from magic bytes
    const isPdf = fileBytes[0] === 0x25 && fileBytes[1] === 0x50 &&
                  fileBytes[2] === 0x44 && fileBytes[3] === 0x46; // %PDF
    
    if (isPdf) {
      return this.embedQrCodeInPdf(fileBlob, qrBlob);
    } else {
      return this.embedQrCodeInImage(fileBlob, qrBlob);
    }
  }

  /**
   * For image files (PNG/JPEG): wraps the image in a new PDF page with QR code.
   */
  private async embedQrCodeInImage(imageBlob: Blob, qrBlob: Blob): Promise<Blob> {
    const imageBytes = await imageBlob.arrayBuffer();
    const imageUint8 = new Uint8Array(imageBytes);
    const qrBytes = await qrBlob.arrayBuffer();
    const qrUint8 = new Uint8Array(qrBytes);

    const pdfDoc = await PDFDocument.create();

    // Embed the certificate image
    const isPng = imageUint8[0] === 0x89 && imageUint8[1] === 0x50;
    const certImage = isPng
      ? await pdfDoc.embedPng(imageBytes)
      : await pdfDoc.embedJpg(imageBytes);

    // Create a page sized to the image (scale to A4 width if needed)
    const maxWidth = 595; // A4 width in points
    const scale = Math.min(1, maxWidth / certImage.width);
    const pageWidth = certImage.width * scale;
    const pageHeight = certImage.height * scale;

    // Add extra space at bottom for QR code
    const qrSize = 80;
    const qrMargin = 50;
    const totalHeight = pageHeight + qrSize + qrMargin;

    const page = pdfDoc.addPage([pageWidth, totalHeight]);

    // Draw certificate image at the top
    page.drawImage(certImage, {
      x: 0,
      y: qrSize + qrMargin,
      width: pageWidth,
      height: pageHeight,
    });

    // Embed QR code
    const isQrPng = qrUint8[0] === 0x89 && qrUint8[1] === 0x50;
    const qrImage = isQrPng
      ? await pdfDoc.embedPng(qrBytes)
      : await pdfDoc.embedJpg(qrBytes);

    const qrX = (pageWidth - qrSize) / 2;
    const qrY = 20;

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    // Draw "Scan to Verify" label
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const labelText = 'Scan to Verify';
    const labelFontSize = 8;
    const labelWidth = font.widthOfTextAtSize(labelText, labelFontSize);
    page.drawText(labelText, {
      x: (pageWidth - labelWidth) / 2,
      y: qrY - 12,
      size: labelFontSize,
      font,
    });

    const modifiedPdfBytes = await pdfDoc.save();
    return new Blob([modifiedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  }

  /**
   * For PDF files: embeds QR code into the existing PDF.
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
