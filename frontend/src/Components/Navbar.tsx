import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCar,
  faBars,
  faTimes,
  faUser,
  faSignOutAlt,
  faTachometerAlt,
  faUserPlus,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // Helper to check if admin
  const isAdmin = user?.role === "admin";

  return (
    <nav
      className={`w-full bg-white sticky top-0 ${
        menuOpen ? "z-50" : "z-30"
      } shadow-md`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Mobile Menu Button */}
        <div
          className="md:hidden text-2xl text-slate-700 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </div>

        {/* Logo - If Admin, click goes to Dashboard. If User, goes to Home */}
        <NavLink
          to={isAdmin ? "/dashboard" : "/"}
          className="flex items-center gap-2 text-slate-800 no-underline group"
        >
          <div className="bg-yellow-500 p-2 rounded-lg group-hover:scale-105 transition-transform">
            <FontAwesomeIcon icon={faCar} className="text-white text-xl" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AutoLogic</h1>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {/* 1. MAIN LINKS - HIDE IF ADMIN */}
          {!isAdmin && (
            <ul className="flex gap-6 text-slate-700 font-medium list-none">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `transition-colors ${
                      isActive ? "text-yellow-500" : "hover:text-yellow-500"
                    }`
                  }
                >
                  {t("nav.home", "Home")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `transition-colors ${
                      isActive ? "text-yellow-500" : "hover:text-yellow-500"
                    }`
                  }
                >
                  {t("nav.about", "About")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/services"
                  className={({ isActive }) =>
                    `transition-colors ${
                      isActive ? "text-yellow-500" : "hover:text-yellow-500"
                    }`
                  }
                >
                  {t("nav.services", "Services")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/blog"
                  className={({ isActive }) =>
                    `transition-colors ${
                      isActive ? "text-yellow-500" : "hover:text-yellow-500"
                    }`
                  }
                >
                  {t("nav.blog", "Blog")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `transition-colors ${
                      isActive ? "text-yellow-500" : "hover:text-yellow-500"
                    }`
                  }
                >
                  {t("nav.contact", "Contact")}
                </NavLink>
              </li>
            </ul>
          )}

          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          {/* Auth & Action Buttons */}
          <div className="flex items-center gap-4">
            {/* 2. CALL TO ACTION - HIDE IF ADMIN */}
            {!isAdmin && (
              <NavLink
                to="/appointment"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
                    isActive
                      ? "bg-yellow-600 text-white shadow-md"
                      : "bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-md"
                  }`
                }
              >
                <FontAwesomeIcon icon={faCalendarCheck} />
                <span>{t("nav.appointment", "Book Now")}</span>
              </NavLink>
            )}

            {user ? (
              // Logged In View
              <div className="flex items-center gap-4">
                <NavLink
                  to="/dashboard"
                  className="flex items-center gap-2 text-slate-700 hover:text-yellow-600 font-medium"
                  title="Dashboard"
                >
                  <FontAwesomeIcon icon={faTachometerAlt} />
                  <span className="hidden lg:inline">
                    {t("nav.dashboard", "Dashboard")}
                  </span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
                </button>
              </div>
            ) : (
              // Logged Out View
              <div className="flex items-center gap-4 font-medium text-sm">
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `flex items-center gap-1 ${
                      isActive
                        ? "text-yellow-600"
                        : "text-slate-600 hover:text-yellow-600"
                    }`
                  }
                >
                  <FontAwesomeIcon icon={faUser} />
                  <span>{t("nav.login", "Login")}</span>
                </NavLink>
                <span className="text-gray-300">|</span>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `flex items-center gap-1 ${
                      isActive
                        ? "text-yellow-600"
                        : "text-slate-600 hover:text-yellow-600"
                    }`
                  }
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  <span>{t("nav.register", "Register")}</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className={`absolute top-0 w-3/4 sm:w-1/2 bg-white shadow-xl h-full p-6 flex flex-col gap-6 text-slate-700 font-medium overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h2 className="text-xl font-bold text-slate-800">Menu</h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-500 cursor-pointer"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            {/* MOBILE LINKS - HIDE IF ADMIN */}
            {!isAdmin && (
              <>
                <NavLink
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-lg ${
                      isActive ? "text-yellow-500" : "hover:text-yellow-500"
                    }`
                  }
                >
                  {t("nav.home", "Home")}
                </NavLink>
                <NavLink
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-lg ${
                      isActive ? "text-yellow-500" : "hover:text-yellow-500"
                    }`
                  }
                >
                  {t("nav.about", "About")}
                </NavLink>
                <NavLink
                  to="/services"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-lg ${
                      isActive ? "text-yellow-500" : "hover:text-yellow-500"
                    }`
                  }
                >
                  {t("nav.services", "Services")}
                </NavLink>
                <NavLink
                  to="/blog"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-lg ${
                      isActive ? "text-yellow-500" : "hover:text-yellow-500"
                    }`
                  }
                >
                  {t("nav.blog", "Blog")}
                </NavLink>
                <NavLink
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-lg ${
                      isActive ? "text-yellow-500" : "hover:text-yellow-500"
                    }`
                  }
                >
                  {t("nav.contact", "Contact")}
                </NavLink>

                <div className="h-px bg-gray-100 my-2"></div>

                {/* Mobile CTA */}
                <NavLink
                  to="/appointment"
                  onClick={() => setMenuOpen(false)}
                  className="bg-yellow-500 text-white text-center py-3 rounded-lg hover:bg-yellow-600"
                >
                  {t("nav.appointment", "Book Appointment")}
                </NavLink>
              </>
            )}

            {user ? (
              <div className="flex flex-col gap-4 mt-4">
                <div className="text-sm text-gray-500">
                  Logged in as {user.firstName} {isAdmin && "(Admin)"}
                </div>
                <NavLink
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="text-yellow-600 font-bold flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faTachometerAlt} />{" "}
                  {t("nav.dashboard", "Dashboard")}
                </NavLink>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="text-red-500 text-left flex items-center gap-2 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />{" "}
                  {t("nav.logout", "Logout")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <NavLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t("nav.login", "Login")}
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-2 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50"
                >
                  {t("nav.register", "Register")}
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
