import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";

const translations = {
  en,
};

i18n.use(initReactI18next).init({
  resources: translations,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export { i18n };
