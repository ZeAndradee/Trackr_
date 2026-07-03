import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useBehindContrast } from "../utils/color/behindContrast";

const RelativeColorContext = createContext({
   isLight: false,
   setBgLight: () => { },
   bgUrl: null,
   setBgUrl: () => { },
   bgRef: { current: null },
   registerBgRef: () => { },
});

export const useRelativeColor = () => useContext(RelativeColorContext);

export const useRelativeColorContrast = (elementRef, options = {}) => {
   const { bgRef, bgUrl } = useRelativeColor();
   return useBehindContrast(elementRef, bgRef, bgUrl, options);
};

export const RelativeColorProvider = ({ children }) => {
   const [isLight, setIsLight] = useState(false);
   const [bgUrl, setBgUrlState] = useState(null);
   const [bgNode, setBgNode] = useState(null);

   const setBgLight = useCallback((light) => {
      setIsLight(!!light);
   }, []);

   const setBgUrl = useCallback((url) => {
      setBgUrlState(url || null);
   }, []);

   const registerBgRef = useCallback((node) => {
      setBgNode(node || null);
   }, []);

   const bgRef = useMemo(() => ({ current: bgNode }), [bgNode]);

   return (
      <RelativeColorContext.Provider
         value={{ isLight, setBgLight, bgUrl, setBgUrl, bgRef, registerBgRef }}
      >
         {children}
      </RelativeColorContext.Provider>
   );
};
