import { PersianDatePickerProps } from './types';

/**
 * تنظیمات پیش‌فرض برای PersianDatePicker
 */
export const defaultPersianDatePickerConfig: Partial<PersianDatePickerProps> = {
  format: 'YYYY/MM/DD',
  size: 'middle',
  allowClear: false,
  disabled: false,
  disablePast: false,
  placeholder: 'انتخاب تاریخ'
};

/**
 * تنظیمات مخصوص حالت‌های مختلف
 */
export const presetConfigs = {
  // تاریخ تولد - اجازه انتخاب تاریخ‌های گذشته
  birthDate: {
    ...defaultPersianDatePickerConfig,
    placeholder: 'تاریخ تولد',
    disablePast: false,
    allowClear: true
  },

  // رزرو - فقط تاریخ‌های آینده
  reservation: {
    ...defaultPersianDatePickerConfig,
    placeholder: 'تاریخ رزرو',
    disablePast: true,
    allowClear: false,
    size: 'large' as const
  },

  // تاریخ انقضا - تاریخ‌های آینده
  expiry: {
    ...defaultPersianDatePickerConfig,
    placeholder: 'تاریخ انقضا',
    disablePast: true,
    allowClear: true
  },

  // تاریخ استخدام
  employment: {
    ...defaultPersianDatePickerConfig,
    placeholder: 'تاریخ استخدام',
    disablePast: false,
    allowClear: true
  },

  // فیلتر تاریخ در گزارش‌ها
  filter: {
    ...defaultPersianDatePickerConfig,
    placeholder: 'انتخاب تاریخ',
    disablePast: false,
    allowClear: true,
    size: 'small' as const
  }
};

/**
 * تابع کمکی برای دریافت تنظیمات preset
 */
export function getPresetConfig(preset: keyof typeof presetConfigs): Partial<PersianDatePickerProps> {
  return presetConfigs[preset] || defaultPersianDatePickerConfig;
}
