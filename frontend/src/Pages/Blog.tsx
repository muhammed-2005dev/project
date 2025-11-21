import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faUser,
  faArrowRight,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { blogAPI } from "../services/api";
import toast from "react-hot-toast";

const Blog: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeCategory, setActiveCategory] = useState("All");
  const [email, setEmail] = useState("");

  // Categories matching your Model
  const categories = [
    "All",
    "Maintenance",
    "Repair",
    "Tips",
    "News",
    "Reviews",
    "Guides",
    "Other",
  ];

  useEffect(() => {
    fetchBlogs();
  }, [activeCategory]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const params: any = { limit: 50 };
      if (activeCategory !== "All") {
        params.category = activeCategory.toLowerCase(); // Backend expects lowercase
      }

      const response = await blogAPI.getAll(params);
      setBlogs(response.data.data.posts);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success(isRTL ? "تم الاشتراك بنجاح!" : "Successfully subscribed!");
      setEmail("");
    } else {
      toast.error(
        isRTL ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email"
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t("blog.title")}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t("blog.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-yellow-500 hover:text-white"
                } cursor-pointer`}
              >
                {t(`blog.categories.${category.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-4xl text-yellow-500 animate-spin"
              />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-500 text-lg">
                {isRTL
                  ? "لا توجد مقالات في هذه الفئة"
                  : "No posts found in this category"}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => {
                // Image Logic: Check featuredImage first, then images array
                const imageUrl =
                  blog.featuredImage?.url ||
                  (blog.images && blog.images.length > 0
                    ? blog.images[0].url
                    : null) ||
                  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500";

                const authorName = blog.author?.firstName
                  ? `${blog.author.firstName} ${blog.author.lastName}`
                  : "Admin";

                return (
                  <article
                    key={blog._id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
                  >
                    <div className="relative h-48 bg-gray-200">
                      <img
                        src={imageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                        {blog.category}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h2 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">
                        {blog.title}
                      </h2>

                      <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                        {blog.excerpt}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCalendar} />
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faUser} />
                          <span>{authorName}</span>
                        </div>
                      </div>

                      <NavLink
                        to={`/blog/${blog._id}`} // Or /blog/slug/blog.slug if you prefer
                        className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium mt-auto"
                      >
                        {isRTL ? "اقرأ المزيد" : "Read More"}
                        <FontAwesomeIcon icon={faArrowRight} />
                      </NavLink>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isRTL
              ? "اشترك في نشرتنا الإخبارية"
              : "Subscribe to Our Newsletter"}
          </h2>
          <p className="text-gray-300 mb-8">
            {isRTL
              ? "احصل على أحدث المقالات والنصائح حول صيانة السيارات مباشرة في بريدك الإلكتروني"
              : "Get the latest articles and car maintenance tips delivered directly to your email"}
          </p>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email"}
              className="flex-1 px-4 py-3 rounded-lg text-slate-300 ring-2 focus:ring-yellow-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors cursor-pointer"
            >
              {isRTL ? "اشترك" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Blog;
