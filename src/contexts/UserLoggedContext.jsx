import { useState, useEffect, createContext } from "react";
import { useAuth } from "./AuthContext";

export const UserLoggedContext = createContext();

export const UserLoggedProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [userLogged, setUserLogged] = useState(currentUser);
  const [loading, setLoading] = useState(authLoading);

  useEffect(() => {
    setUserLogged(currentUser);
    setLoading(authLoading);
  }, [currentUser, authLoading]);

  return (
    <UserLoggedContext.Provider value={{ userLogged, setUserLogged, loading }}>
      {children}
    </UserLoggedContext.Provider>
  );
};
