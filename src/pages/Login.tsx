
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, Shield, Settings } from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (expectedRole?: string) => {
    if (!credentials.email || !credentials.password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      const user = authService.login(credentials.email, credentials.password);
      
      if (user) {
        if (expectedRole && user.role !== expectedRole) {
          toast.error(`Invalid credentials for ${expectedRole} login`);
          authService.logout();
          setIsLoading(false);
          return;
        }

        toast.success(`Welcome back, ${user.name}!`);
        
        // Navigate based on role
        switch (user.role) {
          case 'doctor':
            navigate("/doctor");
            break;
          case 'admin':
            navigate("/admin");
            break;
          case 'system-admin':
            navigate("/system-admin");
            break;
          default:
            navigate("/");
        }
      } else {
        toast.error("Invalid email or password");
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-900">
            Healthcare Claims Platform
          </CardTitle>
          <CardDescription>
            AI-supported claim evaluation system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="doctor" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="doctor" className="flex items-center gap-2 text-xs">
                <Stethoscope size={14} />
                Doctor
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2 text-xs">
                <Shield size={14} />
                Admin
              </TabsTrigger>
              <TabsTrigger value="system-admin" className="flex items-center gap-2 text-xs">
                <Settings size={14} />
                System
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="doctor" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor-email">Email</Label>
                <Input
                  id="doctor-email"
                  type="email"
                  placeholder="doctor@healthcare.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-password">Password</Label>
                <Input
                  id="doctor-password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => handleLogin("doctor")}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login as Doctor"}
              </Button>
            </TabsContent>
            
            <TabsContent value="admin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@insurance.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
              </div>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={() => handleLogin("admin")}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login as Administrator"}
              </Button>
            </TabsContent>

            <TabsContent value="system-admin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sysadmin-email">Email</Label>
                <Input
                  id="sysadmin-email"
                  type="email"
                  placeholder="sysadmin@insurance.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sysadmin-password">Password</Label>
                <Input
                  id="sysadmin-password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
              </div>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                onClick={() => handleLogin("system-admin")}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login as System Admin"}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-xs text-gray-600 space-y-1">
            <p><strong>Demo Credentials:</strong></p>
            <p>Admin: admin@insurance.com / password</p>
            <p>System: sysadmin@insurance.com / password</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
