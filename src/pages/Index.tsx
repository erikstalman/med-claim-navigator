
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Shield, Brain, Database, Users, FileText, Stethoscope, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Index component mounted/updated');
    console.log('Current location:', location.pathname);
    console.log('User state:', !!user);
    console.log('Profile state:', !!profile);
  }, [location.pathname, user, profile]);

  const handleNavigation = (path: string, dashboardName: string) => {
    console.log(`=== NAVIGATION DEBUG ===`);
    console.log(`Attempting to navigate to ${path} (${dashboardName})`);
    console.log('Current user:', !!user, user?.email);
    console.log('Current profile:', !!profile, profile?.role);
    console.log('Current location before navigation:', location.pathname);
    
    try {
      navigate(path);
      console.log(`Navigation to ${path} initiated successfully`);
      
      // Check if navigation actually happened after a short delay
      setTimeout(() => {
        console.log('Location after navigation attempt:', window.location.pathname);
      }, 100);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  if (!user) {
    console.log('Rendering landing page (no user)');
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

  console.log('Rendering logged in user view');
  // Logged in user view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Heart className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">MedClaim Navigator</h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            Welcome, {profile?.name || user.email}!
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Choose your dashboard to explore the platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleNavigation('/doctor', 'Doctor Dashboard')}>
            <CardHeader className="text-center">
              <Stethoscope className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Doctor Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                View and evaluate patient cases, upload documents, and provide medical assessments.
              </CardDescription>
              <Button className="w-full mt-4" onClick={(e) => {
                e.stopPropagation();
                handleNavigation('/doctor', 'Doctor Dashboard');
              }}>
                Access Doctor Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleNavigation('/admin', 'Admin Dashboard')}>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Manage cases, assign doctors, monitor system activity, and oversee claim processing.
              </CardDescription>
              <Button className="w-full mt-4" onClick={(e) => {
                e.stopPropagation();
                handleNavigation('/admin', 'Admin Dashboard');
              }}>
                Access Admin Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleNavigation('/system-admin', 'System Admin Dashboard')}>
            <CardHeader className="text-center">
              <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>System Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Manage users, configure AI rules, and oversee platform administration.
              </CardDescription>
              <Button className="w-full mt-4" onClick={(e) => {
                e.stopPropagation();
                handleNavigation('/system-admin', 'System Admin Dashboard');
              }}>
                Access System Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button onClick={signOut} variant="outline" size="lg">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
