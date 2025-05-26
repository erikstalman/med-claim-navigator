
import { User, ActivityLog, PatientCase } from '../types';

class AuthService {
  private currentUser: User | null = null;
  private users: User[] = [
    {
      id: '1',
      email: 'admin@insurance.com',
      name: 'John Administrator',
      role: 'admin',
      createdAt: '2024-01-01',
      isActive: true,
      password: 'password'
    },
    {
      id: '2',
      email: 'sysadmin@insurance.com',
      name: 'System Administrator',
      role: 'system-admin',
      createdAt: '2024-01-01',
      isActive: true,
      password: 'password'
    }
  ];

  private activityLogs: ActivityLog[] = [];
  private cases: PatientCase[] = [];

  login(email: string, password: string): User | null {
    const user = this.users.find(u => u.email === email && u.password === password && u.isActive);
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
    return this.users;
  }

  getDoctors(): User[] {
    return this.users.filter(u => u.role === 'doctor' && u.isActive);
  }

  getAdmins(): User[] {
    return this.users.filter(u => u.role === 'admin' && u.isActive);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'> & { password: string }): User {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    
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
    const index = this.users.findIndex(u => u.id === userData.id);
    if (index !== -1) {
      this.users[index] = userData;
    }
  }

  deactivateUser(userId: string): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.isActive = false;
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
    return this.cases;
  }

  getCasesForDoctor(doctorId: string): PatientCase[] {
    return this.cases.filter(case_ => case_.doctorId === doctorId);
  }

  addCase(case_: PatientCase): void {
    this.cases.push(case_);
  }

  updateCase(updatedCase: PatientCase): void {
    const index = this.cases.findIndex(case_ => case_.id === updatedCase.id);
    if (index !== -1) {
      this.cases[index] = updatedCase;
    }
  }

  deleteCase(caseId: string): void {
    this.cases = this.cases.filter(case_ => case_.id !== caseId);
  }

  assignCaseToDoctor(caseId: string, doctorId: string): void {
    const case_ = this.cases.find(c => c.id === caseId);
    const doctor = this.users.find(u => u.id === doctorId && u.role === 'doctor');
    
    if (case_ && doctor) {
      case_.doctorId = doctor.id;
      case_.doctorAssigned = doctor.name;
      case_.lastUpdated = new Date().toISOString();
      
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
      ipAddress: '127.0.0.1' // In real app, get actual IP
    };
    this.activityLogs.push(log);
  }

  getActivityLogs(): ActivityLog[] {
    return this.activityLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getUserActivityLogs(userId: string): ActivityLog[] {
    return this.activityLogs.filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const authService = new AuthService();
