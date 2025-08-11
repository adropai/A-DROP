# 🖥 Admin Dashboard - A-DROP Restaurant Management System

## 📋 معرفی پروژه

این پروژه یک **سیستم مدیریت جامع رستوران** است که با استفاده از جدیدترین تکنولوژی‌ها و کامپوننت‌های حرفه‌ای **Ant Design Pro** طراحی شده است. این پنل مدیریت تمام نیازهای یک رستوران مدرن را پوشش می‌دهد.

## 🛠️ تکنولوژی‌های استفاده شده

- **Next.js 14.2.15** (App Router)
- **React 18.3.1** 
- **TypeScript 5.6.3**
- **Ant Design 5.22.2** + **Pro Components 2.8.1**
- **Ant Design Charts 2.2.3** (AntV Charts)
- **Ant Design Icons 5.5.1**
- **Tailwind CSS 3.4.15**
- **React Query 4.36.1**
- **Zustand 4.5.5**
- **i18next** (چندزبانه و RTL)
- **Zod** (اعتبارسنجی)
- **Day.js** (مدیریت تاریخ)

## 📦 ساختار پروژه

```
admin-panel/
├── app/
│   ├── dashboard/          # داشبورد اصلی
│   ├── menu/              # مدیریت منو
│   ├── orders/            # مدیریت سفارشات
│   ├── customers/         # مدیریت مشتریان و کاربران
│   ├── reservation/       # سیستم رزرواسیون
│   ├── inventory/         # مدیریت انبارداری
│   ├── marketing/         # تبلیغات و نوتیفیکیشن
│   ├── analytics/         # گزارشات و تحلیل
│   ├── ai-training/       # آموزش هوش مصنوعی
│   ├── settings/          # تنظیمات عمومی
│   └── auth/              # احراز هویت
├── components/
│   ├── RootDashboard.tsx  # لایوت اصلی
│   ├── ui/               # کامپوننت‌های رابط کاربری
│   └── layout/           # کامپوننت‌های لایوت
├── lib/                  # ابزارها و یوتیلیتی‌ها
├── stores/               # مدیریت state
└── types/                # تعریف انواع TypeScript
```

## 🎯 ویژگی‌های کلیدی

### 🎨 طراحی و رابط کاربری
- **تم پیشرفته**: حالت تاریک/روشن با تنظیمات شخصی‌سازی
- **RTL/LTR Support**: پشتیبانی کامل از راست‌چین و چپ‌چین
- **Responsive Design**: سازگار با تمام دستگاه‌ها
- **Color Picker**: امکان تغییر رنگ‌بندی به‌صورت زنده
- **Sidebar Position**: امکان قرارگیری منو در سمت راست یا چپ

### 📊 داشبورد و آنالیتیکس
- **آمار لحظه‌ای**: نمایش آمار فروش، سفارشات و درآمد
- **نمودارهای تعاملی**: با استفاده از AntV Charts
- **گزارشات جامع**: روزانه، هفتگی، ماهانه
- **KPI Dashboard**: نمایش شاخص‌های کلیدی عملکرد

### 🍽️ مدیریت منو
- **ProTable پیشرفته**: جدول قدرتمند با QueryFilter
- **آپلود تصویر**: با درگ‌اند‌دراپ
- **زمان‌بندی**: کنترل زمان نمایش آیتم‌های منو
- **دسته‌بندی**: مدیریت دسته‌های مختلف غذا
- **قیمت‌گذاری**: مدیریت قیمت اصلی و تخفیفی

### 📋 مدیریت سفارشات
- **پیگیری کامل**: از ثبت تا تحویل
- **تغییر وضعیت**: workflow مدیریت سفارش
- **EditableProTable**: ویرایش سریع آیتم‌ها
- **پرینت فاکتور**: طراحی حرفه‌ای برای چاپ
- **فیلترهای پیشرفته**: LightFilter و QueryFilter

