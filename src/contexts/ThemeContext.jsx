import React, { createContext, useContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      return;
    }
    const prefersLight = window.matchMedia(
      "(prefers-color-scheme: light)"
    ).matches;
    setTheme(prefersLight ? "light" : "dark");
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "light") {
      document.body.classList.add("light-mode");
      document.documentElement.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
      document.documentElement.classList.remove("light-mode");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
