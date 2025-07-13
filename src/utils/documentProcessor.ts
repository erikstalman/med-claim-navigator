
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ProcessedDocument {
  content: string;
  pageCount: number;
  textContent?: string;
  imageDataUrl?: string;
  detectedType?: string;
}

export class DocumentProcessor {
  static detectFileType(file: File): string {
    // Ensure we have a valid file name
    const fileName = (file.name || 'unknown-file').toLowerCase();
    
    if (fileName.endsWith('.pdf')) {
      return 'application/pdf';
    } else if (fileName.endsWith('.docx')) {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (fileName.endsWith('.doc')) {
      return 'application/msword';
    } else if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
      return 'image/' + fileName.split('.').pop();
    } else if (fileName.endsWith('.txt')) {
      return 'text/plain';
    }
    
    // Fallback to file.type if available
    return file.type || 'application/octet-stream';
  }

  static async processPDF(file: File): Promise<ProcessedDocument> {
    try {
      const fileName = file.name || 'unknown.pdf';
      console.log('Processing PDF:', fileName, 'Size:', file.size);
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
        imageDataUrl,
        detectedType: 'application/pdf'
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF document: ' + (error as Error).message);
    }
  }
  
  static async processDocx(file: File): Promise<ProcessedDocument> {
    try {
      const fileName = file.name || 'unknown.docx';
      console.log('Processing DOCX:', fileName);
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      return {
        content: result.value || 'DOCX content could not be extracted',
        pageCount: 1, // DOCX doesn't have fixed pages
        textContent: result.value,
        detectedType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
    } catch (error) {
      console.error('Error processing DOCX:', error);
      throw new Error('Failed to process DOCX document: ' + (error as Error).message);
    }
  }

  static async processImage(file: File): Promise<ProcessedDocument> {
    try {
      const fileName = file.name || 'unknown-image';
      console.log('Processing Image:', fileName);
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageDataUrl = e.target?.result as string;
          resolve({
            content: `Image: ${fileName}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type}`,
            pageCount: 1,
            imageDataUrl,
            detectedType: file.type || 'image/unknown'
          });
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error processing Image:', error);
      throw new Error('Failed to process image: ' + (error as Error).message);
    }
  }

  static async processTextFile(file: File): Promise<ProcessedDocument> {
    try {
      const fileName = file.name || 'unknown.txt';
      console.log('Processing Text file:', fileName);
      const text = await file.text();
      
      return {
        content: text || 'Text file is empty',
        pageCount: 1,
        textContent: text,
        detectedType: 'text/plain'
      };
    } catch (error) {
      console.error('Error processing text file:', error);
      throw new Error('Failed to process text file: ' + (error as Error).message);
    }
  }
  
  static async processDocument(file: File): Promise<ProcessedDocument> {
    // Ensure we always have a valid file name
    const safeFileName = file.name || 'unknown-document';
    
    // Detect the actual file type
    const detectedType = this.detectFileType(file);
    const fileName = safeFileName.toLowerCase();
    
    console.log('Processing document:', fileName, 'Detected Type:', detectedType);
    
    if (detectedType.includes('pdf') || fileName.endsWith('.pdf')) {
      return this.processPDF(file);
    } else if (detectedType.includes('word') || detectedType.includes('document') || 
               fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return this.processDocx(file);
    } else if (detectedType.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
      return this.processImage(file);
    } else if (detectedType.includes('text') || fileName.endsWith('.txt')) {
      return this.processTextFile(file);
    } else {
      // For other file types, return basic info with safe file name
      return {
        content: `Document: ${safeFileName}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${detectedType}\n\nThis document has been uploaded and is available for download.`,
        pageCount: 1,
        detectedType
      };
    }
  }
}
