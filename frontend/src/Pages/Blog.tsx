import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faUser, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { blogAPI } from '../services/api';
import toast from 'react-hot-toast';

const Blog: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [blogs, activeFilter]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      // const mockBlogs = [
      //   {
      //     _id: '1',
      //     title: 'How to Choose the Right Car Service Center',
      //     titleAr: 'كيفية اختيار مركز خدمة السيارات المناسب',
      //     excerpt: 'A guide to choosing a reliable service center',
      //     excerptAr: 'دليل لاختيار مركز خدمة موثوق',
      //     category: 'Guide',
      //     categoryAr: 'دليل',
      //     author: { name: 'Admin', nameAr: 'المدير' },
      //     createdAt: '2024-01-15',
      //     images: [{ url: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=500' }]
      //   },
      //   {
      //     _id: '2',
      //     title: '10 Essential Tips for Car Maintenance',
      //     titleAr: '10 نصائح أساسية لصيانة السيارة',
      //     excerpt: 'Basic maintenance tips for car owners',
      //     excerptAr: 'نصائح صيانة أساسية لأصحاب السيارات',
      //     category: 'Maintenance',
      //     categoryAr: 'صيانة',
      //     author: { name: 'Admin', nameAr: 'المدير' },
      //     createdAt: '2024-01-10',
      //     images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500' }]
      //   },
      //   {
      //     _id: '3',
      //     title: 'Warning Signs in Your Car You Shouldn\'t Ignore',
      //     titleAr: 'علامات تحذيرية في سيارتك لا يجب تجاهلها',
      //     excerpt: 'Important signs that need immediate attention',
      //     excerptAr: 'علامات مهمة تحتاج إلى انتباه فوري',
      //     category: 'Tips',
      //     categoryAr: 'نصائح',
      //     author: { name: 'Admin', nameAr: 'المدير' },
      //     createdAt: '2024-01-05',
      //     images: [{ url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500' }]
      //   },
      //   {
      //     _id: '4',
      //     title: 'Benefits of Regular Engine Oil Changes',
      //     titleAr: 'فوائد تغيير زيت المحرك بانتظام',
      //     excerpt: 'Why you should change engine oil regularly',
      //     excerptAr: 'لماذا يجب تغيير زيت المحرك بانتظام',
      //     category: 'Maintenance',
      //     categoryAr: 'صيانة',
      //     author: { name: 'Admin', nameAr: 'المدير' },
      //     createdAt: '2024-01-01',
      //     images: [{ url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500' }]
      //   },
      //   {
      //     _id: '5',
      //     title: 'Complete Guide to Tire Maintenance',
      //     titleAr: 'دليل شامل لصيانة الإطارات',
      //     excerpt: 'How to take care of your car tires',
      //     excerptAr: 'كيفية العناية بإطارات سيارتك',
      //     category: 'Guide',
      //     categoryAr: 'دليل',
      //     author: { name: 'Admin', nameAr: 'المدير' },
      //     createdAt: '2023-12-28',
      //     images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500' }]
      //   },
      //   {
      //     _id: '6',
      //     title: 'Tips for Safe Winter Driving',
      //     titleAr: 'نصائح لقيادة آمنة في الشتاء',
      //     excerpt: 'How to drive safely in cold weather',
      //     excerptAr: 'كيفية القيادة بأمان في الطقس البارد',
      //     category: 'Tips',
      //     categoryAr: 'نصائح',
      //     author: { name: 'Admin', nameAr: 'المدير' },
      //     createdAt: '2023-12-20',
      //     images: [{ url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500' }]
      //   }
      // ];
      const response = await blogAPI.getAll();
      console.log(response.data.data.posts);
      setBlogs(response.data.data.posts.map((blog) => blog._doc));
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error(isRTL ? 'فشل في تحميل المقالات' : 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const filterBlogs = () => {
    if (activeFilter === 0) {
      // Show all posts
      setFilteredBlogs(blogs);
    } else {
      // Filter by category
      const filterCategories = ['All Posts', 'maintenance', 'Guide', 'Tips'];
      const selectedCategory = filterCategories[activeFilter];
      const filtered = blogs.filter(blog => {
        return blog.category === selectedCategory;
      });
      setFilteredBlogs(filtered);
    }
  };

  const handleFilterClick = (index) => {
    setActiveFilter(index);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      toast.success(isRTL ? 'تم الاشتراك بنجاح!' : 'Successfully subscribed!');
      setEmail('');
    } else {
      toast.error(isRTL ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
    }
  };

  const getBlogData = (blog) => {
    if (isRTL) {
      return {
        title: blog.titleAr || blog.title,
        excerpt: blog.excerptAr || blog.excerpt,
        category: blog.categoryAr || blog.category,
        author: blog.author?.nameAr || blog.author?.name || 'Admin'
      };
    }
    return {
      title: blog.title,
      excerpt: blog.excerpt,
      category: blog.category,
      author: blog.author?.name || 'Admin'
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const categories = isRTL 
    ? ['جميع المقالات', 'صيانة', 'دليل', 'نصائح']
    : ['All Posts', 'Maintenance', 'Guide', 'Tips'];

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('blog.title')}</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">{t('blog.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => handleFilterClick(index)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  activeFilter === index
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-yellow-500 hover:text-white'
                }`}
              >
                {category}
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-500 text-lg">
                {isRTL ? 'لا توجد مقالات في هذه الفئة' : 'No posts found in this category'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => {
                const blogData = getBlogData(blog);
                const imageUrl = blog.images?.[0]?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500';
                
                return (
                  <article key={blog._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="relative">
                      <img 
                        src={imageUrl} 
                        alt={blogData.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {blogData.category}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">
                        {blogData.title}
                      </h2>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {blogData.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCalendar} />
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faUser} />
                          <span>{blogData.author}</span>
                        </div>
                      </div>
                      
                      <NavLink
                        to={`/blog/${blog._id}`}
                        className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium"
                      >
                        {isRTL ? 'اقرأ المزيد' : 'Read More'}
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
            {isRTL ? 'اشترك في نشرتنا الإخبارية' : 'Subscribe to Our Newsletter'}
          </h2>
          <p className="text-gray-300 mb-8">
            {isRTL 
              ? 'احصل على أحدث المقالات والنصائح حول صيانة السيارات مباشرة في بريدك الإلكتروني'
              : 'Get the latest articles and car maintenance tips delivered directly to your email'
            }
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              className="flex-1 px-4 py-3 rounded-lg text-slate-800 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              required
            />
            <button 
              type="submit"
              className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
            >
              {isRTL ? 'اشترك' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Blog;
