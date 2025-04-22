import React, { createContext, useState, useEffect } from "react";
import authService from "../services/authService";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const loggedInUser = await authService.getUser();
        if (loggedInUser) {
          setUser(loggedInUser);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(userData);
      if (response.data) {
        const loggedInUser = await authService.getUser();
        setUser(loggedInUser);
      }
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      const registeredUser = await authService.getUser();
      setUser(registeredUser);
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setIsLoading(true);
    authService.logout();
    setUser(null);
    setIsLoading(false);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;