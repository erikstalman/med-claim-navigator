
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Shield, Brain, Database, Users, FileText } from 'lucide-react';

const Index = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      // Redirect based on user role
      switch (profile.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'doctor':
          navigate('/doctor');
          break;
        case 'system-admin':
          navigate('/system-admin');
          break;
      }
    }
  }, [user, profile, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">MedClaim Navigator</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI-Powered Healthcare Claims Management Platform with Advanced Document Analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  <span>AI-Powered Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced AI analyzes medical documents, extracts key information, and provides intelligent recommendations for claim processing.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-6 w-6 text-green-600" />
                  <span>Real Database</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Secure PostgreSQL database with real-time data persistence, replacing localStorage with production-ready storage.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <span>JWT Authentication</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Secure JWT-based authentication with role-based access control and password hashing for data protection.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-orange-600" />
                  <span>Cloud File Storage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Real file uploads to Supabase Storage with automatic document analysis and content extraction.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-indigo-600" />
                  <span>Role-Based Access</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Comprehensive user management with admin, doctor, and system admin roles with appropriate permissions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-red-600" />
                  <span>Claims Processing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete claims management workflow with document upload, AI analysis, and collaborative evaluation tools.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              className="mr-4"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              size="lg"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome, {profile?.name}</CardTitle>
          <CardDescription>Redirecting you to your dashboard...</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={signOut} variant="outline" className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
