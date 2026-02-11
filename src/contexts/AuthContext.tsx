import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Map backend roles to frontend roles
// Backend: 'superadmin', 'admin', 'employee', 'manager', 'hr'
// Frontend: 'SUPERADMIN', 'ADMIN', 'USER'
export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  branch?: string;
  position?: string;
  employee_id?: string;
  birth_date?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, branch: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Map backend user to frontend user
  const mapUser = (backendUser: any): User => {
    let role: UserRole = 'USER';

    // Role mapping based on backend role
    if (backendUser.role === 'superadmin') {
      role = 'SUPERADMIN';
    } else if (backendUser.role === 'admin' || backendUser.role === 'manager' || backendUser.role === 'hr') {
      role = 'ADMIN';
    }

    return {
      id: backendUser.id.toString(),
      name: `${backendUser.first_name} ${backendUser.last_name}`,
      email: backendUser.email,
      role: role,
      department: backendUser.department || 'General',
      branch: backendUser.branch || undefined, // Use updated branch from backend
      position: backendUser.position || 'Staff',
      employee_id: backendUser.employee_id,
      birth_date: backendUser.birth_date
    };
  };

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            // Default branch for restored session
            setUser(mapUser(data.data.user));
          } else {
            // Token invalid or expired
            localStorage.removeItem('token');
          }
        } catch (error) {
          // console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, branch: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, branch }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token, user: backendUser } = data.data;

        // Save token
        localStorage.setItem('token', token);

        // Update user state
        setUser(mapUser(backendUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPERADMIN',
        isSuperAdmin: user?.role === 'SUPERADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
