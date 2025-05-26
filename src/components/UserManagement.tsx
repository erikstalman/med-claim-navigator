
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit, Users } from "lucide-react";
import { authService } from "@/services/authService";
import { User } from "@/types";
import { toast } from "sonner";

const UserManagement = () => {
  const [users, setUsers] = useState(authService.getAllUsers());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'doctor' as 'admin' | 'doctor',
    specialization: '',
    licenseNumber: ''
  });

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    const userData: Omit<User, 'id' | 'createdAt'> = {
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      isActive: true,
      specialization: newUser.role === 'doctor' ? newUser.specialization : undefined,
      licenseNumber: newUser.role === 'doctor' ? newUser.licenseNumber : undefined
    };

    const createdUser = authService.createUser(userData);
    setUsers(authService.getAllUsers());
    setIsCreateDialogOpen(false);
    setNewUser({
      name: '',
      email: '',
      role: 'doctor',
      specialization: '',
      licenseNumber: ''
    });
    toast.success(`User ${createdUser.name} created successfully`);
  };

  const handleDeactivateUser = (userId: string) => {
    authService.deactivateUser(userId);
    setUsers(authService.getAllUsers());
    toast.success("User deactivated successfully");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'doctor': return 'bg-green-100 text-green-800';
      case 'system-admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>User Management</span>
            </CardTitle>
            <CardDescription>Manage doctors and administrators</CardDescription>
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
                <DialogDescription>Add a new doctor or administrator to the system</DialogDescription>
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
                  <Label htmlFor="role">Role *</Label>
                  <Select value={newUser.role} onValueChange={(value: 'admin' | 'doctor') => setNewUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
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
          {users.map((user) => (
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
                      <div>Email: {user.email}</div>
                      {user.specialization && <div>Specialization: {user.specialization}</div>}
                      {user.licenseNumber && <div>License: {user.licenseNumber}</div>}
                      <div>Created: {new Date(user.createdAt).toLocaleDateString()}</div>
                      {user.lastLogin && (
                        <div>Last Login: {new Date(user.lastLogin).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
