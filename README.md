# AutoLogic - Car Services Website

A comprehensive car services website with multilingual support (Arabic/English) and full-stack integration.

## Features

### Frontend
- **React + TypeScript** with Vite
- **Tailwind CSS** for styling
- **Multi-language support** (Arabic RTL / English LTR)
- **Responsive design** for all devices
- **API integration** with fallback to mock data
- **Modern UI components** with FontAwesome icons

### Backend
- **Express.js** MVC architecture
- **MongoDB** with Mongoose ODM
- **JWT authentication** and authorization
- **Cloudinary** integration for file uploads
- **Multilingual database** support
- **RESTful API** endpoints

### Pages
- **Home** - Landing page with hero, services, and features
- **About** - Company information and team
- **Services** - Service listings with API integration
- **Blog** - Blog posts with multilingual content
- **Contact** - Contact form and information
- **Login/Register** - User authentication
- **Dashboard** - Admin panel for CRUD operations
- **Appointment** - Booking system
- **Pricing** - Service pricing information

## Getting Started

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp env.example .env
# Edit .env with your MongoDB and Cloudinary credentials
```

4. Start the server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Database Seeding

To populate the database with sample multilingual data:

```bash
cd backend
node seed.js
```

## API Integration

The frontend automatically falls back to mock data when the backend is unavailable, ensuring the website works in all scenarios.

### API Endpoints

- **Services**: `/api/v1/services`
- **Blog**: `/api/v1/blog`
- **Projects**: `/api/v1/projects`
- **Reviews**: `/api/v1/reviews`
- **Bookings**: `/api/v1/bookings`
- **Auth**: `/api/v1/auth`
- **Contact**: `/api/v1/contact`
- **Upload**: `/api/v1/upload`

## Multilingual Support

- **Arabic (RTL)** - Default language
- **English (LTR)** - Secondary language
- **Database** - Stores content in both languages
- **Frontend** - Dynamic language switching
- **Backend** - RTL/LTR aware responses

## Technology Stack

### Frontend
- React 19.1.1
- TypeScript
- Tailwind CSS 4.1.15
- React Router DOM 7.9.4
- React i18next (internationalization)
- Axios (API communication)
- React Hook Form
- React Hot Toast
- FontAwesome Icons

### Backend
- Express.js 4.18.2
- MongoDB with Mongoose 8.0.3
- JWT Authentication
- Cloudinary (file uploads)
- Bcryptjs (password hashing)
- Express Validator
- Helmet (security)
- Morgan (logging)

## Development Notes

- The frontend uses mock data when the backend is unavailable
- All components support RTL/LTR layouts
- Database models include both Arabic and English fields
- API responses are language-aware
- Admin dashboard provides full CRUD operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
