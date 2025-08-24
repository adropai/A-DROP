// ===============================================
// 🎯 انواع TypeScript برای مدیریت تیم و شیفت‌بندی
// ===============================================

// نوع کارمند
export interface TeamMember {
  id: string;
  personalInfo: PersonalInfo;
  workInfo: WorkInfo;
  shiftSchedule: ShiftSchedule;
  performance: PerformanceMetrics;
  permissions: string[];
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
}

// اطلاعات شخصی
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  phone: string;
  avatar?: string;
  address: Address;
  emergencyContact: EmergencyContact;
  dateOfBirth: Date;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  education: string;
  documents: Document[];
}

// آدرس
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// تماس اضطراری
export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
  address?: string;
}

// مدارک
export interface Document {
  id: string;
  type: 'nationalCard' | 'resume' | 'certificate' | 'healthCard' | 'other';
  name: string;
  url: string;
  uploadDate: Date;
}

// اطلاعات کاری
export interface WorkInfo {
  employeeCode: string;
  hireDate: Date;
  department: Department;
  position: string;
  role: EmployeeRole;
  salary: SalaryInfo;
  workType: 'fullTime' | 'partTime' | 'contract' | 'intern';
  directManager?: string; // ID مدیر مستقیم
}

// بخش کاری
export type Department = 
  | 'kitchen' 
  | 'service' 
  | 'cashier' 
  | 'delivery' 
  | 'management' 
  | 'security' 
  | 'cleaning'
  | 'reception';

// اطلاعات حقوق
export interface SalaryInfo {
  baseSalary: number;
  hourlyRate?: number;
  overtimeRate?: number;
  bonuses: number;
  deductions: number;
  currency: 'IRR' | 'USD';
  paymentMethod: 'cash' | 'bank' | 'check';
  bankAccount?: string;
}

