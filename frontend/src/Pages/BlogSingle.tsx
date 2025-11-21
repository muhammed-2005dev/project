import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faUser,
  faArrowLeft,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { blogAPI } from "../services/api";
import toast from "react-hot-toast";

const BlogSingle: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const isRTL = i18n.language === "ar";

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true);
      const response = await blogAPI.getById(postId);
      setPost(response.data.data.post);
    } catch (error) {
      console.error("Error fetching post:", error);
      setError(true);
      toast.error("Failed to load blog post");
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-4xl text-yellow-500 animate-spin"
        />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Post Not Found</h2>
        <NavLink to="/blog" className="text-yellow-600 hover:underline">
          Back to Blog
        </NavLink>
      </div>
    );
  }

  // Determine Image URL (Featured or First in Gallery)
  const imageUrl =
    post.featuredImage?.url ||
    (post.images && post.images.length > 0 ? post.images[0].url : null) ||
    "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200";

  const authorName = post.author?.firstName
    ? `${post.author.firstName} ${post.author.lastName}`
    : "Admin";

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Breadcrumb */}
      <div className="bg-white border-b py-4">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <NavLink to="/" className="hover:text-yellow-600">
              {t("nav.home")}
            </NavLink>
            <span>/</span>
            <NavLink to="/blog" className="hover:text-yellow-600">
              {t("nav.blog")}
            </NavLink>
            <span>/</span>
            <span className="text-gray-800 line-clamp-1">{post.title}</span>
          </nav>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Featured Image */}
                <div className="relative h-64 md:h-96 bg-gray-200">
                  <img
                    src={imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {post.category}
                  </div>
                </div>

                {/* Article Header */}
                <div className="p-8">
                  <h1 className="text-3xl font-bold text-slate-800 mb-4">
                    {post.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendar} />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} />
                      <span>{authorName}</span>
                    </div>
                  </div>

                  {/* Article Content */}
                  {/* Note: Since we don't have a rich text editor, we just display the text. 
                      If you add one later, you can use dangerouslySetInnerHTML */}
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </div>

                  {/* Article Actions */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t">
                    <NavLink
                      to="/blog"
                      className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                      {t("blog.backToBlog")}
                    </NavLink>
                  </div>
                </div>
              </article>
            </div>

            {/* Sidebar (Newsletter Only - Related Posts Removed) */}
            <div className="space-y-8">
              <div className="bg-slate-900 text-white rounded-lg p-6 sticky top-24">
                <h3
                  className={`text-xl font-bold mb-4 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("blog.newsletter")}
                </h3>
                <p
                  className={`text-gray-300 mb-4 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("blog.newsletterText")}
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder={t("blog.emailPlaceholder")}
                    className={`w-full px-4 py-2 rounded-lg text-slate-300 border-2 border-slate-300 focus:border-yellow-500 focus:outline-none ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  />
                  <button className="w-full bg-yellow-500 text-white py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors cursor-pointer">
                    {t("blog.subscribe")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogSingle;
