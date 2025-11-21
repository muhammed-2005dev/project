import React from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";

    // 1. Change language
    i18n.changeLanguage(newLang);

    // 2. Force HTML direction update
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-gray-200 hover:text-yellow-500 transition-colors cursor-pointer"
      title="Switch Language"
    >
      <FontAwesomeIcon icon={faGlobe} />
      <span className="text-sm font-bold">
        {i18n.language === "en" ? "English" : "العربية"}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
