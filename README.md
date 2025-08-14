# 🍽️ A-DROP Restaurant Management System

یک سیستم مدیریت رستوران کامل و مدرن با Next.js و TypeScript

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📖 درباره پروژه

A-DROP یک سیستم جامع مدیریت رستوران است که شامل:

### ✅ **بخش‌های تکمیل شده (5 فاز کامل):**
- 🎛️ **پنل ادمین** - مدیریت کامل رستوران (100% کامل - 24 صفحه)
- 🔐 **احراز هویت** - سیستم JWT و امنیت (100% کامل)
- 👥 **نقش‌ها و دسترسی‌ها** - 59 دسترسی در 17 ماژول (100% کامل)
- 🍽️ **مدیریت منو** - CRUD کامل منو و آیتم‌ها (100% کامل)
- 📋 **مدیریت سفارشات** - ثبت و پیگیری سفارشات (100% کامل)
- 👩‍🍳 **مدیریت آشپزخانه** - سیستم فیش‌ها و department ها (100% کامل)
- 🪑 **مدیریت میزها** - سیستم رزرو و QR کد (100% کامل)
- 👥 **مدیریت مشتریان** - CRM پیشرفته (100% کامل)
- 💰 **سیستم صندوق** - POS کامل (100% کامل)
- 📊 **آنالیتیکس** - گزارش‌گیری و نمودارها (100% کامل)
- � **برنامه وفاداری** - سیستم امتیاز (100% کامل)

### ⏳ **بخش‌های در حال توسعه (فاز 6):**
- 🤖 **AI Server** - هوش مصنوعی و تحلیل (طراحی شده)
- 🏢 **Multi-Branch** - مدیریت چند شعبه (طراحی شده)
- �🌐 **وب‌سایت** - نمایش منو و اطلاعات (در انتظار)
- 📱 **اپلیکیشن مشتری** - سفارش‌گیری آنلاین (در انتظار)
- 👨‍💼 **پنل سوپرادمین** - مدیریت چندین رستوران (در انتظار)
- 🔧 **Backend** - API و دیتابیس (در انتظار)

## 🏗️ ساختار پروژه

```
A-DROP/
├── admin-panel/          # پنل مدیریت رستوران (Next.js + TypeScript)
├── website/             # وب‌سایت رستوران (Next.js)
├── customer-app/        # اپلیکیشن مشتری (React Native / PWA)
├── superadmin-panel/    # پنل سوپرادمین (Next.js)
├── backend/            # API Backend (Node.js + Prisma)
├── ai-server/          # سرور هوش مصنوعی (Python/Node.js)
└── docs/              # مستندات پروژه
```

## 🚀 شروع سریع

### پیش‌نیازها
- Node.js 18+
- npm یا yarn
- PostgreSQL (برای production)

### نصب و راه‌اندازی

1. **Clone کردن پروژه:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/A-DROP.git
   cd A-DROP
   ```

2. **نصب dependencies:**
   ```bash
   # پنل ادمین
   cd admin-panel
   npm install
   npm run dev
   
   # در terminal جدید - Backend
   cd ../backend
   npm install
   npm run dev
   
   # در terminal جدید - Website
   cd ../website
   npm install
   npm run dev
   ```

3. **تنظیم environment variables:**
   ```bash
   # در هر پوشه، فایل .env.local ایجاد کنید
   cp .env.example .env.local
   ```

## 🎯 فیچرها

### پنل ادمین
- ✅ مدیریت منو و غذاها
- ✅ سیستم سفارش‌گیری
- ✅ مدیریت مشتریان
- ✅ گزارش‌گیری و آنالیتیکس
- ✅ مدیریت کارکنان
- ✅ سیستم احراز هویت
- ✅ مدیریت میزها و رزرو
- ✅ سیستم پرداخت

### Backend API
- ✅ RESTful API
- ✅ Authentication & Authorization
- ✅ Database با Prisma ORM
- ✅ Real-time notifications
- ✅ File upload
- ✅ Payment integration

### AI Features
- 🔄 تحلیل فروش
- 🔄 پیش‌بینی تقاضا
- 🔄 توصیه منو
- 🔄 بهینه‌سازی قیمت

## 🛠️ تکنولوژی‌های استفاده شده

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **Ant Design** - UI Components
- **Tailwind CSS** - Styling
- **Zustand** - State Management

### Backend
- **Node.js** - Runtime
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication

### DevOps & Tools
- **Git** - Version Control
- **ESLint** - Code Quality
- **Prettier** - Code Formatting

## 📊 Performance

### بهینه‌سازی‌های انجام شده:
- ✅ Tree shaking برای کاهش bundle size
- ✅ Lazy loading components
- ✅ Image optimization
- ✅ Code splitting
- ✅ Cache strategies

### Benchmarks:
- **Development Server**: ~3-5 ثانیه startup
- **Build Time**: ~30-45 ثانیه
- **Bundle Size**: ~2-3 MB (optimized)

## 🚦 مراحل توسعه

### ✅ مرحله 1 - Core Business Logic (تکمیل شده)
- ✅ پنل ادمین اصلی
- ✅ سیستم authentication و authorization
- ✅ مدیریت کامل منو و آیتم‌ها
- ✅ سیستم سفارش‌گیری و مدیریت سفارشات
- ✅ مدیریت آشپزخانه و department ها
- ✅ سیستم میزها و QR کد
- ✅ Dashboard و آنالیتیکس پایه
- ✅ سیستم مجوزها و نقش‌های کاربری

### 🔄 مرحله 2 - Frontend Integration & Advanced Features (در حال توسعه)
- بهینه‌سازی performance و UI/UX
- تست‌های جامع و integration testing
- Documentation کامل
- Mobile responsiveness
- Advanced Analytics
- Customer Management
- Loyalty Programs

### 📋 مرحله 3 - آینده
- اپلیکیشن موبایل
- پنل سوپرادمین
- AI features پیشرفته
- Multi-tenant architecture

## 🤝 مشارکت

1. Fork کنید
2. Branch جدید ایجاد کنید (`git checkout -b feature/amazing-feature`)
3. Commit کنید (`git commit -m 'Add amazing feature'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request ایجاد کنید

## � گزارش کامل پروژه

برای مطالعه گزارش تفصیلی وضعیت پروژه، فازهای تکمیل شده، و اطلاعات فنی کامل:

👉 **[مطالعه گزارش جامع پروژه](./final-pro.md)**

این گزارش شامل:
- ✅ تحلیل کامل 5 فاز تکمیل شده
- 📊 آمار و معیارهای عملکرد
- 🎯 نقشه راه فاز 6
- 🔧 مشخصات فنی تفصیلی
- 📈 Timeline و برنامه‌ریزی

## �📝 مجوز

این پروژه تحت مجوز MIT منتشر شده است.

## 📞 تماس

برای سوالات و پشتیبانی:
- Email: support@adrop.ir
- GitHub Issues: [مشکلات](https://github.com/YOUR_USERNAME/A-DROP/issues)

---

**ساخته شده با ❤️ برای رستوران‌های ایران**
