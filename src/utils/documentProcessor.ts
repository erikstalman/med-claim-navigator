
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ProcessedDocument {
  content: string;
  pageCount: number;
  textContent?: string;
  imageDataUrl?: string;
}

export class DocumentProcessor {
  static async processPDF(file: File): Promise<ProcessedDocument> {
    try {
      console.log('Processing PDF:', file.name, 'Size:', file.size);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      let fullText = '';
      const pageCount = pdf.numPages;
      console.log('PDF has', pageCount, 'pages');
      
      // Extract text from all pages
      for (let i = 1; i <= Math.min(pageCount, 10); i++) { // Limit to first 10 pages for performance
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }
      
      // Generate preview image from first page
      let imageDataUrl = '';
      try {
        const firstPage = await pdf.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          await firstPage.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          imageDataUrl = canvas.toDataURL();
          console.log('Generated PDF preview image');
        }
      } catch (renderError) {
        console.warn('Could not generate PDF preview image:', renderError);
      }
      
      return {
        content: fullText.trim() || 'PDF content could not be extracted',
        pageCount,
        textContent: fullText.trim(),
        imageDataUrl
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF document: ' + (error as Error).message);
    }
  }
  
  static async processDocx(file: File): Promise<ProcessedDocument> {
    try {
      console.log('Processing DOCX:', file.name);
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      return {
        content: result.value || 'DOCX content could not be extracted',
        pageCount: 1, // DOCX doesn't have fixed pages
        textContent: result.value
      };
    } catch (error) {
      console.error('Error processing DOCX:', error);
      throw new Error('Failed to process DOCX document: ' + (error as Error).message);
    }
  }
  
  static async processDocument(file: File): Promise<ProcessedDocument> {
    // Add null/undefined checks for file.type and file.name
    const fileType = (file.type || '').toLowerCase();
    const fileName = (file.name || '').toLowerCase();
    
    console.log('Processing document:', fileName, 'Type:', fileType);
    
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      return this.processPDF(file);
    } else if (fileType.includes('word') || fileType.includes('document') || 
               fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return this.processDocx(file);
    } else {
      // For other file types, just return basic info
      return {
        content: `Document: ${file.name || 'Unknown'}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type || 'Unknown'}\n\nThis document type is supported for storage but preview may be limited.`,
        pageCount: 1
      };
    }
  }
}
