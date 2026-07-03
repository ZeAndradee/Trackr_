import React, { createContext, useState, useContext, useEffect } from "react";
import {
  handleLogin,
  checkAuth,
  handleLogout,
} from "../services/Auth/HandleAuth";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const userData = await checkAuth();
        setCurrentUser(userData);
      } catch (err) {
        console.error("Auth verification error:", err);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const loginUser = async (email, password) => {
    setError(null);
    try {
      const response = await handleLogin({ email, password });

      if (response?.status === 401) {
        throw new Error("Email or password are incorrect.");
      } else if (response?.status === 200) {
        const userData = await checkAuth();
        setCurrentUser(userData);
        return userData;
      } else {
        throw new Error("An error occurred during login.");
      }
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      await handleLogout();
      setCurrentUser(null);
    } catch (err) {
      console.error("Logout error:", err);
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    loginUser,
    logoutUser,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