// برنامه شیفت
export interface ShiftSchedule {
  id: string;
  employeeId: string;
  type: ShiftType;
  pattern: ShiftPattern;
  workDays: WorkDay[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// نوع شیفت
export type ShiftType = 
  | 'fixed_daily'      // روزانه ثابت
  | 'rotating'         // چرخشی
  | 'weekly_pattern'   // الگو هفتگی
  | 'monthly_pattern'  // الگو ماهانه
  | 'custom';          // سفارشی

// الگوی شیفت
export interface ShiftPattern {
  id: string;
  name: string;
  description?: string;
  
  // تنظیمات زمانی پایه
  defaultStartTime: string;     // "08:00"
  defaultEndTime: string;       // "16:00"
  breakDuration: number;        // دقیقه استراحت
  
  // تنظیمات چرخش
  repeatCycle: number;          // تعداد روز تکرار (برای چرخشی)
  workDaysInCycle: number;      // تعداد روز کاری در هر چرخه
  restDaysInCycle: number;      // تعداد روز استراحت در هر چرخه
  
  // تنظیمات اضافه کاری
  allowOvertime: boolean;
  maxOvertimeHours: number;
  overtimeMultiplier: number;   // ضریب اضافه کاری
  
  // محدودیت‌های کاری
  minRestBetweenShifts: number; // حداقل ساعت استراحت بین شیفت‌ها
  maxConsecutiveDays: number;   // حداکثر روزهای متوالی کار
  
  // رنگ نمایش در تقویم
  color?: string;
}

// روز کاری
export interface WorkDay {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = یکشنبه
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  breakDuration: number; // دقیقه
  isWorkDay: boolean;
  overtime?: OvertimeInfo;
}

// اطلاعات اضافه کاری
export interface OvertimeInfo {
  maxHours: number;
  rate: number; // ضریب اضافه کاری
  autoApprove: boolean;
}

// شیفت روزانه
export interface DailyShift {
  id: string;
  employeeId: string;
  scheduleId: string;
  date: Date;
  startTime: string;
  endTime: string;
  breakDuration: number;
  actualStartTime?: string;
  actualEndTime?: string;
  actualBreakDuration?: number;
  status: ShiftStatus;
  notes?: string;
  overtime?: number; // ساعت اضافه کاری
  checkedInBy?: string; // ID کسی که چک‌این کرده
  checkedOutBy?: string; // ID کسی که چک‌اوت کرده
}

// وضعیت شیفت
export type ShiftStatus = 
  | 'scheduled'   // برنامه‌ریزی شده
  | 'started'     // شروع شده
  | 'break'       // استراحت
  | 'completed'   // تکمیل شده
  | 'absent'      // غایب
  | 'late'        // تأخیر
  | 'early_leave' // ترک زودهنگام
  | 'sick_leave'  // مرخصی استعلاجی
  | 'vacation';   // مرخصی

// نقش کارمند
export interface EmployeeRole {
  id: string;
  name: string;
  displayName: string;
  department: Department;
  permissions: string[];
  level: number; // 1: مدیر، 2: سرپرست، 3: کارمند عادی، 4: کارآموز
  description: string;
  responsibilities: string[];
  requirements: string[];
  maxMembers?: number; // حداکثر تعداد اعضا برای این نقش
  isActive: boolean;
}

// ===============================================
// 🔐 سیستم مدیریت کاربران و دسترسی‌ها
// ===============================================

// کاربر سیستم
export interface SystemUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  password?: string; // فقط در زمان ایجاد
  employeeId?: string | null; // ارتباط با کارمند
  roles: string[];
  isActive: boolean;
  lastLogin?: Date;
  settings?: {
    language: string;
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// نقش کاربری
export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: UserPermission[];
  department?: Department;
  level: number; // 1=Super Admin, 2=Admin, 3=Manager, 4=Employee
  isSystemRole: boolean; // آیا نقش سیستمی است
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define Permission as string type
export type Permission = string;

// دسترسی کاربری
export interface UserPermission {
  id: string;
  resource: string;     // نام منبع (orders, menu, staff, etc.)
  action: PermissionAction;
  scope: PermissionScope;
  conditions?: PermissionCondition[];
}

// عمل دسترسی
export type PermissionAction = 
  | 'create'   // ایجاد
  | 'read'     // خواندن
  | 'update'   // ویرایش
  | 'delete'   // حذف
  | 'execute'  // اجرا
  | 'approve'  // تأیید
  | 'export'   // خروجی
  | 'print';   // چاپ

// محدوده دسترسی
export type PermissionScope = 
  | 'all'        // همه
  | 'department' // بخش خودی
  | 'own'        // فقط خودی
  | 'team'       // تیم خودی
  | 'branch';    // شعبه خودی

// شرایط دسترسی
export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater' | 'less' | 'contains' | 'in';
  value: any;
}

// منابع سیستم
export const SYSTEM_RESOURCES = {
  // منوی اصلی
  dashboard: 'داشبورد',
  orders: 'سفارشات',
  menu: 'منو',
  customers: 'مشتریان',
  cashier: 'صندوق',
  kitchen: 'آشپزخانه',
  delivery: 'تحویل',
  reservation: 'رزرو',
  tables: 'میزها',
  inventory: 'انبار',
  
  // مدیریت تیم
  'team-management': 'مدیریت تیم',
  'team-members': 'اعضای تیم',
  'team-roles': 'نقش‌های تیم',
  'team-schedules': 'شیفت‌بندی',
  'team-analytics': 'آمار تیم',
  
  // سایر بخش‌ها
  loyalty: 'وفاداری',
  marketing: 'بازاریابی',
  analytics: 'آنالیتیکس',
  integrations: 'یکپارچه‌سازی',
  'ai-training': 'آموزش هوش مصنوعی',
  security: 'امنیت',
  support: 'پشتیبانی',
  settings: 'تنظیمات',
  
  // مدیریت سیستم
  'user-management': 'مدیریت کاربران',
  'role-management': 'مدیریت نقش‌ها',
  'permission-management': 'مدیریت دسترسی‌ها',
  'system-logs': 'لاگ‌های سیستم',
  'backup-restore': 'پشتیبان‌گیری'
} as const;

// نقش‌های پیش‌فرض سیستم
export const DEFAULT_SYSTEM_ROLES: Omit<UserRole, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'super_admin',
    displayName: 'مدیر ارشد سیستم',
    description: 'دسترسی کامل به تمام بخش‌های سیستم',
    permissions: [], // همه دسترسی‌ها
    level: 1,
    isSystemRole: true,
    isActive: true
  },
  {
    name: 'restaurant_manager',
    displayName: 'مدیر رستوران',
    description: 'مدیریت کلی رستوران',
    permissions: [],
    level: 2,
    isSystemRole: true,
    isActive: true
  },
  {
    name: 'kitchen_manager',
    displayName: 'سرپرست آشپزخانه',
    description: 'مدیریت آشپزخانه و منو',
    department: 'kitchen',
    permissions: [],
    level: 3,
    isSystemRole: true,
    isActive: true
  },
  {
    name: 'service_manager',
    displayName: 'سرپرست سرویس',
    description: 'مدیریت سرویس و گارسون‌ها',
    department: 'service',
    permissions: [],
    level: 3,
    isSystemRole: true,
    isActive: true
  },
  {
    name: 'cashier_operator',
    displayName: 'اپراتور صندوق',
    description: 'مدیریت صندوق و پرداخت‌ها',
    department: 'cashier',
    permissions: [],
    level: 4,
    isSystemRole: true,
    isActive: true
  }
];

