
import { User, ActivityLog, PatientCase, ChatMessage, Document, AIRule } from '../types';

interface AppData {
  users: User[];
  activityLogs: ActivityLog[];
  cases: PatientCase[];
  chatMessages: ChatMessage[];
  documents: Document[];
  aiRules: AIRule[];
  version: string;
  lastBackup: string;
}

class DataService {
  private readonly STORAGE_KEY = 'claims_platform_data';
  private readonly BACKUP_KEY = 'claims_platform_backup';
  private readonly VERSION = '1.0.0';
  
  private data: AppData;

  constructor() {
    this.data = this.loadData();
    this.setupAutoBackup();
    this.setupBeforeUnloadBackup();
  }

  private getDefaultData(): AppData {
    return {
      users: [
        {
          id: '1',
          email: 'admin@insurance.com',
          name: 'John Administrator',
          role: 'admin',
          createdAt: '2024-01-01',
          isActive: true,
          password: 'admin123'
        },
        {
          id: '2',
          email: 'sysadmin@insurance.com',
          name: 'System Administrator',
          role: 'system-admin',
          createdAt: '2024-01-01',
          isActive: true,
          password: 'sysadmin123'
        },
        {
          id: '3',
          email: 'doctor@healthcare.com',
          name: 'Dr. Sarah Johnson',
          role: 'doctor',
          createdAt: '2024-01-01',
          isActive: true,
          password: 'doctor123',
          specialization: 'Orthopedics',
          licenseNumber: 'MD12345'
        }
      ],
      activityLogs: [],
      cases: [
        {
          id: 'CASE001',
          patientName: 'John Smith',
          accidentDate: '2024-01-15',
          submissionDate: '2024-01-20',
          status: 'pending-evaluation',
          priority: 'high',
          injuryType: 'Back injury',
          doctorAssigned: 'Dr. Sarah Johnson',
          doctorId: '3',
          adminAssigned: 'John Administrator',
          adminId: '1',
          claimAmount: '$15,000',
          documentsCount: 3,
          evaluationStatus: 'Pending medical review',
          patientAge: 45,
          patientGender: 'Male',
          contactNumber: '+1-555-0123',
          email: 'john.smith@email.com',
          address: '123 Main St, City, State 12345',
          description: 'Workplace accident resulting in lower back injury',
          lastUpdated: '2024-01-20',
          createdBy: '1'
        },
        {
          id: 'CASE002',
          patientName: 'Maria Garcia',
          accidentDate: '2024-01-10',
          submissionDate: '2024-01-18',
          status: 'under-review',
          priority: 'medium',
          injuryType: 'Knee injury',
          doctorAssigned: 'Dr. Sarah Johnson',
          doctorId: '3',
          adminAssigned: 'John Administrator',
          adminId: '1',
          claimAmount: '$8,500',
          documentsCount: 2,
          evaluationStatus: 'Under medical evaluation',
          patientAge: 32,
          patientGender: 'Female',
          contactNumber: '+1-555-0456',
          email: 'maria.garcia@email.com',
          address: '456 Oak Ave, City, State 12345',
          description: 'Sports-related knee injury requiring surgery',
          lastUpdated: '2024-01-22',
          createdBy: '1'
        }
      ],
      chatMessages: [],
      documents: [],
      aiRules: [],
      version: this.VERSION,
      lastBackup: new Date().toISOString()
    };
  }

