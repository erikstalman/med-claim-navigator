
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, Shield } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleLogin = (userType: "doctor" | "admin") => {
    // Simulate login
    navigate(userType === "doctor" ? "/doctor" : "/admin");
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="doctor" className="flex items-center gap-2">
                <Stethoscope size={16} />
                Doctor
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield size={16} />
                Admin
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
              >
                Login as Doctor
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
              >
                Login as Administrator
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
