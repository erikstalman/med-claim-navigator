
import { User, ActivityLog, PatientCase } from '../types';
import { dataService } from './dataService';

class AuthService {
  private currentUser: User | null = null;

  login(email: string, password: string): User | null {
    const users = dataService.getUsers();
    const user = users.find(u => u.email === email && u.password === password && u.isActive);
    if (user) {
      this.currentUser = { ...user, lastLogin: new Date().toISOString() };
      this.logActivity(user.id, user.name, user.role, 'LOGIN', undefined, undefined, 'User logged in');
      this.updateUser(this.currentUser);
      return this.currentUser;
    }
    return null;
  }

  logout(): void {
    if (this.currentUser) {
      this.logActivity(this.currentUser.id, this.currentUser.name, this.currentUser.role, 'LOGOUT', undefined, undefined, 'User logged out');
      this.currentUser = null;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getAllUsers(): User[] {
    return dataService.getUsers();
  }

  getDoctors(): User[] {
    return dataService.getUsers().filter(u => u.role === 'doctor' && u.isActive);
  }

  getAdmins(): User[] {
    return dataService.getUsers().filter(u => u.role === 'admin' && u.isActive);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'> & { password: string }): User {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    dataService.addUser(newUser);
    
    if (this.currentUser) {
      this.logActivity(
        this.currentUser.id, 
        this.currentUser.name, 
        this.currentUser.role, 
        'CREATE_USER', 
        undefined, 
        undefined, 
        `Created new user: ${newUser.name} (${newUser.role}) with email: ${newUser.email}`
      );
    }
    
    return newUser;
  }

  updateUser(userData: User): void {
    dataService.updateUser(userData);
  }

  deactivateUser(userId: string): void {
    const users = dataService.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.isActive = false;
      dataService.updateUser(user);
      if (this.currentUser) {
        this.logActivity(
          this.currentUser.id, 
          this.currentUser.name, 
          this.currentUser.role, 
          'DEACTIVATE_USER', 
          undefined, 
          undefined, 
          `Deactivated user: ${user.name}`
        );
      }
    }
  }

  // Case management methods
  getAllCases(): PatientCase[] {
    return dataService.getCases();
  }

  getCasesForDoctor(doctorId: string): PatientCase[] {
    return dataService.getCases().filter(case_ => case_.doctorId === doctorId);
  }

  addCase(case_: PatientCase): void {
    dataService.addCase(case_);
  }

  updateCase(updatedCase: PatientCase): void {
    dataService.updateCase(updatedCase);
  }

  deleteCase(caseId: string): void {
    dataService.deleteCase(caseId);
  }

  assignCaseToDoctor(caseId: string, doctorId: string): void {
    const cases = dataService.getCases();
    const users = dataService.getUsers();
    const case_ = cases.find(c => c.id === caseId);
    const doctor = users.find(u => u.id === doctorId && u.role === 'doctor');
    
    if (case_ && doctor) {
      case_.doctorId = doctor.id;
      case_.doctorAssigned = doctor.name;
      case_.lastUpdated = new Date().toISOString();
      dataService.updateCase(case_);
      
      if (this.currentUser) {
        this.logActivity(
          this.currentUser.id,
          this.currentUser.name,
          this.currentUser.role,
          'ASSIGN_CASE',
          caseId,
          case_.patientName,
          `Assigned case to doctor: ${doctor.name}`
        );
      }
    }
  }

  logActivity(userId: string, userName: string, userRole: string, action: string, caseId?: string, caseName?: string, details?: string): void {
    const log: ActivityLog = {
      id: Date.now().toString(),
      userId,
      userName,
      userRole,
      action,
      caseId,
      caseName,
      timestamp: new Date().toISOString(),
      details: details || '',
      ipAddress: '127.0.0.1'
    };
    dataService.addActivityLog(log);
  }

  getActivityLogs(): ActivityLog[] {
    return dataService.getActivityLogs().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getUserActivityLogs(userId: string): ActivityLog[] {
    return dataService.getActivityLogs()
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const authService = new AuthService();