// گروه‌بندی دسترسی‌ها برای نمایش بهتر
export const PERMISSION_GROUPS = {
  'سفارشات': ['orders'],
  'منو و غذا': ['menu', 'kitchen'],
  'مشتریان': ['customers', 'loyalty'],
  'مالی': ['cashier', 'analytics'],
  'عملیات': ['delivery', 'reservation', 'tables'],
  'انبار': ['inventory'],
  'مدیریت تیم': ['team-management', 'team-members', 'team-roles', 'team-schedules'],
  'بازاریابی': ['marketing'],
  'سیستم': ['settings', 'user-management', 'security', 'system-logs']
};

// مجوز دسترسی کامل
export interface PermissionFull {
  id: string;
  resource: string; // منبع (menu, orders, customers, etc.)
  action: PermissionActionSecond; // عمل
  conditions?: PermissionConditionSecond[]; // شرایط
  department?: Department; // محدود به بخش خاص
}

// عمل مجاز - تعریف دوم
export type PermissionActionSecond = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'approve' 
  | 'reject' 
  | 'export' 
  | 'import' 
  | 'manage';

// شرایط مجوز دوم
export interface PermissionConditionSecond {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
}

// وضعیت کارمند
export type EmployeeStatus = 
  | 'active'      // فعال
  | 'inactive'    // غیرفعال
  | 'suspended'   // تعلیق
  | 'terminated'  // اخراج
  | 'resigned'    // استعفا
  | 'retired'     // بازنشسته
  | 'on_leave';   // مرخصی

// معیارهای عملکرد
export interface PerformanceMetrics {
  attendanceRate: number; // درصد حضور
  punctualityScore: number; // امتیاز وقت‌شناسی
  customerRating: number; // رضایت مشتری
  productivityScore: number; // امتیاز بهره‌وری
  teamworkRating: number; // کار تیمی
  lastEvaluation: Date;
  evaluations: PerformanceEvaluation[];
}

// ارزیابی عملکرد
export interface PerformanceEvaluation {
  id: string;
  employeeId: string;
  evaluatorId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  scores: {
    attendance: number;
    punctuality: number;
    productivity: number;
    teamwork: number;
    customerService: number;
    overall: number;
  };
  comments: string;
  goals: string[];
  achievements: string[];
  improvements: string[];
  date: Date;
}

// آمار تیم
export interface TeamStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  totalSalary: number;
  averagePerformance: number;
  departmentStats: DepartmentStats[];
  shiftCoverage: ShiftCoverage[];
  topPerformers: TeamMember[];
  attendanceRate: number;
  turnoverRate: number;
}

// آمار بخش
export interface DepartmentStats {
  department: Department;
  employeeCount: number;
  averageSalary: number;
  averagePerformance: number;
  attendanceRate: number;
}

// پوشش شیفت
export interface ShiftCoverage {
  date: Date;
  shifts: {
    morning: number;
    evening: number;
    night: number;
  };
  totalRequired: number;
  totalScheduled: number;
  coverageRate: number;
}

// فرم‌های Store (اولیه)
export interface TeamMemberForm {
  personalInfo: Omit<PersonalInfo, 'documents'>;
  workInfo: Omit<WorkInfo, 'employeeCode' | 'role'>;
  roleId: string;
  permissions?: string[];
}

export interface ShiftScheduleForm {
  employeeId: string;
  type: ShiftType;
  pattern: Omit<ShiftPattern, 'id'>;
  workDays: WorkDay[];
  startDate: Date;
  endDate?: Date;
}

