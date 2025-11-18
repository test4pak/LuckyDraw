"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  hasLoginDataSaved: boolean;
  setHasLoginDataSaved: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hasLoginDataSaved, setHasLoginDataSaved] = useState(false);

  return (
    <AuthContext.Provider value={{ hasLoginDataSaved, setHasLoginDataSaved }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

