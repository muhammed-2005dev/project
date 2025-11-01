// Mock Data Service for Frontend Development
// This provides sample data when the backend is not available

export const mockServices = [
  {
    _id: '1',
    name: 'Engine Repair',
    nameAr: 'إصلاح المحرك',
    description: 'Professional engine repair and maintenance services using the latest technology and equipment.',
    descriptionAr: 'خدمات إصلاح وصيانة المحرك المهنية باستخدام أحدث التقنيات والمعدات.',
    category: 'Engine',
    categoryAr: 'المحرك',
    price: 200,
    priceAr: 'من 200 ريال',
    duration: '2-4 hours',
    durationAr: '2-4 ساعات',
    isActive: true,
    isFeatured: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500',
        publicId: 'engine-repair-1',
        alt: 'Engine Repair Service',
        altAr: 'خدمة إصلاح المحرك'
      }
    ]
  },
  {
    _id: '2',
    name: 'Transmission Service',
    nameAr: 'خدمة ناقل الحركة',
    description: 'Complete transmission service including repair, maintenance, and fluid changes.',
    descriptionAr: 'خدمة ناقل الحركة الكاملة تشمل الإصلاح والصيانة وتغيير السوائل.',
    category: 'Transmission',
    categoryAr: 'ناقل الحركة',
    price: 300,
    priceAr: 'من 300 ريال',
    duration: '3-5 hours',
    durationAr: '3-5 ساعات',
    isActive: true,
    isFeatured: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        publicId: 'transmission-1',
        alt: 'Transmission Service',
        altAr: 'خدمة ناقل الحركة'
      }
    ]
  },
  {
    _id: '3',
    name: 'Brake System',
    nameAr: 'نظام المكابح',
    description: 'Complete brake system inspection, repair, and maintenance for your safety.',
    descriptionAr: 'فحص وإصلاح وصيانة نظام المكابح الكامل لضمان سلامتك.',
    category: 'Brakes',
    categoryAr: 'المكابح',
    price: 150,
    priceAr: 'من 150 ريال',
    duration: '1-2 hours',
    durationAr: '1-2 ساعة',
    isActive: true,
    isFeatured: false,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        publicId: 'brakes-1',
        alt: 'Brake System Service',
        altAr: 'خدمة نظام المكابح'
      }
    ]
  },
  {
    _id: '4',
    name: 'Tire Service',
    nameAr: 'خدمة الإطارات',
    description: 'Tire replacement, balancing, alignment, and pressure check services.',
    descriptionAr: 'خدمات تغيير وموازنة ومحاذاة الإطارات وفحص الضغط.',
    category: 'Tires',
    categoryAr: 'الإطارات',
    price: 100,
    priceAr: 'من 100 ريال',
    duration: '1 hour',
    durationAr: 'ساعة واحدة',
    isActive: true,
    isFeatured: false,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        publicId: 'tires-1',
        alt: 'Tire Service',
        altAr: 'خدمة الإطارات'
      }
    ]
  },
  {
    _id: '5',
    name: 'Battery Service',
    nameAr: 'خدمة البطارية',
    description: 'Battery testing, replacement, and charging system maintenance.',
    descriptionAr: 'فحص وتغيير البطارية وصيانة نظام الشحن.',
    category: 'Electrical',
    categoryAr: 'الكهرباء',
    price: 250,
    priceAr: 'من 250 ريال',
    duration: '30 minutes',
    durationAr: '30 دقيقة',
    isActive: true,
    isFeatured: false,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        publicId: 'battery-1',
        alt: 'Battery Service',
        altAr: 'خدمة البطارية'
      }
    ]
  },
  {
    _id: '6',
    name: 'AC Service',
    nameAr: 'خدمة التكييف',
    description: 'Air conditioning system maintenance, repair, and gas refilling.',
    descriptionAr: 'صيانة وإصلاح نظام تكييف الهواء وتعبئة الغاز.',
    category: 'AC',
    categoryAr: 'التكييف',
    price: 180,
    priceAr: 'من 180 ريال',
    duration: '2-3 hours',
    durationAr: '2-3 ساعات',
    isActive: true,
    isFeatured: false,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        publicId: 'ac-1',
        alt: 'AC Service',
        altAr: 'خدمة التكييف'
      }
    ]
  }
];