// فرم کاربر سیستم
export interface SystemUserForm {
  username: string;
  email: string;
  password?: string;
  teamMemberId: string;
  roleIds: string[];
  isActive: boolean;
  mustChangePassword: boolean;
}

// فرم نقش کاربری
export interface UserRoleForm {
  name: string;
  displayName: string;
  description?: string;
  department?: Department;
  level: number;
  permissionIds: string[];
  isActive: boolean;
}

export interface EmployeeRoleForm {
  name: string;
  displayName: string;
  department: Department;
  permissions: string[];
  level: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
}

// فیلترها
export interface TeamFilter {
  department?: Department;
  status?: EmployeeStatus;
  role?: string;
  hireDate?: {
    from: Date;
    to: Date;
  };
  performance?: {
    min: number;
    max: number;
  };
}

export interface ShiftFilter {
  employeeId?: string;
  department?: Department;
  date?: {
    from: Date;
    to: Date;
  };
  status?: ShiftStatus;
  type?: ShiftType;
}

// Constants
export const DEPARTMENT_LABELS: Record<Department, string> = {
  kitchen: 'آشپزخانه',
  service: 'سرویس',
  cashier: 'صندوق',
  delivery: 'تحویل',
  management: 'مدیریت',
  security: 'امنیت',
  cleaning: 'نظافت',
  reception: 'پذیرش'
};

export const SHIFT_TYPE_LABELS: Record<ShiftType, string> = {
  fixed_daily: 'روزانه ثابت',
  rotating: 'چرخشی',
  weekly_pattern: 'الگو هفتگی',
  monthly_pattern: 'الگو ماهانه',
  custom: 'سفارشی'
};

export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  scheduled: 'برنامه‌ریزی شده',
  started: 'شروع شده',
  break: 'استراحت',
  completed: 'تکمیل شده',
  absent: 'غایب',
  late: 'تأخیر',
  early_leave: 'ترک زودهنگام',
  sick_leave: 'مرخصی استعلاجی',
  vacation: 'مرخصی'
};

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'فعال',
  inactive: 'غیرفعال',
  suspended: 'تعلیق',
  terminated: 'اخراج',
  resigned: 'استعفا',
  retired: 'بازنشسته',
  on_leave: 'مرخصی'
};

// نقش‌های پیش‌فرض
export const DEFAULT_ROLES: EmployeeRole[] = [
  {
    id: 'kitchen_chef',
    name: 'chef',
    displayName: 'سرآشپز',
    department: 'kitchen',
    permissions: [],
    level: 2,
    description: 'مسئول آشپزخانه و تهیه غذا',
    responsibilities: ['تهیه غذا', 'مدیریت آشپزخانه', 'کنترل کیفیت'],
    requirements: ['تجربه آشپزی', 'مدرک بهداشت'],
    isActive: true
  },
  {
    id: 'service_waiter',
    name: 'waiter',
    displayName: 'گارسون',
    department: 'service',
    permissions: [],
    level: 3,
    description: 'سرویس‌دهی به مشتریان',
    responsibilities: ['گرفتن سفارش', 'سرو غذا', 'ارتباط با مشتری'],
    requirements: ['مهارت ارتباطی', 'ظاهر مناسب'],
    isActive: true
  },
  {
    id: 'cashier_operator',
    name: 'cashier',
    displayName: 'صندوقدار',
    department: 'cashier',
    permissions: [],
    level: 3,
    description: 'مدیریت پرداخت‌ها و صندوق',
    responsibilities: ['دریافت پرداخت', 'صدور فاکتور', 'مدیریت صندوق'],
    requirements: ['دقت بالا', 'مهارت محاسباتی'],
    isActive: true
  }
];

// ===============================================
// 📝 Form Types for Create/Update Operations
// ===============================================

export interface TeamMemberCreateForm {
  personalInfo: Omit<PersonalInfo, 'documents'>;
  workInfo: Omit<WorkInfo, 'employeeCode' | 'role'>;
  roleId: string;
  permissions?: string[];
}

export interface EmployeeRoleCreateForm {
  name: string;
  displayName: string;
  department: Department;
  permissions?: string[];
  level: number;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
}

export interface ShiftScheduleCreateForm {
  employeeId: string;
  type: ShiftType;
  pattern: Omit<ShiftPattern, 'id'>;
  workDays: WorkDay[];
  startDate: Date;
  endDate?: Date;
}
