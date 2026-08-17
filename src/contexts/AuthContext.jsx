import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingPage, setPendingPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('petsogram_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email) => {
    const mockUser = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      email: email || "demo@example.com",
      name: email ? email.split('@')[0] : "Demo User",
      role: "Pet Owner"
    };
    setUser(mockUser);
    localStorage.setItem('petsogram_user', JSON.stringify(mockUser));
    return true;
  };

  const signup = (email, name, role) => {
    const mockUser = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      email: email || "demo@example.com",
      name: name || "Demo User",
      role: role || "Pet Owner"
    };
    setUser(mockUser);
    localStorage.setItem('petsogram_user', JSON.stringify(mockUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('petsogram_user');
  };

  const requireAuthAction = (actionCallback, redirectFn) => {
    if (user) {
      actionCallback();
      return true;
    } else {
      setPendingAction(() => actionCallback);
      redirectFn("login");
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      logout,
      pendingAction,
      setPendingAction,
      pendingPage,
      setPendingPage,
      requireAuthAction
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
