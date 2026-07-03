import { createContext, useState, useContext } from "react";

const AuthModalContext = createContext();

export const AuthModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("login");
  const [modalData, setModalData] = useState(null);

  const openModal = (initialView = "login", data = null) => {
    setView(initialView);
    setModalData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalData(null);
  };

  const switchView = (newView, data = null) => {
    setView(newView);
    if (data) setModalData(data);
  };

  return (
    <AuthModalContext.Provider
      value={{ isOpen, view, openModal, closeModal, switchView, modalData }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