  private loadData(): AppData {
    try {
      // Try to load from primary storage
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppData;
        if (this.validateData(parsed)) {
          console.log('Data loaded successfully from primary storage');
          // Merge with defaults to ensure we have all required users
          return this.mergeWithDefaults(parsed);
        }
      }

      // Try to load from backup
      const backup = localStorage.getItem(this.BACKUP_KEY);
      if (backup) {
        const parsed = JSON.parse(backup) as AppData;
        if (this.validateData(parsed)) {
          console.log('Data restored from backup storage');
          const mergedData = this.mergeWithDefaults(parsed);
          this.saveData(mergedData); // Restore to primary storage
          return mergedData;
        }
      }

      console.log('No valid data found, initializing with defaults');
      const defaultData = this.getDefaultData();
      this.saveData(defaultData);
      return defaultData;
    } catch (error) {
      console.error('Error loading data:', error);
      const defaultData = this.getDefaultData();
      this.saveData(defaultData);
      return defaultData;
    }
  }

  private mergeWithDefaults(existingData: AppData): AppData {
    const defaults = this.getDefaultData();
    
    // Ensure default users exist
    const mergedUsers = [...existingData.users];
    defaults.users.forEach(defaultUser => {
      if (!mergedUsers.find(u => u.id === defaultUser.id)) {
        mergedUsers.push(defaultUser);
      }
    });

    return {
      ...existingData,
      users: mergedUsers,
      version: this.VERSION
    };
  }

  private validateData(data: any): data is AppData {
    return data &&
           typeof data === 'object' &&
           Array.isArray(data.users) &&
           Array.isArray(data.activityLogs) &&
           Array.isArray(data.cases) &&
           Array.isArray(data.chatMessages) &&
           Array.isArray(data.documents) &&
           Array.isArray(data.aiRules) &&
           typeof data.version === 'string';
  }

  private saveData(data?: AppData): void {
    try {
      const dataToSave = data || this.data;
      dataToSave.lastBackup = new Date().toISOString();
      
      const serialized = JSON.stringify(dataToSave);
      
      // Save to primary storage
      localStorage.setItem(this.STORAGE_KEY, serialized);
      
      // Save to backup storage
      localStorage.setItem(this.BACKUP_KEY, serialized);
      
      console.log('Data saved successfully at', dataToSave.lastBackup);
    } catch (error) {
      console.error('Error saving data:', error);
      // Try to clear some space and retry
      this.cleanupOldData();
      try {
        const serialized = JSON.stringify(data || this.data);
        localStorage.setItem(this.STORAGE_KEY, serialized);
      } catch (retryError) {
        console.error('Failed to save data even after cleanup:', retryError);
      }
    }
  }

  private cleanupOldData(): void {
    // Remove old activity logs (keep last 1000)
    if (this.data.activityLogs.length > 1000) {
      this.data.activityLogs = this.data.activityLogs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 1000);
    }

    // Remove old chat messages (keep last 5000)
    if (this.data.chatMessages.length > 5000) {
      this.data.chatMessages = this.data.chatMessages
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5000);
    }
  }

  private setupAutoBackup(): void {
    // Auto-save every 30 seconds
    setInterval(() => {
      this.saveData();
    }, 30000);
  }

  private setupBeforeUnloadBackup(): void {
    window.addEventListener('beforeunload', () => {
      this.saveData();
    });

    // Also save on visibility change (tab switch, etc.)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.saveData();
      }
    });
  }

  // User management
  getUsers(): User[] {
    return [...this.data.users];
  }

  addUser(user: User): void {
    this.data.users.push(user);
    this.saveData();
  }

  updateUser(user: User): void {
    const index = this.data.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.data.users[index] = user;
      this.saveData();
    }
  }

  deleteUser(userId: string): void {
    this.data.users = this.data.users.filter(u => u.id !== userId);
    this.saveData();
  }

  // Case management
  getCases(): PatientCase[] {
    return [...this.data.cases];
  }

  addCase(case_: PatientCase): void {
    this.data.cases.push(case_);
    this.saveData();
  }

  updateCase(case_: PatientCase): void {
    const index = this.data.cases.findIndex(c => c.id === case_.id);
    if (index !== -1) {
      this.data.cases[index] = case_;
      this.saveData();
    }
  }

  deleteCase(caseId: string): void {
    this.data.cases = this.data.cases.filter(c => c.id !== caseId);
    // Also remove related data
    this.data.chatMessages = this.data.chatMessages.filter(m => m.caseId !== caseId);
    this.data.documents = this.data.documents.filter(d => d.caseId !== caseId);
    this.saveData();
  }

  // Activity logs
  getActivityLogs(): ActivityLog[] {
    return [...this.data.activityLogs];
  }

  addActivityLog(log: ActivityLog): void {
    this.data.activityLogs.push(log);
    this.saveData();
  }

  // Chat messages
  getChatMessages(): ChatMessage[] {
    return [...this.data.chatMessages];
  }

  addChatMessage(message: ChatMessage): void {
    this.data.chatMessages.push(message);
    this.saveData();
  }

  updateChatMessage(message: ChatMessage): void {
    const index = this.data.chatMessages.findIndex(m => m.id === message.id);
    if (index !== -1) {
      this.data.chatMessages[index] = message;
      this.saveData();
    }
  }

  // Documents
  getDocuments(): Document[] {
    return [...this.data.documents];
  }

  addDocument(document: Document): void {
    this.data.documents.push(document);
    this.saveData();
  }

  updateDocument(document: Document): void {
    const index = this.data.documents.findIndex(d => d.id === document.id);
    if (index !== -1) {
      this.data.documents[index] = document;
      this.saveData();
    }
  }

  deleteDocument(documentId: string): void {
    this.data.documents = this.data.documents.filter(d => d.id !== documentId);
    this.saveData();
  }

  // AI Rules
  getAIRules(): AIRule[] {
    return [...this.data.aiRules];
  }

  addAIRule(rule: AIRule): void {
    this.data.aiRules.push(rule);
    this.saveData();
  }

  updateAIRule(rule: AIRule): void {
    const index = this.data.aiRules.findIndex(r => r.id === rule.id);
    if (index !== -1) {
      this.data.aiRules[index] = rule;
      this.saveData();
    }
  }

  deleteAIRule(ruleId: string): void {
    this.data.aiRules = this.data.aiRules.filter(r => r.id !== ruleId);
    this.saveData();
  }

  // Backup and recovery
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData) as AppData;
      if (this.validateData(imported)) {
        this.data = this.mergeWithDefaults(imported);
        this.saveData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  getDataStats() {
    return {
      users: this.data.users.length,
      cases: this.data.cases.length,
      activityLogs: this.data.activityLogs.length,
      chatMessages: this.data.chatMessages.length,
      documents: this.data.documents.length,
      aiRules: this.data.aiRules.length,
      lastBackup: this.data.lastBackup,
      version: this.data.version
    };
  }
}

export const dataService = new DataService();
