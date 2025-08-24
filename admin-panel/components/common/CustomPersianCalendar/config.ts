// 🎯 Preset Configurations for Custom Persian Calendar
import { PresetConfig, PresetType } from './types';

export const PRESET_CONFIGS: Record<PresetType, PresetConfig> = {
  default: {
    placeholder: 'انتخاب تاریخ',
    quickActions: true,
    format: 'jYYYY/jMM/jDD',
    size: 'middle'
  },
  
  birthDate: {
    placeholder: 'تاریخ تولد',
    disableFuture: true,
    showHolidays: false,
    quickActions: true,
    format: 'jYYYY/jMM/jDD',
    size: 'middle'
  },
  
  reservation: {
    placeholder: 'انتخاب تاریخ رزرو',
    disablePast: true,
    showHolidays: true,
    quickActions: true,
    format: 'jYYYY/jMM/jDD',
    size: 'middle'
  },
  
  expiry: {
    placeholder: 'تاریخ انقضا',
    disablePast: true,
    showHolidays: false,
    quickActions: true,
    format: 'jYYYY/jMM/jDD',
    size: 'middle'
  },
  
  appointment: {
    placeholder: 'تاریخ قرار ملاقات',
    disablePast: true,
    showHolidays: true,
    quickActions: true,
    format: 'jYYYY/jMM/jDD',
    size: 'middle'
  },
  
  event: {
    placeholder: 'تاریخ رویداد',
    showHolidays: true,
    quickActions: true,
    format: 'jYYYY/jMM/jDD',
    size: 'middle'
  },
  
  deadline: {
    placeholder: 'ضرب‌الاجل',
    disablePast: true,
    showHolidays: false,
    quickActions: true,
    format: 'jYYYY/jMM/jDD',
    size: 'middle'
  }
};

/**
 * دریافت تنظیمات پیش‌فرض برای نوع مشخص
 */
export const getPresetConfig = (preset: PresetType): PresetConfig => {
  return { ...PRESET_CONFIGS[preset] };
};

/**
 * ادغام تنظیمات پیش‌فرض با تنظیمات سفارشی
 */
export const mergeWithPreset = (
  preset: PresetType,
  customConfig: Partial<PresetConfig>
): PresetConfig => {
  const presetConfig = getPresetConfig(preset);
  return { ...presetConfig, ...customConfig };
};

// Theme Configurations
export const THEME_CONFIGS = {
  light: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    textColor: '#2d3748',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.1)'
  },
  
  dark: {
    primaryColor: '#90cdf4',
    secondaryColor: '#9f7aea',
    backgroundColor: 'rgba(45, 55, 72, 0.95)',
    textColor: '#e2e8f0',
    borderColor: 'rgba(74, 85, 104, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.3)'
  },
  
  auto: {
    // Will be determined by system preference
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    textColor: '#2d3748',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.1)'
  }
};

// Animation Configurations
export const ANIMATION_CONFIGS = {
  slideIn: {
    type: 'slide' as const,
    direction: 'up' as const,
    duration: 400,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
  },
  
  fadeIn: {
    type: 'fade' as const,
    duration: 300,
    easing: 'ease-in-out'
  },
  
  scaleIn: {
    type: 'scale' as const,
    duration: 250,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// Default Calendar Settings
export const DEFAULT_SETTINGS = {
  locale: 'fa' as const,
  theme: 'auto' as const,
  animation: ANIMATION_CONFIGS.slideIn,
  showWeekNumbers: false,
  showHolidays: true,
  quickActions: true,
  allowKeyboardNavigation: true,
  autoClose: true,
  highlightToday: true,
  highlightWeekends: true
};
