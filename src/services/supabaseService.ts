
import { supabase } from '@/integrations/supabase/client';
import { User, PatientCase, Document, ChatMessage, ActivityLog, AIRule } from '@/types';

export class SupabaseService {
  // Authentication
  async signUp(email: string, password: string, userData: { name: string; role: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async getCurrentProfile() {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  // Users/Profiles
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(profile => ({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as 'admin' | 'doctor' | 'system-admin',
      createdAt: profile.created_at,
      lastLogin: profile.last_login,
      isActive: profile.is_active,
      specialization: profile.specialization,
      licenseNumber: profile.license_number
    }));
  }

  async updateProfile(userId: string, updates: Partial<User>) {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        role: updates.role,
        is_active: updates.isActive,
        specialization: updates.specialization,
        license_number: updates.licenseNumber,
        last_login: updates.lastLogin
      })
      .eq('id', userId);

    if (error) throw error;
  }

  // Cases
  async getCases(): Promise<PatientCase[]> {
    const { data, error } = await supabase
      .from('patient_cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(case_ => ({
      id: case_.id,
      patientName: case_.patient_name,
      patientAge: case_.patient_age,
      patientGender: case_.patient_gender,
      contactNumber: case_.contact_number,
      email: case_.email,
      address: case_.address,
      accidentDate: case_.accident_date,
      accidentLocation: case_.accident_location,
      submissionDate: case_.submission_date,
      status: case_.status,
      priority: case_.priority,
      injuryType: case_.injury_type,
      description: case_.description,
      doctorId: case_.doctor_id,
      doctorAssigned: case_.doctor_assigned,
      adminId: case_.admin_id,
      adminAssigned: case_.admin_assigned,
      claimAmount: case_.claim_amount,
      insurancePolicy: case_.insurance_policy,
      evaluationStatus: case_.evaluation_status,
      createdBy: case_.created_by,
      lastUpdated: case_.last_updated,
      documentsCount: 0 // Will be calculated separately
    }));
  }

  async createCase(case_: Omit<PatientCase, 'lastUpdated'>) {
    const { error } = await supabase
      .from('patient_cases')
      .insert({
        id: case_.id,
        patient_name: case_.patientName,
        patient_age: case_.patientAge,
        patient_gender: case_.patientGender,
        contact_number: case_.contactNumber,
        email: case_.email,
        address: case_.address,
        accident_date: case_.accidentDate,
        accident_location: case_.accidentLocation,
        submission_date: case_.submissionDate,
        status: case_.status,
        priority: case_.priority,
        injury_type: case_.injuryType,
        description: case_.description,
        doctor_id: case_.doctorId,
        doctor_assigned: case_.doctorAssigned,
        admin_id: case_.adminId,
        admin_assigned: case_.adminAssigned,
        claim_amount: case_.claimAmount,
        insurance_policy: case_.insurancePolicy,
        evaluation_status: case_.evaluationStatus,
        created_by: case_.createdBy
      });

    if (error) throw error;
  }

  async updateCase(case_: PatientCase) {
    const { error } = await supabase
      .from('patient_cases')
      .update({
        patient_name: case_.patientName,
        patient_age: case_.patientAge,
        patient_gender: case_.patientGender,
        contact_number: case_.contactNumber,
        email: case_.email,
        address: case_.address,
        accident_date: case_.accidentDate,
        accident_location: case_.accidentLocation,
        submission_date: case_.submissionDate,
        status: case_.status,
        priority: case_.priority,
        injury_type: case_.injuryType,
        description: case_.description,
        doctor_id: case_.doctorId,
        doctor_assigned: case_.doctorAssigned,
        admin_id: case_.adminId,
        admin_assigned: case_.adminAssigned,
        claim_amount: case_.claimAmount,
        insurance_policy: case_.insurancePolicy,
        evaluation_status: case_.evaluationStatus
      })
      .eq('id', case_.id);

    if (error) throw error;
  }

  async deleteCase(caseId: string) {
    const { error } = await supabase
      .from('patient_cases')
      .delete()
      .eq('id', caseId);

    if (error) throw error;
  }

  // Documents
  async getDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      category: doc.category,
      caseId: doc.case_id,
      filePath: doc.file_path || '',
      size: doc.size_mb ? `${doc.size_mb} MB` : '0 MB',
      pages: doc.pages || 0,
      content: doc.content,
      uploadedBy: doc.uploaded_by_name || '',
      uploadedById: doc.uploaded_by || '',
      uploadDate: doc.upload_date
    }));
  }

  async uploadDocument(file: File, caseId: string, category: string, description?: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const profile = await this.getCurrentProfile();
    const fileName = `${user.id}/${caseId}/${Date.now()}-${file.name}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Extract text content for AI analysis (simplified)
    let content = '';
    if (file.type === 'text/plain') {
      content = await file.text();
    }

    // Create document record
    const documentData = {
      id: `DOC-${Date.now()}`,
      name: file.name,
      type: file.type,
      category: category,
      case_id: caseId,
      file_path: uploadData.path,
      file_url: publicUrl,
      size_mb: Number((file.size / 1024 / 1024).toFixed(2)),
      pages: 1, // Would need PDF parsing for accurate count
      content: content,
      uploaded_by: user.id,
      uploaded_by_name: profile?.name || user.email
    };

    const { error } = await supabase
      .from('documents')
      .insert(documentData);

    if (error) throw error;

    return documentData;
  }

  async deleteDocument(documentId: string) {
    // Get document info first
    const { data: doc } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (doc?.file_path) {
      // Delete from storage
      await supabase.storage
        .from('documents')
        .remove([doc.file_path]);
    }

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  }

  // AI Integration
  async analyzeDocument(documentContent: string, documentType: string, caseContext: string) {
    const { data, error } = await supabase.functions.invoke('analyze-document', {
      body: { documentContent, documentType, caseContext }
    });

    if (error) throw error;
    return data;
  }

  async getFormSuggestions(caseData: any, documentAnalysis: string, formType: string) {
    const { data, error } = await supabase.functions.invoke('ai-form-suggestions', {
      body: { caseData, documentAnalysis, formType }
    });

    if (error) throw error;
    return data;
  }

  // Activity Logs
  async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        id: `LOG-${Date.now()}`,
        user_id: activity.userId,
        user_name: activity.userName,
        user_role: activity.userRole,
        action: activity.action,
        case_id: activity.caseId,
        case_name: activity.caseName,
        details: activity.details,
        ip_address: activity.ipAddress
      });

    if (error) throw error;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    return data.map(log => ({
      id: log.id,
      userId: log.user_id,
      userName: log.user_name,
      userRole: log.user_role,
      action: log.action,
      caseId: log.case_id,
      caseName: log.case_name,
      details: log.details,
      ipAddress: log.ip_address,
      timestamp: log.timestamp
    }));
  }

  // Chat Messages
  async getChatMessages(caseId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('case_id', caseId)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    return data.map(msg => ({
      id: msg.id,
      caseId: msg.case_id,
      senderId: msg.sender_id,
      senderName: msg.sender_name,
      senderRole: msg.sender_role,
      recipientRole: msg.recipient_role,
      message: msg.message,
      timestamp: msg.timestamp,
      isRead: msg.is_read
    }));
  }

  async sendChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>) {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        id: `MSG-${Date.now()}`,
        case_id: message.caseId,
        sender_id: message.senderId,
        sender_name: message.senderName,
        sender_role: message.senderRole,
        recipient_role: message.recipientRole,
        message: message.message
      });

    if (error) throw error;
  }
}

export const supabaseService = new SupabaseService();
