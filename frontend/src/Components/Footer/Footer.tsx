import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faGoogle,
} from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from "react-i18next";
import { blogAPI, servicesAPI } from "../../services/api";

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch 2 recent blogs
        const blogsRes = await blogAPI.getAll({ limit: 2 });
        setRecentPosts(blogsRes.data.data.posts);

        // Fetch 6 services
        const servicesRes = await servicesAPI.getAll({ limit: 6 });
        setServices(servicesRes.data.data.services);
      } catch (error) {
        console.error("Failed to load footer data", error);
      }
    };
    fetchData();
  }, []);

  return (
    <footer
      className={`w-full bg-slate-900 text-gray-300 pt-16 pb-9 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* First Column: About + Social media links */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">AutoLogic</h2>
          <p className="text-sm leading-7 mb-4">{t("footer.description")}</p>

          <div className="flex gap-3 mt-5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-yellow-500 transition-colors"
            >
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-yellow-500 transition-colors"
            >
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-yellow-500 transition-colors"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a
              href="https://google.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-yellow-500 transition-colors"
            >
              <FontAwesomeIcon icon={faGoogle} />
            </a>
          </div>
        </div>

        {/* Second Column : Recent posts (Dynamic) */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            {t("footer.recentPosts")}
          </h3>

          {recentPosts.length > 0 ? (
            recentPosts.map((post) => {
              const imageUrl =
                post.featuredImage?.url ||
                post.images?.[0]?.url ||
                "https://via.placeholder.com/150";
              return (
                <NavLink
                  to={`/blog/${post._id}`}
                  key={post._id}
                  className="flex gap-3 mb-4 group"
                >
                  <img
                    src={imageUrl}
                    alt={post.title}
                    className="w-23 h-17 w-16 h-12 object-cover rounded-md flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium group-hover:text-yellow-500 transition-colors line-clamp-2">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(post.createdAt).toLocaleDateString(
                        isRTL ? "ar-EG" : "en-US"
                      )}
                    </p>
                  </div>
                </NavLink>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">No recent posts</p>
          )}
        </div>

        {/* Third Column: Address */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            {t("footer.address")}
          </h3>
          <p className="text-sm mb-4">
            {isRTL ? "عنوان المكتب الرئيسي" : "Head Office Address"}
          </p>

          <ul className="text-sm list-none">
            <li className="flex gap-2 mb-3">
              <FontAwesomeIcon
                icon={faLocationDot}
                className="text-yellow-500 mt-1"
              />
              <p>{t("topbar.address")}</p>
            </li>
            <li className="flex gap-2 mb-3">
              <FontAwesomeIcon
                icon={faPhone}
                className="text-yellow-500 mt-1"
              />
              <p>{`${t("contact.phone")}: ${t("contact.phoneNumber")}`}</p>
            </li>
            <li className="flex gap-2 mb-3">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-yellow-500 mt-1"
              />
              <p>{`${t("contact.email")}: ${t("contact.emailAddress")}`}</p>
            </li>
          </ul>
        </div>

        {/* Fourth Column: Services (Dynamic) */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            {t("footer.services")}
          </h3>
          <ul className="text-sm list-none">
            {services.length > 0 ? (
              services.map((service) => (
                <li key={service._id}>
                  <NavLink
                    // Navigate to Services page, ideally scroll to or filter (for now just link to page)
                    to="/services"
                    className="flex items-center gap-2 text-gray-300 hover:text-yellow-500 transition-colors duration-300 mb-2"
                  >
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    {service.name}
                  </NavLink>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No services available</li>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom line */}
      <div className="max-w-7xl mx-auto px-6 mt-10 border-t border-gray-700 pt-4 text-sm text-center text-gray-400">
        © 2025 AutoLogic. {t("footer.rights")}.
      </div>
    </footer>
  );
};

export default Footer;
