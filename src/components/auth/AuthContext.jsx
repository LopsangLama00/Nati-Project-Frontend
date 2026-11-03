import { createContext, useEffect, useState } from "react";
import { ApiService } from "../AxiosRequest/ApiConfig";
import {
  saveUser,
  clearUser,
} from "./AuthStorage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const response = await ApiService.auth.getProfile();

        setUser(response.data);
        saveUser(response.data);

      } catch (error) {
        console.log(
          "No authenticated session:",
          error.response?.status
        );

        setUser(null);
        clearUser();

      } finally {
        setAuthLoading(false);
      }
    };

    restoreAuth();
  }, []);

  const login = (userData) => {
    saveUser(userData);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await ApiService.auth.logout();
    } finally {
      // Remove local user information
      clearUser();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        authLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};