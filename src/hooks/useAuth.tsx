
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  username: null,
  login: () => Promise.resolve(false),
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for existing session on component mount
    const storedAuth = localStorage.getItem('eyefem_auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setIsAuthenticated(true);
        setUsername(authData.username);
      } catch (error) {
        console.error("Error parsing auth data:", error);
        localStorage.removeItem('eyefem_auth');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Fetch the password from the database
      const { data, error } = await supabase
        .from('admin_passwords')
        .select('password')
        .eq('username', username)
        .single();

      if (error || !data) {
        console.error("Error fetching password:", error);
        return false;
      }

      // Compare the provided password with the stored password
      if (data.password === password) {
        setIsAuthenticated(true);
        setUsername(username);
        localStorage.setItem('eyefem_auth', JSON.stringify({ username }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem('eyefem_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default useAuth;
