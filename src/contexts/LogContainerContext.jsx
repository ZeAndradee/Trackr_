import { useState, useContext, createContext } from "react";

export const LogContainerContext = createContext();

export const LogContainerProvider = ({ children }) => {
  const [showLogContainer, setShowLogContainer] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  return (
    <LogContainerContext.Provider
      value={{
        showLogContainer,
        setShowLogContainer,
        selectedTrack,
        setSelectedTrack,
      }}
    >
      {children}
    </LogContainerContext.Provider>
  );
};

export const useLogContainerContext = () => {
  const context = useContext(LogContainerContext);
  if (context === undefined) {
    throw new Error(
      "useLogContainerContext must be used within a LogContainerProvider"
    );
  }
  return context;
};
