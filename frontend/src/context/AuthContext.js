/**
 * Contexte d'authentification React.
 * Partage l'état de connexion (token, userInfo) dans toute l'application.
 * Évite le "prop drilling" (passer les props à travers plusieurs composants).
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifie au démarrage si un token est déjà stocké
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isLogged = await authService.isLoggedIn();
      if (isLogged) {
        const userInfo = await authService.getUserInfo();
        setUser(userInfo);
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    await authService.saveToken(data.token, { email: data.email, userId: data.userId });
    setUser({ email: data.email, userId: data.userId });
    return data;
  };

  const register = async (email, password) => {
    const data = await authService.register(email, password);
    await authService.saveToken(data.token, { email: data.email, userId: data.userId });
    setUser({ email: data.email, userId: data.userId });
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
};
