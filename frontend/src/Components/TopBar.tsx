import React from 'react'
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faTwitter, faInstagram, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

function TopBar() {
  const { t } = useTranslation();
  
  return (
    <div className="w-full bg-slate-900 text-gray-200 text-sm p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2">

        {/*Left side */}
        <div className="flex items-center gap-6">
          {/* Icon for clock */}
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faClock} className="text-white-500" />
            <p>{t('topbar.hours')}</p>
          </div>

          {/* address*/}
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faLocationDot} className="text-white-500" />
            <p>{t('topbar.address')}</p>
          </div>
        </div>

        {/* Right side with social media icons and language switcher */}
        <div className="flex items-center gap-4 z-200">
          <LanguageSwitcher />
          
          <a
            href="https://facebook.com"
            target="_blank"
            className="hover:text-yellow-500 transition-colors"
          >
            <FontAwesomeIcon icon={faFacebookF} />
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            className="hover:text-yellow-500 transition-colors"
          >
            <FontAwesomeIcon icon={faTwitter} />
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            className="hover:text-yellow-500 transition-colors"
          >
            <FontAwesomeIcon icon={faInstagram} />
          </a>

          <a
            href="https://google.com"
            target="_blank"
            className="hover:text-yellow-500 transition-colors"
          >
            <FontAwesomeIcon icon={faGoogle} />
          </a>
        </div>

      </div>
    </div>
  );
}

export default TopBar;
