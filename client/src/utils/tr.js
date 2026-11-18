import i18n from "../components/i18";

/** Translate a string without needing a hook — useful in plain helpers and JSX text. */
export const t = (text) => i18n.t(text);
export const tr = t;
