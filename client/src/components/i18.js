
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en/translation.json";
import bn from "../locales/bn/translation.json";

const storedLanguage =
    typeof localStorage !== "undefined" ? localStorage.getItem("bc:language") : null;
const initialLanguage = storedLanguage === "bn" || storedLanguage === "en" ? storedLanguage : "en";

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        bn: { translation: bn },
    },
    lng: initialLanguage,
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

if (typeof document !== "undefined") {
    document.documentElement.lang = initialLanguage;
}

export default i18n;
