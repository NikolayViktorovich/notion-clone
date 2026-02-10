import { useState, useEffect } from 'react';
import { Language, setLanguage as setLang, getLanguage, t, subscribe } from '../i18n';

export const useI18n = () => {
  const [language, setLanguageState] = useState<Language>(getLanguage());

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setLanguageState(getLanguage());
    });
    return unsubscribe;
  }, []);

  const changeLanguage = (lang: Language) => {
    setLang(lang);
  };

  return {
    t,
    language,
    setLanguage: changeLanguage,
  };
};
