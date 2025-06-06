
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit, Users, Eye, EyeOff, Copy } from "lucide-react";
import { authService } from "@/services/authService";
import { User } from "@/types";
import { toast } from "sonner";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [demoCredentials, setDemoCredentials] = useState({
    doctor: { email: 'doctor@healthcare.com', password: 'doctor123' },
    admin: { email: 'admin@insurance.com', password: 'admin123' },
    systemAdmin: { email: 'sysadmin@insurance.com', password: 'sysadmin123' }
  });
  const [isDemoEditOpen, setIsDemoEditOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor' as 'admin' | 'doctor' | 'system-admin',
    specialization: '',
    licenseNumber: ''
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = authService.getAllUsers();
    setUsers(allUsers);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser(prev => ({ ...prev, password }));
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    const existingUser = users.find(u => u.email === newUser.email);
    if (existingUser) {
      toast.error("A user with this email already exists");
      return;
    }

    const userData: Omit<User, 'id' | 'createdAt'> & { password: string } = {
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      password: newUser.password,
      isActive: true,
      specialization: newUser.role === 'doctor' ? newUser.specialization : undefined,
      licenseNumber: newUser.role === 'doctor' ? newUser.licenseNumber : undefined
    };

    try {
      const createdUser = authService.createUser(userData);
      loadUsers();
      setIsCreateDialogOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'doctor',
        specialization: '',
        licenseNumber: ''
      });
      toast.success(`User ${createdUser.name} created successfully`);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error("Failed to create user. Please try again.");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser || !editingUser.name || !editingUser.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      authService.updateUser(editingUser);
      loadUsers();
      setIsEditDialogOpen(false);
      setEditingUser(null);
      toast.success("User updated successfully");
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Failed to update user. Please try again.");
    }
  };

  const handleDeactivateUser = (userId: string) => {
    try {
      authService.deactivateUser(userId);
      loadUsers();
      toast.success("User deactivated successfully");
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error("Failed to deactivate user. Please try again.");
    }
  };

  const handleSaveDemoCredentials = () => {
    // Update the actual users with new demo credentials
    const allUsers = authService.getAllUsers();
    
    const doctorUser = allUsers.find(u => u.email.includes('doctor@healthcare.com') || u.role === 'doctor');
    const adminUser = allUsers.find(u => u.email.includes('admin@insurance.com') || u.role === 'admin');
    const sysAdminUser = allUsers.find(u => u.email.includes('sysadmin@insurance.com') || u.role === 'system-admin');

    if (doctorUser) {
      doctorUser.email = demoCredentials.doctor.email;
      doctorUser.password = demoCredentials.doctor.password;
      authService.updateUser(doctorUser);
    }

    if (adminUser) {
      adminUser.email = demoCredentials.admin.email;
      adminUser.password = demoCredentials.admin.password;
      authService.updateUser(adminUser);
    }

    if (sysAdminUser) {
      sysAdminUser.email = demoCredentials.systemAdmin.email;
      sysAdminUser.password = demoCredentials.systemAdmin.password;
      authService.updateUser(sysAdminUser);
    }

    loadUsers();
    setIsDemoEditOpen(false);
    toast.success("Demo credentials updated successfully");
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'doctor': return 'bg-green-100 text-green-800';
      case 'system-admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const managedUsers = currentUser?.role === 'system-admin' 
    ? users 
    : users.filter(user => user.role !== 'system-admin');

  const availableRoles = currentUser?.role === 'system-admin'
    ? [
        { value: 'doctor', label: 'Doctor' },
        { value: 'admin', label: 'Administrator' },
        { value: 'system-admin', label: 'System Administrator' }
      ]
    : [
        { value: 'doctor', label: 'Doctor' },
        { value: 'admin', label: 'Administrator' }
      ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>
                {currentUser?.role === 'system-admin' 
                  ? 'Manage all system users with login credentials'
                  : 'Manage doctors and administrators with login credentials'
                }
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add User</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>Add a new user to the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="password"
                        type="text"
                        value={newUser.password}
                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter password"
                      />
                      <Button type="button" variant="outline" onClick={generatePassword}>
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={newUser.role} onValueChange={(value: 'admin' | 'doctor' | 'system-admin') => setNewUser(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {newUser.role === 'doctor' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                          id="specialization"
                          value={newUser.specialization}
                          onChange={(e) => setNewUser(prev => ({ ...prev, specialization: e.target.value }))}
                          placeholder="e.g., Orthopedics, Neurology"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber">License Number</Label>
                        <Input
                          id="licenseNumber"
                          value={newUser.licenseNumber}
                          onChange={(e) => setNewUser(prev => ({ ...prev, licenseNumber: e.target.value }))}
                          placeholder="Medical license number"
                        />
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser}>
                    Create User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {managedUsers.map((user) => (
              <Card key={user.id} className={!user.isActive ? 'opacity-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{user.name}</h4>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.replace('-', ' ')}
                        </Badge>
                        {!user.isActive && (
                          <Badge variant="outline" className="text-red-600">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span>Email: {user.email}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(user.email, 'Email')}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        {user.password && (
                          <div className="flex items-center space-x-2">
                            <span>Password: </span>
                            <span className="font-mono">
                              {showPasswords[user.id] ? user.password : '••••••••'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePasswordVisibility(user.id)}
                              className="h-6 w-6 p-0"
                            >
                              {showPasswords[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(user.password || '', 'Password')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {user.specialization && <div>Specialization: {user.specialization}</div>}
                        {user.licenseNumber && <div>License: {user.licenseNumber}</div>}
                        <div>Created: {new Date(user.createdAt).toLocaleDateString()}</div>
                        {user.lastLogin && (
                          <div>Last Login: {new Date(user.lastLogin).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {managedUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found. Create your first user to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Demo Credentials Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Demo Credentials</CardTitle>
              <CardDescription>Quick access credentials for testing</CardDescription>
            </div>
            <Dialog open={isDemoEditOpen} onOpenChange={setIsDemoEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Demo Credentials</DialogTitle>
                  <DialogDescription>Update the demo login credentials</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Doctor Credentials</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Email"
                        value={demoCredentials.doctor.email}
                        onChange={(e) => setDemoCredentials(prev => ({
                          ...prev,
                          doctor: { ...prev.doctor, email: e.target.value }
                        }))}
                      />
                      <Input
                        placeholder="Password"
                        value={demoCredentials.doctor.password}
                        onChange={(e) => setDemoCredentials(prev => ({
                          ...prev,
                          doctor: { ...prev.doctor, password: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Credentials</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Email"
                        value={demoCredentials.admin.email}
                        onChange={(e) => setDemoCredentials(prev => ({
                          ...prev,
                          admin: { ...prev.admin, email: e.target.value }
                        }))}
                      />
                      <Input
                        placeholder="Password"
                        value={demoCredentials.admin.password}
                        onChange={(e) => setDemoCredentials(prev => ({
                          ...prev,
                          admin: { ...prev.admin, password: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>System Admin Credentials</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Email"
                        value={demoCredentials.systemAdmin.email}
                        onChange={(e) => setDemoCredentials(prev => ({
                          ...prev,
                          systemAdmin: { ...prev.systemAdmin, email: e.target.value }
                        }))}
                      />
                      <Input
                        placeholder="Password"
                        value={demoCredentials.systemAdmin.password}
                        onChange={(e) => setDemoCredentials(prev => ({
                          ...prev,
                          systemAdmin: { ...prev.systemAdmin, password: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDemoEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveDemoCredentials}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Current Demo Credentials:</strong></p>
            <p>Doctor: {demoCredentials.doctor.email} / {demoCredentials.doctor.password}</p>
            <p>Admin: {demoCredentials.admin.email} / {demoCredentials.admin.password}</p>
            <p>System: {demoCredentials.systemAdmin.email} / {demoCredentials.systemAdmin.password}</p>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Password</Label>
                <Input
                  id="edit-password"
                  type="text"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, password: e.target.value } : null)}
                  placeholder="Enter new password (leave blank to keep current)"
                />
              </div>
              {editingUser.role === 'doctor' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-specialization">Specialization</Label>
                    <Input
                      id="edit-specialization"
                      value={editingUser.specialization || ''}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, specialization: e.target.value } : null)}
                      placeholder="e.g., Orthopedics, Neurology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-licenseNumber">License Number</Label>
                    <Input
                      id="edit-licenseNumber"
                      value={editingUser.licenseNumber || ''}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, licenseNumber: e.target.value } : null)}
                      placeholder="Medical license number"
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
