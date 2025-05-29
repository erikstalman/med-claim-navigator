
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import { User as AppUser } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: AppUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { name: string; role: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile data
          setTimeout(async () => {
            try {
              const profileData = await supabaseService.getCurrentProfile();
              if (profileData) {
                setProfile({
                  id: profileData.id,
                  email: profileData.email,
                  name: profileData.name,
                  role: profileData.role as 'admin' | 'doctor' | 'system-admin',
                  createdAt: profileData.created_at,
                  lastLogin: profileData.last_login,
                  isActive: profileData.is_active,
                  specialization: profileData.specialization,
                  licenseNumber: profileData.license_number
                });
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: { name: string; role: string }) => {
    await supabaseService.signUp(email, password, userData);
  };

  const signIn = async (email: string, password: string) => {
    await supabaseService.signIn(email, password);
  };

  const signOut = async () => {
    await supabaseService.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
