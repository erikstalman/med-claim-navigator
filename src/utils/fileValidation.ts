
import { toast } from "sonner";

export const validateFiles = (fileList: File[]) => {
  const validTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.tiff'];
  const validFiles = fileList.filter(file => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = validTypes.includes(fileExtension);
    const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
    
    if (!isValidType) {
      toast.error(`${file.name}: Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG, TIFF`);
      return false;
    }
    
    if (!isValidSize) {
      toast.error(`${file.name}: File too large. Maximum size: 10MB`);
      return false;
    }
    
    return true;
  });

  return validFiles;
};
