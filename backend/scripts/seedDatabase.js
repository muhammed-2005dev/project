const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from your .env file
dotenv.config({ path: "./.env" });

// Import simplified models
const User = require("../models/User");
const Service = require("../models/Service");
const Blog = require("../models/Blog");
const Booking = require("../models/Booking");
const Contact = require("../models/Contact");

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Removed default fallback
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

// SIMPLIFIED sample data
const sampleData = {
  users: [
    {
      firstName: "Admin",
      lastName: "User",
      email: "admin@autologic.com",
      phone: "1234567890",
      password: "admin123456",
      role: "admin",
    },
    {
      firstName: "Ahmed",
      lastName: "Al-Rashid",
      email: "ahmed@example.com",
      phone: "1234567891",
      password: "user123456",
      role: "user",
    },
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@example.com",
      phone: "1234567892",
      password: "user123456",
      role: "user",
    },
  ],

  services: [
    {
      name: "Engine Repair",
      description: "Professional engine repair and maintenance services.",
      category: "Engine",
      price: 200,
      duration: 180, // Duration in minutes (Number)
      isActive: true,
      images: [
        {
          url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500",
          publicId: "engine-repair-1",
          alt: "Engine Repair Service",
        },
      ],
    },
    {
      name: "Transmission Service",
      description:
        "Complete transmission service including repair and maintenance.",
      category: "Transmission",
      price: 300,
      duration: 240, // Duration in minutes (Number)
      isActive: true,
      images: [
        {
          url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
          publicId: "transmission-1",
          alt: "Transmission Service",
        },
      ],
    },
    {
      name: "Brake System",
      description: "Complete brake system inspection, repair, and maintenance.",
      category: "Brakes",
      price: 150,
      duration: 90, // Duration in minutes (Number)
      isActive: true,
      images: [],
    },
  ],

  blogs: [
    {
      title: "10 Essential Car Maintenance Tips",
      content:
        "Regular maintenance is crucial for keeping your car running smoothly...",
      excerpt: "Essential maintenance tips for car owners",
      category: "Tips",
      tags: ["maintenance", "tips", "car care"],
      author: null, // Will be set after users are created
      status: "published",
      isPublic: true,
      isFeatured: true,
      featuredImage: {
        url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500",
        publicId: "maintenance-tips-1",
        alt: "Car Maintenance",
      },
    },
  ],
};

// Seed database function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding..."); // Clear existing data from simplified models

    await User.deleteMany({});
    await Service.deleteMany({});
    await Blog.deleteMany({});
    await Booking.deleteMany({});
    await Contact.deleteMany({}); // We deleted Project and Review, so no need to clear them
    console.log("🗑️ Cleared existing data"); // Create users

    const users = [];
    for (const userData of sampleData.users) {
      const user = new User(userData);
      await user.save(); // The 'pre-save' hook in User.js will hash the password
      users.push(user);
      console.log(`👤 Created user: ${user.email}`);
    } // Create services

    const services = [];
    for (const serviceData of sampleData.services) {
      const service = new Service(serviceData);
      await service.save();
      services.push(service);
      console.log(`🔧 Created service: ${service.name}`);
    } // Create blogs (link to admin user)

    const blogs = [];
    const adminUser = users.find((u) => u.role === "admin");
    for (const blogData of sampleData.blogs) {
      const blog = new Blog({
        ...blogData,
        author: adminUser._id,
      });
      await blog.save();
      blogs.push(blog);
      console.log(`📝 Created blog: ${blog.title}`);
    } // We removed Projects and Reviews, so no need to create them
    console.log("✅ Database seeding completed successfully!");
    console.log(
      `📊 Created: ${users.length} users, ${services.length} services, ${blogs.length} blogs`
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
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
