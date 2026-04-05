"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, isFirebaseConfigured, signInWithGoogle, signOutUser, subscribeToAuthChanges } from "@/lib/firebase";
import api from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Automatically sync with backend to get/create user
        try {
          await api.post("/auth/login");
        } catch (error) {
          console.error("Failed to sync user with backend", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const didStartLogin = await signInWithGoogle();
      if (!didStartLogin) {
        return;
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    await signOutUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
