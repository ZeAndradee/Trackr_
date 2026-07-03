import { createContext, useState } from "react";

export const SelectedTrackContext = createContext();

export const SelectedTrackProvider = ({ children }) => {
  const [selectedTrack, setSelectedTrack] = useState(null);

  return (
    <SelectedTrackContext.Provider value={{ selectedTrack, setSelectedTrack }}>
      {children}
    </SelectedTrackContext.Provider>
  );
};