### 👥 مدیریت کاربران
- **RBAC System**: مدیریت نقش‌ها و دسترسی‌ها
- **مدیریت کاربران**: کارمندان و مشتریان
- **گروه‌بندی مشتریان**: VIP، عادی، جدید
- **ProDescriptions**: نمایش جزئیات کامل

### 📅 سیستم رزرواسیون
- **تقویم تعاملی**: نمایش رزروهای روزانه
- **مدیریت میزها**: کنترل وضعیت و ظرفیت
- **Timeline**: نمایش برنامه روزانه
- **تأیید خودکار**: workflow مدیریت رزرو

### 📦 مدیریت انبارداری
- **کنترل موجودی**: Real-time inventory tracking
- **سفارش خودکار**: هشدار کم‌موجودی
- **تاریخ انقضا**: مدیریت کالاهای فاسدشدنی
- **حرکات انبار**: ثبت ورودی/خروجی

### 📢 تبلیغات و بازاریابی
- **کمپین‌های هدفمند**: SMS، ایمیل، نوتیفیکیشن
- **مدیریت بنرها**: بنرهای تبلیغاتی
- **آنالیتیکس بازاریابی**: نرخ بازدید و کلیک
- **TreeSelect**: انتخاب مخاطبین هدف

### 🤖 هوش مصنوعی
- **آموزش مدل**: بارگذاری داده‌های آموزشی
- **تنظیم Prompt**: کنترل رفتار AI
- **گزارشات AI**: تحلیل عملکرد مدل
- **انتخاب مدل**: پشتیبانی از مدل‌های مختلف

## 🚀 راه‌اندازی پروژه

### نصب dependencies:
```bash
npm install
```

### اجرای پروژه در محیط توسعه:
```bash
npm run dev
```

### Build برای production:
```bash
npm run build
npm start
```

## 📱 نمای کلی صفحات

1. **داشبورد**: آمار کلی و نمودارهای فروش
2. **منو**: مدیریت آیتم‌های منو با آپلود تصویر
3. **سفارشات**: پیگیری کامل سفارشات
4. **مشتریان**: مدیریت پایگاه مشتریان
5. **رزرواسیون**: سیستم رزرو میز
6. **انبارداری**: کنترل موجودی و انقضا
7. **تبلیغات**: کمپین‌های بازاریابی
8. **آنالیتیکس**: گزارشات تفصیلی
9. **هوش مصنوعی**: آموزش و تنظیم AI
10. **تنظیمات**: کانفیگ عمومی سیستم

## 🎨 تنظیمات پیشرفته

### تم‌سازی:
- تغییر رنگ اصلی
- حالت تاریک/روشن
- موقعیت sidebar (راست/چپ)
- جهت layout (RTL/LTR)

### چندزبانه:
- فارسی (پیش‌فرض)
- عربی
- انگلیسی

## 📊 Dashboard Features

- **Real-time Stats**: Live sales and orders data
- **Interactive Charts**: Column, Line, Pie charts
- **Quick Actions**: Fast access to common tasks
- **Recent Orders**: Latest order overview

## 🔧 Technical Details

### Pro Components Used:
- `ProTable`: Advanced tables with filters
- `ProForm`: Professional forms
- `ProCard`: Layout components
- `ProDescriptions`: Data display
- `EditableProTable`: Inline editing

### Charts Integration:
- Column Charts for sales data
- Line Charts for trends
- Pie Charts for distributions
- Gauge Charts for KPIs

## 🔐 Security Features

- JWT Authentication
- Role-based Access Control (RBAC)
- Input validation with Zod
- XSS protection

## 🚀 Performance

- Next.js App Router for optimal performance
- Code splitting and lazy loading
- Optimized bundle size
- Fast refresh in development

## 🌟 Next Steps

- [ ] API Integration
- [ ] Database Schema (Prisma)
- [ ] Authentication System
- [ ] Payment Gateway
- [ ] Push Notifications
- [ ] Mobile App Integration

---

پروژه آماده برای استفاده و قابل توسعه برای نیازهای مختلف رستوران‌ها و کسب‌وکارهای غذایی است.
