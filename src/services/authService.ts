import { User, ActivityLog, PatientCase } from '../types';
import { getDataService } from './dataService';

class AuthService {
  private currentUser: User | null = null;

  private getService() {
    const service = getDataService();
    if (!service) {
      console.warn('DataService is not available in the current environment.');
    }
    return service;
  }

  login(email: string, password: string): User | null {
    try {
      const dataService = this.getService();
      if (!dataService) {
        return null;
      }

      const users = dataService.getUsers();
      console.log('Attempting login with:', email, 'Available users:', users.map(u => ({ email: u.email, role: u.role, isActive: u.isActive })));
      
      const user = users.find(u => u.email === email && u.password === password && u.isActive);
      if (user) {
        this.currentUser = { ...user, lastLogin: new Date().toISOString() };
        this.logActivity(user.id, user.name, user.role, 'LOGIN', undefined, undefined, 'User logged in');
        this.updateUser(this.currentUser);
        console.log('Login successful for:', this.currentUser.name, this.currentUser.role);
        return this.currentUser;
      }
      console.log('Login failed - no matching user found');
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
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
    try {
      const dataService = this.getService();
      if (!dataService) {
        return [];
      }

      return dataService.getUsers();
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  getDoctors(): User[] {
    try {
      const dataService = this.getService();
      if (!dataService) {
        return [];
      }

      return dataService.getUsers().filter(u => u.role === 'doctor' && u.isActive);
    } catch (error) {
      console.error('Error getting doctors:', error);
      return [];
    }
  }

  getAdmins(): User[] {
    try {
      const dataService = this.getService();
      if (!dataService) {
        return [];
      }

      return dataService.getUsers().filter(u => u.role === 'admin' && u.isActive);
    } catch (error) {
      console.error('Error getting admins:', error);
      return [];
    }
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'> & { password: string }): User {
    try {
      const dataService = this.getService();
      if (!dataService) {
        throw new Error('DataService is not available.');
      }

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
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  updateUser(userData: User): void {
    try {
      const dataService = this.getService();
      if (!dataService) {
        return;
      }

      dataService.updateUser(userData);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  deactivateUser(userId: string): void {
    try {
      const dataService = this.getService();
      if (!dataService) {
        return;
      }

      const users = dataService.getUsers();
      const user = users.find(u => u.id === userId);
      if (user) {
        user.isActive = false;
        dataService.updateUser(user);
        
        // Unassign cases from deactivated doctor
        if (user.role === 'doctor') {
          const cases = dataService.getCases();
          const doctorCases = cases.filter(c => c.doctorId === userId);
          doctorCases.forEach(case_ => {
            case_.doctorId = '';
            case_.doctorAssigned = 'Unassigned';
            case_.lastUpdated = new Date().toISOString();
            dataService.updateCase(case_);
          });
        }
        
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
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  }

  // Case management methods
  getAllCases(): PatientCase[] {
    try {
      const dataService = this.getService();
      if (!dataService) {
        return [];
      }

      return dataService.getCases();
    } catch (error) {
      console.error('Error getting all cases:', error);
      return [];
    }
  }

  getCasesForDoctor(doctorId: string): PatientCase[] {
    try {
      const dataService = this.getService();
      if (!dataService) {
        return [];
      }

      // Enhanced filtering to catch all possible assignment scenarios
      const allCases = dataService.getCases();
      const doctorCases = allCases.filter(case_ => {
        // Check multiple conditions to ensure we don't miss any cases
        const isAssignedById = case_.doctorId === doctorId;
        const isAssignedByName = case_.doctorId && case_.doctorId === doctorId;
        const hasMatchingAssignment = case_.doctorAssigned && case_.doctorId === doctorId;
        
        return isAssignedById || isAssignedByName || hasMatchingAssignment;
      });
      
      console.log('getCasesForDoctor - Doctor ID:', doctorId);
      console.log('getCasesForDoctor - All cases:', allCases.length);
      console.log('getCasesForDoctor - Filtered cases:', doctorCases.length);
      console.log('getCasesForDoctor - Case assignments:', allCases.map(c => ({ 
        id: c.id, 
        patient: c.patientName, 
        doctorId: c.doctorId, 
        doctorAssigned: c.doctorAssigned 
      })));
      
      return doctorCases;
    } catch (error) {
      console.error('Error getting cases for doctor:', error);
      return [];
    }
  }

  addCase(case_: PatientCase): void {
    try {
      const dataService = this.getService();
      if (!dataService) {
        return;
      }

      dataService.addCase(case_);
      
      if (this.currentUser) {
        this.logActivity(
          this.currentUser.id,
          this.currentUser.name,
          this.currentUser.role,
          'CREATE_CASE',
          case_.id,
          case_.patientName,
          `Created new case for patient: ${case_.patientName}`
        );
      }
    } catch (error) {
      console.error('Error adding case:', error);
    }
  }

  updateCase(updatedCase: PatientCase): void {
    try {
      const dataService = this.getService();
      if (!dataService) {
        return;
      }

      updatedCase.lastUpdated = new Date().toISOString();
      dataService.updateCase(updatedCase);
      
      if (this.currentUser) {
        this.logActivity(
          this.currentUser.id,
          this.currentUser.name,
          this.currentUser.role,
          'UPDATE_CASE',
          updatedCase.id,
          updatedCase.patientName,
          `Updated case for patient: ${updatedCase.patientName}`
        );
      }
    } catch (error) {
      console.error('Error updating case:', error);
    }
  }

  deleteCase(caseId: string): void {
    try {
      const dataService = this.getService();
      if (!dataService) {
        return;
      }

      const cases = dataService.getCases();
      const case_ = cases.find(c => c.id === caseId);

      dataService.deleteCase(caseId);
      
      if (this.currentUser && case_) {
        this.logActivity(
          this.currentUser.id,
          this.currentUser.name,
          this.currentUser.role,
          'DELETE_CASE',
          caseId,
          case_.patientName,
          `Deleted case for patient: ${case_.patientName}`
        );
      }
    } catch (error) {
      console.error('Error deleting case:', error);
    }
  }

  assignCaseToDoctor(caseId: string, doctorId: string): void {
    try {
      const dataService = this.getService();
      if (!dataService) {
        return;
      }

      const cases = dataService.getCases();
      const users = dataService.getUsers();
      const case_ = cases.find(c => c.id === caseId);
      const doctor = users.find(u => u.id === doctorId && u.role === 'doctor' && u.isActive);
      
      if (case_ && doctor) {
        // Ensure both ID and name are properly set for redundancy
        case_.doctorId = doctor.id;
        case_.doctorAssigned = doctor.name;
        case_.lastUpdated = new Date().toISOString();
        dataService.updateCase(case_);
        
        console.log('Case assigned successfully:', {
          caseId: case_.id,
          patientName: case_.patientName,
          doctorId: doctor.id,
          doctorName: doctor.name
        });
        
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
      } else {
        console.error('Case or doctor not found for assignment', { caseId, doctorId, case: !!case_, doctor: !!doctor });
      }
    } catch (error) {
      console.error('Error assigning case to doctor:', error);
    }
  }

  logActivity(userId: string, userName: string, userRole: string, action: string, caseId?: string, caseName?: string, details?: string): void {
    try {
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
      const dataService = this.getService();
      if (!dataService) {
        return;
      }

      dataService.addActivityLog(log);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  getActivityLogs(): ActivityLog[] {
    try {
      const dataService = this.getService();
      if (!dataService) {
        return [];
      }

      return dataService.getActivityLogs().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error getting activity logs:', error);
      return [];
    }
  }

  getUserActivityLogs(userId: string): ActivityLog[] {
    try {
      const dataService = this.getService();
      if (!dataService) {
        return [];
      }

      return dataService.getActivityLogs()
        .filter(log => log.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error getting user activity logs:', error);
      return [];
    }
  }
}

export const authService = new AuthService();