export const mockBlogs = [
  {
    _id: '1',
    title: '10 Essential Car Maintenance Tips',
    titleAr: '10 نصائح أساسية لصيانة السيارة',
    content: 'Regular maintenance is crucial for keeping your car running smoothly and safely. Here are 10 essential tips every car owner should know...',
    contentAr: 'الصيانة الدورية ضرورية للحفاظ على عمل السيارة بسلاسة وأمان. إليك 10 نصائح أساسية يجب أن يعرفها كل مالك سيارة...',
    excerpt: 'Essential maintenance tips for car owners',
    excerptAr: 'نصائح صيانة أساسية لأصحاب السيارات',
    category: 'Maintenance',
    categoryAr: 'الصيانة',
    tags: ['maintenance', 'tips', 'car care'],
    tagsAr: ['صيانة', 'نصائح', 'عناية بالسيارة'],
    author: {
      name: 'Admin User',
      nameAr: 'المدير'
    },
    status: 'published',
    isPublic: true,
    isFeatured: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500',
        publicId: 'maintenance-tips-1',
        alt: 'Car Maintenance',
        altAr: 'صيانة السيارة',
        position: 0
      }
    ],
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: '2',
    title: 'How to Choose the Right Car Service Center',
    titleAr: 'كيفية اختيار مركز خدمة السيارات المناسب',
    content: 'Choosing the right service center is important for your car\'s health and your peace of mind. Here\'s what to look for...',
    contentAr: 'اختيار مركز الخدمة المناسب مهم لصحة سيارتك وراحة بالك. إليك ما يجب البحث عنه...',
    excerpt: 'Guide to choosing a reliable service center',
    excerptAr: 'دليل لاختيار مركز خدمة موثوق',
    category: 'Guide',
    categoryAr: 'دليل',
    tags: ['service center', 'guide', 'choosing'],
    tagsAr: ['مركز خدمة', 'دليل', 'اختيار'],
    author: {
      name: 'Admin User',
      nameAr: 'المدير'
    },
    status: 'published',
    isPublic: true,
    isFeatured: false,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        publicId: 'service-center-1',
        alt: 'Service Center',
        altAr: 'مركز خدمة',
        position: 0
      }
    ],
    createdAt: '2024-01-10T14:30:00Z'
  }
];

export const mockProjects = [
  {
    _id: '1',
    title: 'BMW Engine Overhaul',
    titleAr: 'إصلاح شامل لمحرك BMW',
    description: 'Complete engine overhaul for BMW 320i including piston replacement and timing belt change.',
    descriptionAr: 'إصلاح شامل لمحرك BMW 320i يشمل تغيير المكابس وحزام التوقيت.',
    service: {
      _id: '1',
      name: 'Engine Repair',
      nameAr: 'إصلاح المحرك'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500',
        publicId: 'bmw-engine-1',
        alt: 'BMW Engine Overhaul',
        altAr: 'إصلاح شامل لمحرك BMW',
        position: 0
      },
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        publicId: 'bmw-engine-2',
        alt: 'BMW Engine Parts',
        altAr: 'قطع محرك BMW',
        position: 1
      }
    ],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-20T09:00:00Z'
  },
  {
    _id: '2',
    title: 'Mercedes Transmission Repair',
    titleAr: 'إصلاح ناقل حركة مرسيدس',
    description: 'Professional transmission repair for Mercedes C-Class with warranty.',
    descriptionAr: 'إصلاح ناقل حركة مرسيدس C-Class مهني مع ضمان.',
    service: {
      _id: '2',
      name: 'Transmission Service',
      nameAr: 'خدمة ناقل الحركة'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        publicId: 'mercedes-transmission-1',
        alt: 'Mercedes Transmission',
        altAr: 'ناقل حركة مرسيدس',
        position: 0
      }
    ],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-18T11:30:00Z'
  }
];

export const mockReviews = [
  {
    _id: '1',
    rating: 5,
    comment: 'Excellent service! The team was professional and completed the work on time.',
    commentAr: 'خدمة ممتازة! الفريق كان مهنياً وأنجز العمل في الوقت المحدد.',
    user: {
      name: 'Ahmed Al-Rashid',
      nameAr: 'أحمد الراشد'
    },
    service: {
      _id: '1',
      name: 'Engine Repair',
      nameAr: 'إصلاح المحرك'
    },
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-22T16:00:00Z'
  },
  {
    _id: '2',
    rating: 4,
    comment: 'Good service, reasonable prices. Would recommend to others.',
    commentAr: 'خدمة جيدة، أسعار معقولة. أنصح الآخرين بها.',
    user: {
      name: 'Sarah Johnson',
      nameAr: 'سارة جونسون'
    },
    service: {
      _id: '2',
      name: 'Transmission Service',
      nameAr: 'خدمة ناقل الحركة'
    },
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-21T14:30:00Z'
  }
];

// Mock API functions that return promises
export const mockAPI = {
  services: {
    getAll: () => Promise.resolve({
      data: {
        data: {
          services: mockServices
        }
      }
    }),
    getById: (id) => Promise.resolve({
      data: {
        data: {
          service: mockServices.find(s => s._id === id)
        }
      }
    })
  },
  blogs: {
    getAll: () => Promise.resolve({
      data: {
        data: {
          blogs: mockBlogs
        }
      }
    }),
    getById: (id) => Promise.resolve({
      data: {
        data: {
          blog: mockBlogs.find(b => b._id === id)
        }
      }
    })
  },
  projects: {
    getAll: () => Promise.resolve({
      data: {
        data: {
          projects: mockProjects
        }
      }
    }),
    getById: (id) => Promise.resolve({
      data: {
        data: {
          project: mockProjects.find(p => p._id === id)
        }
      }
    })
  },
  reviews: {
    getAll: () => Promise.resolve({
      data: {
        data: {
          reviews: mockReviews
        }
      }
    })
  }
};
