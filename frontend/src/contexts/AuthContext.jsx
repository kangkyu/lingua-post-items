import React, { createContext, useContext, useState, useEffect } from 'react';
import { getGoogleAuthUrl, handleGoogleCallback } from '@/lib/auth.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState(null);

  // Initialize user and session from localStorage on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedSessionToken = localStorage.getItem('sessionToken');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        if (savedSessionToken) {
          setSessionToken(savedSessionToken);
        }
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('sessionToken');
      }
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Sign-in failed:', error);
      alert(`Sign-in failed: ${error.message}`);
      setLoading(false);
    }
  };

  const handleAuthCallback = async () => {
    try {
      setLoading(true);
      const result = await handleGoogleCallback();

      if (result.success) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));

        if (result.sessionToken) {
          setSessionToken(result.sessionToken);
          localStorage.setItem('sessionToken', result.sessionToken);
        }

        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Auth callback failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    setSessionToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('sessionToken');
  };

  const value = {
    user,
    loading,
    sessionToken,
    signInWithGoogle,
    signOut,
    handleAuthCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
