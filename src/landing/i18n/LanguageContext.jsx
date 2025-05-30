// context/LanguageContext.jsx
import { createContext, useContext, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  const t = (key) => {
    const keys = key.split(".");
    return keys.reduce(
      (obj, k) => (obj && typeof obj === "object" && k in obj ? obj[k] : undefined),
      translations[language]
    ) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
