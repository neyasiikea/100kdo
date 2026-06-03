'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const AuthContext = createContext<{
  password: string;
  setPassword: (p: string) => void;
}>({ password: '', setPassword: () => {} });

export function useAdminAuth() {
  return useContext(AuthContext);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [password, setPassword] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('100kdo_admin_pwd');
    if (saved) setPassword(saved);
  }, []);

  const handleSetPassword = (p: string) => {
    setPassword(p);
    sessionStorage.setItem('100kdo_admin_pwd', p);
  };

  return (
    <AuthContext.Provider value={{ password, setPassword: handleSetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}
