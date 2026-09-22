import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, LoginRequest, ClientRegistrationRequest } from '../services/authService';

interface AuthContextType {
  user: { accountId: number; email: string; name: string; roles: string[] } | null;
  login: (credentials: LoginRequest) => Promise<void>;
  registerClient: (data: ClientRegistrationRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ accountId: number; email: string; name: string; roles: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = authService.getUser();
    if (savedUser && authService.isAuthenticated()) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      setUser({
        accountId: response.accountId,
        email: response.email,
        name: response.name,
        roles: response.roles,
      });
      
      // Redirect to client portal if user has client_admin role
      if (response.roles.includes('client_admin')) {
        navigate('/client-portal/home');
      } else {
        navigate('/');
      }
    } catch (error) {
      throw error;
    }
  };

  const registerClient = async (data: ClientRegistrationRequest) => {
    await authService.registerClient(data);
    // Do not auto-login after registration
    // User will see success message and can go to login
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        registerClient,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
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





















