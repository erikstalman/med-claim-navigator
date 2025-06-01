
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit, Users, Eye, EyeOff, Copy } from "lucide-react";
import { supabaseService } from "@/services/supabaseService";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types";
import { toast } from "sonner";

const UserManagement = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor' as 'admin' | 'doctor' | 'system-admin',
    specialization: '',
    licenseNumber: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await supabaseService.getUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error("Failed to load users");
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser(prev => ({ ...prev, password }));
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    const existingUser = users.find(u => u.email === newUser.email);
    if (existingUser) {
      toast.error("A user with this email already exists");
      return;
    }

    try {
      await supabaseService.signUp(newUser.email, newUser.password, {
        name: newUser.name,
        role: newUser.role
      });
      
      await loadUsers();
      setIsCreateDialogOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'doctor',
        specialization: '',
        licenseNumber: ''
      });
      toast.success(`User ${newUser.name} created successfully`);
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || "Failed to create user. Please try again.");
    }
  };

  const handleCreateDemoUsers = async () => {
    setIsCreatingDemo(true);
    const demoUsers = [
      {
        email: 'doctor@healthcare.com',
        password: 'doctor123',
        name: 'Dr. Sarah Johnson',
        role: 'doctor' as const,
        specialization: 'Orthopedics'
      },
      {
        email: 'admin@insurance.com', 
        password: 'admin123',
        name: 'John Smith',
        role: 'admin' as const
      },
      {
        email: 'sysadmin@insurance.com',
        password: 'sysadmin123', 
        name: 'System Administrator',
        role: 'system-admin' as const
      }
    ];

    let successCount = 0;
    for (const user of demoUsers) {
      try {
        await supabaseService.signUp(user.email, user.password, {
          name: user.name,
          role: user.role
        });
        successCount++;
      } catch (error: any) {
        console.error(`Error creating demo user ${user.email}:`, error);
        // Continue with other users even if one fails
      }
    }

    await loadUsers();
    setIsCreatingDemo(false);
    
    if (successCount > 0) {
      toast.success(`Created ${successCount} demo users successfully`);
    } else {
      toast.error("Failed to create demo users. They may already exist.");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editingUser.name || !editingUser.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await supabaseService.updateProfile(editingUser.id, editingUser);
      await loadUsers();
      setIsEditDialogOpen(false);
      setEditingUser(null);
      toast.success("User updated successfully");
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || "Failed to update user. Please try again.");
    }
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

  const managedUsers = profile?.role === 'system-admin' 
    ? users 
    : users.filter(user => user.role !== 'system-admin');

  const availableRoles = profile?.role === 'system-admin'
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
                {profile?.role === 'system-admin' 
                  ? 'Manage all system users'
                  : 'Manage doctors and administrators'
                }
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleCreateDemoUsers}
                disabled={isCreatingDemo}
                className="flex items-center space-x-2"
              >
                {isCreatingDemo ? "Creating..." : "Create Demo Users"}
              </Button>
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {managedUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found. Create demo users or add your first user to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Demo Credentials Card */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Credentials</CardTitle>
          <CardDescription>Use these credentials after creating demo users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Demo Login Credentials:</strong></p>
            <p>Doctor: doctor@healthcare.com / doctor123</p>
            <p>Admin: admin@insurance.com / admin123</p>
            <p>System: sysadmin@insurance.com / sysadmin123</p>
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
