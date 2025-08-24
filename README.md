# 🍕 A-DROP - Advanced Restaurant Management System

## 📋 Overview
A-DROP is a comprehensive restaurant management system built with **Next.js 14**, **TypeScript**, and **Antd v5**, featuring a complete **team management system**, order processing, inventory management, and advanced analytics.

## ✨ Key Features

### 🎯 Team Management System
- **Employee Management**: Complete CRUD operations for team members
- **Role-Based Access Control**: Advanced permission system with customizable roles
- **User Management**: System user accounts with role assignments
- **Shift Scheduling**: Dynamic shift patterns and scheduling system
- **Performance Tracking**: Employee performance metrics and analytics

### 🍽️ Restaurant Operations
- **Order Management**: Real-time order processing and kitchen display
- **Menu Management**: Dynamic menu items with categories and pricing
- **Inventory Control**: Stock management with automated alerts
- **Customer Management**: CRM system with loyalty programs
- **Table Management**: Reservation and table status tracking

### 📊 Analytics & Reporting
- **Real-time Dashboard**: Live metrics and KPI tracking
- **Sales Analytics**: Revenue tracking and profit analysis
- **Performance Reports**: Detailed operational insights
- **Staff Analytics**: Team performance and productivity metrics

## 🛠️ Technical Stack

### Frontend
- **Next.js 14** - App Router with TypeScript
- **Antd v5** - Modern UI component library with RTL support
- **Zustand** - State management
- **TailwindCSS** - Utility-first CSS framework

### Backend
- **Next.js API Routes** - RESTful API endpoints
- **Prisma ORM** - Database management
- **TypeScript** - Type-safe development

### Database
- **PostgreSQL** - Primary database (production ready)
- **SQLite** - Development database

## 🚀 Getting Started

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation
```bash
# Clone the repository
git clone https://github.com/adrop-app/project.git
cd project/A-DROP/admin-panel

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run seed

# Start development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL="your_database_url"
NEXTAUTH_SECRET="your_secret_key"
NEXTAUTH_URL="http://localhost:3000"
```

## 📁 Project Structure

```
A-DROP/
├── admin-panel/           # Main admin dashboard
│   ├── app/              # Next.js 14 app directory
│   │   ├── api/          # API routes
│   │   ├── team-management/ # Team management pages
│   │   └── ...           # Other feature pages
│   ├── components/       # Reusable UI components
│   ├── stores/          # Zustand state management
│   ├── types/           # TypeScript definitions
│   ├── lib/             # Utility functions
│   └── prisma/          # Database schema and migrations
├── customer-app/        # Customer-facing application
├── superadmin-panel/    # Super admin interface
└── website/            # Marketing website
```

## 🎯 Team Management Features

### Employee Management
- ✅ Complete employee profiles with personal and work information
- ✅ Document management (ID cards, certificates, etc.)
- ✅ Emergency contact information
- ✅ Salary and compensation tracking

### Role & Permission System
- ✅ Hierarchical role structure (Admin → Supervisor → Employee → Intern)
- ✅ Granular permission control (users:*, roles:*, team:*, etc.)
- ✅ Department-based access control
- ✅ Maximum member limits per role

### User Account Management
- ✅ System user creation and management
- ✅ Role assignment and permission inheritance
- ✅ Account activation/deactivation
- ✅ Password management and security

### Shift & Scheduling
- ✅ Dynamic shift patterns (fixed, rotating, weekly, monthly)
- ✅ Overtime calculation and management
- ✅ Break time scheduling
- ✅ Calendar integration with Persian date support

## 🔧 API Endpoints

### Team Management
```
GET    /api/team-management/members     # List all team members
POST   /api/team-management/members     # Create new member
PUT    /api/team-management/members/:id # Update member
DELETE /api/team-management/members/:id # Delete member

GET    /api/team-management/roles       # List all roles
POST   /api/team-management/roles       # Create new role
PUT    /api/team-management/roles/:id   # Update role
DELETE /api/team-management/roles/:id   # Delete role

GET    /api/team-management/users       # List system users
POST   /api/team-management/users       # Create user
PUT    /api/team-management/users/:id   # Update user
DELETE /api/team-management/users/:id   # Delete user
```

### Orders & Operations
```
GET    /api/orders          # List orders
POST   /api/orders          # Create order
PUT    /api/orders/:id      # Update order
DELETE /api/orders/:id      # Cancel order

GET    /api/menu/items      # Menu items
GET    /api/inventory       # Inventory status
GET    /api/analytics       # Analytics data
```

## 🎨 UI Components

### Team Management Interface
- **Employee Table**: Sortable, filterable employee list
- **Role Management**: Permission matrix with drag-and-drop
- **User Dashboard**: Account management interface
- **Detail Drawers**: Comprehensive information panels
- **Form Modals**: Create/edit interfaces with validation

### Design System
- **Persian RTL Support**: Complete right-to-left layout
- **Responsive Design**: Mobile-first approach
- **Dark/Light Themes**: User preference support
- **Accessibility**: WCAG 2.1 AA compliance

## 🔐 Security Features

- **JWT Authentication**: Secure session management
- **Role-Based Authorization**: Granular access control
- **Input Validation**: Comprehensive data sanitization
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: API abuse prevention

## 📱 Mobile Support

- **Responsive Design**: Works on all device sizes
- **Touch Optimized**: Mobile-friendly interactions
- **Offline Support**: PWA capabilities
- **Push Notifications**: Real-time updates

## 🚀 Performance

- **Next.js 14**: Latest performance optimizations
- **Code Splitting**: Automatic bundle optimization
- **Image Optimization**: Next.js image component
- **Caching Strategy**: Redis integration ready
- **Database Optimization**: Prisma query optimization

## 🛡️ Type Safety

- **100% TypeScript**: Full type coverage
- **Strict Mode**: Enhanced type checking
- **API Type Safety**: End-to-end type validation
- **Component Props**: Fully typed React components

## 🔄 Development Workflow

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript compilation check

# Database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database
```

## 📊 Current Status

✅ **Completed Features**:
- Team Management System (100%)
- TypeScript Error Resolution (105 errors fixed)
- UI Components with Antd v5
- API Endpoints and Data Models
- State Management with Zustand
- RTL Support for Persian

🚧 **In Progress**:
- Advanced Analytics Dashboard
- Mobile Application
- Payment Gateway Integration
- Real-time Notifications

📋 **Planned Features**:
- Multi-branch Support
- Advanced Reporting
- AI-powered Analytics
- Integration Hub

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- 📧 Email: support@adrop-app.com
- 💬 Discord: [A-DROP Community](https://discord.gg/adrop)
- 📱 Telegram: [@adrop_support](https://t.me/adrop_support)

## 🙏 Acknowledgments

- **Antd Team** - For the amazing UI component library
- **Next.js Team** - For the powerful React framework
- **Vercel** - For hosting and deployment solutions
- **Community Contributors** - For feedback and contributions

---

**Built with ❤️ by the A-DROP Team**

🌟 **Star us on GitHub if this project helped you!**
