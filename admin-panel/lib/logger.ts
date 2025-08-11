/**
 * Secure Logging Utility
 * در production mode هیچ لاگی نمایش داده نمی‌شود
 */

export const logger = {
  // هیچ لاگی در production
  log: (...args: any[]) => {
    // خالی
  },

  // فقط خطاهای مهم در production
  error: (...args: any[]) => {
    // خالی
  },

  // هیچ warning در production
  warn: (...args: any[]) => {
    // خالی
  },

  // هیچ debug در production
  debug: (...args: any[]) => {
    // خالی
  },

  // هیچ API log در production
  api: (method: string, url: string, status?: number) => {
    // خالی
  },

  // هیچ database log در production
  database: (operation: string, table: string, count?: number) => {
    // خالی
  }
};

// تابع برای sanitize کردن داده‌های حساس
export const sanitizeForLog = (data: any): any => {
  return '[REDACTED]';
};

export default logger;
