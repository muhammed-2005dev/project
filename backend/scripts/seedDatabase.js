const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: './env.example' });

// Import models
const User = require('../models/User');
const Service = require('../models/Service');
const Project = require('../models/Project');
const Blog = require('../models/Blog');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autologic', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Sample data with Arabic and English content
const sampleData = {
  users: [
    {
      name: 'Admin User',
      email: 'admin@autologic.com',
      password: 'admin123456',
      role: 'admin'
    },
    {
      name: 'Ahmed Al-Rashid',
      email: 'ahmed@example.com',
      password: 'user123456',
      role: 'user'
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: 'user123456',
      role: 'user'
    }
  ],

  services: [
    {
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
  ],

  projects: [
    {
      title: 'BMW Engine Overhaul',
      titleAr: 'إصلاح شامل لمحرك BMW',
      description: 'Complete engine overhaul for BMW 320i including piston replacement and timing belt change.',
      descriptionAr: 'إصلاح شامل لمحرك BMW 320i يشمل تغيير المكابس وحزام التوقيت.',
      service: null, // Will be set after services are created
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
      isFeatured: true
    },
    {
      title: 'Mercedes Transmission Repair',
      titleAr: 'إصلاح ناقل حركة مرسيدس',
      description: 'Professional transmission repair for Mercedes C-Class with warranty.',
      descriptionAr: 'إصلاح ناقل حركة مرسيدس C-Class مهني مع ضمان.',
      service: null,
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
      isFeatured: true
    }
  ],

  blogs: [
    {
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
      author: null, // Will be set after users are created
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
      ]
    },
    {
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
      author: null,
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
      ]
    }
  ],

  reviews: [
    {
      rating: 5,
      comment: 'Excellent service! The team was professional and completed the work on time.',
      commentAr: 'خدمة ممتازة! الفريق كان مهنياً وأنجز العمل في الوقت المحدد.',
      user: null, // Will be set after users are created
      service: null, // Will be set after services are created
      isActive: true,
      isFeatured: true
    },
    {
      rating: 4,
      comment: 'Good service, reasonable prices. Would recommend to others.',
      commentAr: 'خدمة جيدة، أسعار معقولة. أنصح الآخرين بها.',
      user: null,
      service: null,
      isActive: true,
      isFeatured: false
    }
  ]
};

// Seed database function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Project.deleteMany({});
    await Blog.deleteMany({});
    await Review.deleteMany({});
    await Booking.deleteMany({});
    await Contact.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleData.users) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`👤 Created user: ${user.name}`);
    }

    // Create services
    const services = [];
    for (const serviceData of sampleData.services) {
      const service = new Service(serviceData);
      await service.save();
      services.push(service);
      console.log(`🔧 Created service: ${service.name}`);
    }

    // Create projects (link to services)
    const projects = [];
    for (let i = 0; i < sampleData.projects.length; i++) {
      const projectData = { ...sampleData.projects[i] };
      projectData.service = services[i % services.length]._id;
      
      const project = new Project(projectData);
      await project.save();
      projects.push(project);
      console.log(`🚗 Created project: ${project.title}`);
    }

    // Create blogs (link to admin user)
    const blogs = [];
    const adminUser = users.find(u => u.role === 'admin');
    for (const blogData of sampleData.blogs) {
      const blog = new Blog({
        ...blogData,
        author: adminUser._id
      });
      await blog.save();
      blogs.push(blog);
      console.log(`📝 Created blog: ${blog.title}`);
    }

    // Create reviews (link to users and services)
    const reviews = [];
    const regularUsers = users.filter(u => u.role === 'user');
    for (let i = 0; i < sampleData.reviews.length; i++) {
      const reviewData = { ...sampleData.reviews[i] };
      reviewData.user = regularUsers[i % regularUsers.length]._id;
      reviewData.service = services[i % services.length]._id;
      
      const review = new Review(reviewData);
      await review.save();
      reviews.push(review);
      console.log(`⭐ Created review: ${review.comment.substring(0, 30)}...`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created: ${users.length} users, ${services.length} services, ${projects.length} projects, ${blogs.length} blogs, ${reviews.length} reviews`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await seedDatabase();
  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { seedDatabase, sampleData };
