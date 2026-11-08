import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const STORAGE_KEY = 'tredye.auth.v1';

export function AuthProvider({ children }) {
  // Default to signed in as requested by user ("after signin , i want all features and ui ux like this website")
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: "usr_94821",
      name: "Paras (Pro Trader)",
      email: "trader@quantumalpha.com",
      plan: "Pro Terminal",
      avatar: "PT",
      role: "authenticated",
      settings: {
        theme: "dark",
        compactDensity: false,
        soundAlerts: true,
        reduceMotion: false,
        presentationInterval: 20
      }
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (email, password) => {
    const newUser = {
      id: "usr_" + Math.floor(Math.random() * 89999 + 10000),
      name: email.split('@')[0],
      email: email.toLowerCase(),
      plan: "Pro Terminal",
      avatar: email.slice(0, 2).toUpperCase(),
      role: "authenticated",
      settings: {
        theme: "dark",
        compactDensity: false,
        soundAlerts: true,
        reduceMotion: false,
        presentationInterval: 20
      }
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    return newUser;
  };

  const register = (name, email, password) => {
    const newUser = {
      id: "usr_" + Math.floor(Math.random() * 89999 + 10000),
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      plan: "Pro Terminal",
      avatar: (name ? name.slice(0, 2) : email.slice(0, 2)).toUpperCase(),
      role: "authenticated",
      settings: {
        theme: "dark",
        compactDensity: false,
        soundAlerts: true,
        reduceMotion: false,
        presentationInterval: 20
      }
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  const loginDemo = () => {
    login("demo.trader@quantumalpha.com", "password123");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loginDemo,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

