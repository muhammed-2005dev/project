import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar, faMagnifyingGlass, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from 'react-i18next';

function Navbar() {
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  {/* If we resized the window to full screen while we opening the icons of the  links in small scrrens it close */ }
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isRTL = i18n.language === 'ar';

  return (
    <nav className={`w-full bg-white sticky top-0 z-100 shadow-md ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-6">

        {/* Left side */}
        <div className="flex items-center gap-2 text-slate-800">
          <FontAwesomeIcon icon={faCar} className="text-yellow-500 text-2xl" />
          <h1 className="text-2xl font-bold">AutoLogic</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-8">

          {/* Desktop Links */}
          <ul className={`hidden md:flex gap-8 text-slate-700 font-medium list-none ${isRTL ? 'flex-row-reverse' : ''}`}>
            <li><NavLink to="/" className={({ isActive }) => `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.home')}</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.about')}</NavLink></li>
            <li><NavLink to="/services" className={({ isActive }) => `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.services')}</NavLink></li>
            <li><NavLink to="/projects" className={({ isActive }) => `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.projects')}</NavLink></li>
            <li><NavLink to="/blog" className={({ isActive }) => `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.blog')}</NavLink></li>
            <li><NavLink to="/contact" className={({ isActive }) => `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.contact')}</NavLink></li>
            <li><NavLink to="/pricing" className={({ isActive }) => `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.pricing')}</NavLink></li>
            <li><NavLink to="/appointment" className={({ isActive }) => `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.appointment')}</NavLink></li>
            <li><NavLink to="/login" className={({ isActive }) => `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.login')}</NavLink></li>
          </ul>

          {/* The icon for links in small screens */}
          <div className="md:hidden text-2xl text-slate-700 cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} >
            <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
          </div>

          {/*  Search icon */}
          <div className="relative" onMouseEnter={() => setShowSearch(true)} onMouseLeave={() => setShowSearch(false)}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-700 text-lg cursor-pointer hover:text-yellow-500 transition-colors" />

            {/* Search Box */}
            <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-8 bg-white border border-gray-300 rounded-md shadow-md overflow-hidden transition-all duration-300 
            ${showSearch ? "opacity-100 scale-100 visible" : "opacity-0 scale-0 invisible"}`}>
              <input type="text" placeholder={t('common.search')} className={`px-3 py-2 w-48 outline-none text-sm text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} >
          <div
            className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 w-2/3 sm:w-1/2 bg-white shadow-lg h-full p-6 flex flex-col gap-6 text-slate-700 font-medium`}
            onClick={(e) => e.stopPropagation()} >
            <NavLink to="/" onClick={() => setMenuOpen(false)} className={({ isActive }) =>
              `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.home')}</NavLink>
            <NavLink to="/about" onClick={() => setMenuOpen(false)} className={({ isActive }) =>
              `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.about')}</NavLink>
            <NavLink to="/services" onClick={() => setMenuOpen(false)} className={({ isActive }) =>
              `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.services')}</NavLink>
            <NavLink to="/projects" onClick={() => setMenuOpen(false)} className={({ isActive }) =>
              `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.projects')}</NavLink>
            <NavLink to="/blog" onClick={() => setMenuOpen(false)} className={({ isActive }) =>
              `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.blog')}</NavLink>
            <NavLink to="/contact" onClick={() => setMenuOpen(false)} className={({ isActive }) =>
              `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.contact')}</NavLink>
            <NavLink to="/pricing" onClick={() => setMenuOpen(false)} className={({ isActive }) =>
              `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.pricing')}</NavLink>
            <NavLink to="/appointment" onClick={() => setMenuOpen(false)} className={({ isActive }) =>
              `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.appointment')}</NavLink>
            <NavLink to="/login" onClick={() => setMenuOpen(false)} className={({ isActive }) =>
              `transition-colors ${isActive ? "text-yellow-500" : "hover:text-yellow-500"}`}>{t('nav.login')}</NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
