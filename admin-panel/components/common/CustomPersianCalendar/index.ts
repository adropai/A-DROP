// 🎯 Custom Persian Calendar - Main Export File

export { default as CustomPersianCalendar } from './CustomPersianCalendar';
export { default as CalendarHeader } from './CalendarHeader';
export { default as CalendarGrid } from './CalendarGrid';
export { default as QuickActions } from './QuickActions';

// Types
export type {
  CustomPersianCalendarProps,
  CalendarDay,
  CalendarMonth,
  CalendarState,
  PersianHoliday,
  PresetType,
  PresetConfig,
  MonthYearSelectorProps,
  QuickActionsProps,
  CalendarGridProps,
  DateButtonProps,
  AnimationType,
  AnimationDirection,
  AnimationConfig
} from './types';

// Utils
export {
  getTodayPersian,
  formatPersianDate,
  convertPersianToGregorian,
  convertGregorianToPersian,
  getPersianDayName,
  isValidPersianDate,
  isWeekend,
  isHoliday,
  comparePersianDates,
  isDateInRange,
  generateCalendarGrid,
  parsePersianDateInput,
  getAvailableYears,
  toPersianDigits,
  toEnglishDigits,
  getDateDifference,
  addToDate,
  subtractFromDate,
  PERSIAN_MONTHS,
  PERSIAN_DAYS,
  PERSIAN_DAYS_FULL,
  IRANIAN_HOLIDAYS
} from './utils';

// Config
export {
  getPresetConfig,
  mergeWithPreset,
  PRESET_CONFIGS,
  THEME_CONFIGS,
  ANIMATION_CONFIGS,
  DEFAULT_SETTINGS
} from './config';

// Default export
export { default } from './CustomPersianCalendar';
