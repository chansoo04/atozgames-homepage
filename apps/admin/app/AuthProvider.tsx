// contexts/AuthContext.tsx
"use client";
import { createContext, useEffect, useState, ReactNode } from "react";
import { auth } from "../lib/firebaseClient";
import { onAuthStateChanged, User } from "firebase/auth";

interface AuthContextProps {
  user: User | null;
}
export const AuthContext = createContext<AuthContextProps>({ user: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
