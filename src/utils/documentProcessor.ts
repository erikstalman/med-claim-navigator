
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
    // Always use the file name for detection as it's more reliable
    const fileName = (file.name || 'unknown-file').toLowerCase();
    
    console.log('Detecting file type for:', fileName, 'MIME type:', file.type);
    
    // Use file extension as primary detection method
    if (fileName.endsWith('.pdf')) {
      return 'application/pdf';
    } else if (fileName.endsWith('.docx')) {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (fileName.endsWith('.doc')) {
      return 'application/msword';
    } else if (fileName.match(/\.(jpg|jpeg)$/i)) {
      return 'image/jpeg';
    } else if (fileName.endsWith('.png')) {
      return 'image/png';
    } else if (fileName.endsWith('.gif')) {
      return 'image/gif';
    } else if (fileName.endsWith('.bmp')) {
      return 'image/bmp';
    } else if (fileName.endsWith('.webp')) {
      return 'image/webp';
    } else if (fileName.endsWith('.txt')) {
      return 'text/plain';
    } else if (fileName.endsWith('.rtf')) {
      return 'application/rtf';
    } else if (fileName.endsWith('.csv')) {
      return 'text/csv';
    } else if (fileName.endsWith('.xml')) {
      return 'application/xml';
    } else if (fileName.endsWith('.json')) {
      return 'application/json';
    }
    
    // Fallback to MIME type if extension detection fails
    if (file.type && file.type !== 'application/octet-stream') {
      return file.type;
    }
    
    return 'application/octet-stream';
  }

  static async processPDF(file: File): Promise<ProcessedDocument> {
    try {
      console.log('Processing PDF:', file.name, 'Size:', file.size);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      let fullText = '';
      const pageCount = pdf.numPages;
      console.log('PDF has', pageCount, 'pages');
      
      // Extract text from first few pages for performance
      const pagesToProcess = Math.min(pageCount, 5);
      for (let i = 1; i <= pagesToProcess; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n\n';
        } catch (pageError) {
          console.warn(`Could not extract text from page ${i}:`, pageError);
        }
      }
      
      // Generate preview image from first page
      let imageDataUrl = '';
      try {
        const firstPage = await pdf.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1.2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          await firstPage.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          imageDataUrl = canvas.toDataURL('image/png', 0.8);
          console.log('Generated PDF preview image');
        }
      } catch (renderError) {
        console.warn('Could not generate PDF preview image:', renderError);
      }
      
      return {
        content: fullText.trim() || `PDF Document with ${pageCount} pages. Text extraction may not be available for image-based or scanned PDFs.`,
        pageCount,
        textContent: fullText.trim(),
        imageDataUrl,
        detectedType: 'application/pdf'
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      return {
        content: `PDF Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nThis PDF could not be processed for preview. It may be password-protected, corrupted, or in an unsupported format.`,
        pageCount: 1,
        detectedType: 'application/pdf'
      };
    }
  }
  
  static async processDocx(file: File): Promise<ProcessedDocument> {
    try {
      console.log('Processing DOCX:', file.name);
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      return {
        content: result.value || `DOCX Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nContent could not be extracted.`,
        pageCount: 1,
        textContent: result.value,
        detectedType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
    } catch (error) {
      console.error('Error processing DOCX:', error);
      return {
        content: `DOCX Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nThis document could not be processed for preview.`,
        pageCount: 1,
        detectedType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
    }
  }

  static async processImage(file: File): Promise<ProcessedDocument> {
    try {
      console.log('Processing Image:', file.name);
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageDataUrl = e.target?.result as string;
          resolve({
            content: `Image: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type}\nDimensions: Available in preview`,
            pageCount: 1,
            imageDataUrl,
            detectedType: file.type || 'image/unknown'
          });
        };
        reader.onerror = () => {
          resolve({
            content: `Image: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type}\nPreview could not be generated.`,
            pageCount: 1,
            detectedType: file.type || 'image/unknown'
          });
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error processing Image:', error);
      return {
        content: `Image: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nThis image could not be processed for preview.`,
        pageCount: 1,
        detectedType: file.type || 'image/unknown'
      };
    }
  }

  static async processTextFile(file: File): Promise<ProcessedDocument> {
    try {
      console.log('Processing Text file:', file.name);
      const text = await file.text();
      
      return {
        content: text || `Text file: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nThis text file appears to be empty.`,
        pageCount: 1,
        textContent: text,
        detectedType: 'text/plain'
      };
    } catch (error) {
      console.error('Error processing text file:', error);
      return {
        content: `Text file: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nThis text file could not be read.`,
        pageCount: 1,
        detectedType: 'text/plain'
      };
    }
  }

  static async processGenericFile(file: File): Promise<ProcessedDocument> {
    try {
      // Try to read as text first
      const text = await file.text();
      if (text && text.trim().length > 0) {
        return {
          content: text,
          pageCount: 1,
          textContent: text,
          detectedType: file.type || 'text/plain'
        };
      }
    } catch (error) {
      console.log('File is not text-readable, treating as binary');
    }

    // For binary files or files that can't be read as text
    return {
      content: `Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type || 'Unknown'}\n\nThis document has been uploaded successfully and is available for download.\n\nFile details:\n- Format: ${file.type || 'Unknown'}\n- Last modified: ${file.lastModified ? new Date(file.lastModified).toLocaleDateString() : 'Unknown'}`,
      pageCount: 1,
      detectedType: file.type || 'application/octet-stream'
    };
  }
  
  static async processDocument(file: File): Promise<ProcessedDocument> {
    // Validate file - ensure we have the essential properties
    if (!file) {
      throw new Error('No file provided');
    }
    
    if (!file.name) {
      throw new Error('File has no name');
    }
    
    if (file.size === 0) {
      throw new Error('File is empty');
    }

    const fileName = file.name;
    const fileSize = file.size;
    
    console.log('Processing document:', {
      name: fileName,
      size: fileSize,
      type: file.type,
      lastModified: file.lastModified
    });
    
    // Detect the actual file type
    const detectedType = this.detectFileType(file);
    
    console.log('Detected file type:', detectedType);
    
    try {
      if (detectedType === 'application/pdf') {
        return await this.processPDF(file);
      } else if (detectedType.includes('wordprocessingml') || detectedType.includes('msword')) {
        return await this.processDocx(file);
      } else if (detectedType.startsWith('image/')) {
        return await this.processImage(file);
      } else if (detectedType.startsWith('text/') || detectedType === 'application/json' || detectedType === 'application/xml') {
        return await this.processTextFile(file);
      } else {
        return await this.processGenericFile(file);
      }
    } catch (error) {
      console.error('Error processing document:', error);
      // Return a basic document info even if processing fails
      return {
        content: `Document: ${fileName}\nSize: ${(fileSize / 1024).toFixed(2)} KB\nType: ${detectedType}\n\nThis document could not be processed for preview but has been uploaded successfully.\n\nError details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        pageCount: 1,
        detectedType
      };
    }
  }
}
