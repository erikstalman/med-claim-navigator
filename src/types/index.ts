
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'system-admin';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  specialization?: string; // for doctors
  licenseNumber?: string; // for doctors
  password?: string; // for demo purposes
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  caseId?: string;
  caseName?: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
}

export interface ChatMessage {
  id: string;
  caseId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'doctor' | 'system-admin';
  message: string;
  timestamp: string;
  isRead: boolean;
  recipientRole?: 'admin' | 'doctor' | 'system-admin';
}

export interface PatientCase {
  id: string;
  patientName: string;
  accidentDate: string;
  submissionDate: string;
  status: string;
  priority: string;
  injuryType: string;
  doctorAssigned: string;
  doctorId: string;
  adminAssigned: string;
  adminId: string;
  claimAmount: string;
  documentsCount: number;
  evaluationStatus: string;
  patientAge?: number;
  patientGender?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  description?: string;
  lastUpdated: string;
  createdBy: string;
  insurancePolicy?: string;
  accidentLocation?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  uploadedBy: string;
  uploadedById: string;
  size: string;
  pages: number;
  category: string;
  caseId: string;
  filePath: string;
  fileUrl?: string; // optional file URL for viewing/downloading the original document
  previewImageUrl?: string; // optional preview image (e.g. rendered PDF page or image thumbnail)
  content?: string; // extracted text for AI processing
}

export interface AIRule {
  id: string;
  title: string;
  content: string;
  category: string;
  isActive: boolean;
  createdBy: string;
  updatedAt: string;
}
