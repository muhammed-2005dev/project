import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faUser, faArrowLeft, faShare, faHeart } from '@fortawesome/free-solid-svg-icons';

const BlogSingle: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const isRTL = i18n.language === 'ar';

  // Mock blog post data - in real app, this would come from API
  const blogPost = {
    id: 1,
    title: isRTL ? 'أهم النصائح لصيانة سيارتك في الشتاء' : 'Essential Winter Car Maintenance Tips',
    content: isRTL ? `
      <p>مع قدوم فصل الشتاء، تحتاج سيارتك إلى عناية خاصة لحمايتها من البرد والرطوبة. في هذا المقال، سنقدم لك أهم النصائح والخطوات التي يجب اتباعها لصيانة سيارتك خلال فصل الشتاء.</p>
      
      <h3>1. فحص البطارية</h3>
      <p>البطارية هي من أكثر الأجزاء تأثراً بالبرد. تأكد من فحص مستوى الشحن واتصالات البطارية. إذا كانت البطارية قديمة، فكر في استبدالها قبل بداية الشتاء.</p>
      
      <h3>2. فحص الإطارات</h3>
      <p>تأكد من أن الإطارات في حالة جيدة ولها عمق كافٍ للتماسك على الطرق المبللة. فكر في استخدام إطارات شتوية إذا كنت تعيش في منطقة باردة.</p>
      
      <h3>3. فحص نظام التدفئة</h3>
      <p>تأكد من أن نظام التدفئة يعمل بشكل صحيح. هذا مهم ليس فقط لراحتك، بل أيضاً لإزالة الضباب من الزجاج الأمامي.</p>
      
      <h3>4. فحص السوائل</h3>
      <p>تأكد من أن جميع السوائل في المستوى المطلوب، خاصة سائل التبريد وسائل المساحات. استخدم سوائل مقاومة للتجمد.</p>
      
      <h3>5. فحص الإضاءة</h3>
      <p>تأكد من أن جميع المصابيح تعمل بشكل صحيح. الإضاءة الجيدة مهمة جداً في الشتاء عندما تكون الرؤية محدودة.</p>
      
      <p>باتباع هذه النصائح، ستضمن أن سيارتك جاهزة لمواجهة تحديات فصل الشتاء بأمان.</p>
    ` : `
      <p>As winter approaches, your car needs special care to protect it from cold and humidity. In this article, we'll provide you with the most important tips and steps to follow for maintaining your car during winter.</p>
      
      <h3>1. Battery Check</h3>
      <p>The battery is one of the parts most affected by cold. Make sure to check the charge level and battery connections. If the battery is old, consider replacing it before winter begins.</p>
      
      <h3>2. Tire Check</h3>
      <p>Make sure your tires are in good condition and have sufficient tread depth for grip on wet roads. Consider using winter tires if you live in a cold area.</p>
      
      <h3>3. Heating System Check</h3>
      <p>Make sure the heating system is working properly. This is important not only for your comfort, but also for removing fog from the windshield.</p>
      
      <h3>4. Fluid Check</h3>
      <p>Make sure all fluids are at the required level, especially coolant and windshield washer fluid. Use antifreeze fluids.</p>
      
      <h3>5. Lighting Check</h3>
      <p>Make sure all lights are working properly. Good lighting is very important in winter when visibility is limited.</p>
      
      <p>By following these tips, you'll ensure your car is ready to face winter challenges safely.</p>
    `,
    image: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    date: isRTL ? '15 يناير 2025' : 'January 15, 2025',
    author: isRTL ? 'أحمد محمد' : 'Ahmed Mohamed',
    category: isRTL ? 'صيانة' : 'Maintenance',
    readTime: isRTL ? '5 دقائق قراءة' : '5 min read'
  };

  const relatedPosts = [
    {
      id: 2,
      title: isRTL ? 'كيفية اختيار الإطارات المناسبة لسيارتك' : 'How to Choose the Right Tires for Your Car',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      date: isRTL ? '12 يناير 2025' : 'January 12, 2025'
    },
    {
      id: 3,
      title: isRTL ? 'علامات تحذيرية في سيارتك لا يجب تجاهلها' : 'Warning Signs in Your Car You Shouldn\'t Ignore',
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      date: isRTL ? '10 يناير 2025' : 'January 10, 2025'
    },
    {
      id: 4,
      title: isRTL ? 'فوائد تغيير زيت المحرك بانتظام' : 'Benefits of Regular Engine Oil Changes',
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      date: isRTL ? '8 يناير 2025' : 'January 8, 2025'
    }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Breadcrumb */}
      <div className="bg-white border-b py-4">
        <div className="max-w-4xl mx-auto px-6">
          <nav className={`flex items-center gap-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <NavLink to="/" className="hover:text-yellow-600">{t('nav.home')}</NavLink>
            <span>/</span>
            <NavLink to="/blog" className="hover:text-yellow-600">{t('nav.blog')}</NavLink>
            <span>/</span>
            <span className="text-gray-800">{blogPost.title}</span>
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
                <div className="relative">
                  <img 
                    src={blogPost.image} 
                    alt={blogPost.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {blogPost.category}
                  </div>
                </div>

                {/* Article Header */}
                <div className="p-8">
                  <h1 className="text-3xl font-bold text-slate-800 mb-4">{blogPost.title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendar} />
                      <span>{blogPost.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} />
                      <span>{blogPost.author}</span>
                    </div>
                    <span>{blogPost.readTime}</span>
                  </div>

                  {/* Article Content */}
                  <div 
                    className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: blogPost.content }}
                  />

                  {/* Article Actions */}
                  <div className={`flex items-center justify-between mt-8 pt-6 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <NavLink
                      to="/blog"
                      className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                      {t('blog.backToBlog')}
                    </NavLink>
                    
                    <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                        <FontAwesomeIcon icon={faHeart} />
                        <span>{t('blog.like')}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                        <FontAwesomeIcon icon={faShare} />
                        <span>{t('blog.share')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Related Posts */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className={`text-xl font-bold text-slate-800 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('blog.relatedPosts')}</h3>
                <div className="space-y-4">
                  {relatedPosts.map((post) => (
                    <NavLink
                      key={post.id}
                      to={`/blog/${post.id}`}
                      className={`flex gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <h4 className="font-medium text-slate-800 line-clamp-2 mb-1">{post.title}</h4>
                        <p className="text-sm text-gray-500">{post.date}</p>
                      </div>
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-slate-900 text-white rounded-lg p-6">
                <h3 className={`text-xl font-bold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('blog.newsletter')}</h3>
                <p className={`text-gray-300 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('blog.newsletterText')}
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder={t('blog.emailPlaceholder')}
                    className={`w-full px-4 py-2 rounded-lg text-slate-800 focus:ring-2 focus:ring-yellow-500 focus:outline-none ${isRTL ? 'text-right' : 'text-left'}`}
                  />
                  <button className="w-full bg-yellow-500 text-white py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors">
                    {t('blog.subscribe')}
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
