// 🎯 Custom Persian Calendar Types & Interfaces

export interface CalendarDay {
  day: number;
  month: number;
  year: number;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  isDisabled: boolean;
  isOtherMonth: boolean;
  persianDate: string;
  gregorianDate: Date;
  holidayName?: string;
}

export interface CalendarMonth {
  year: number;
  month: number;
  monthName: string;
  days: CalendarDay[];
}

export interface CustomPersianCalendarProps {
  value?: string;
  onChange?: (date: string, gregorianDate: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  format?: string;
  allowClear?: boolean;
  disablePast?: boolean;
  disableFuture?: boolean;
  showToday?: boolean;
  showHolidays?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
  style?: React.CSSProperties;
  locale?: 'fa' | 'en';
  theme?: 'light' | 'dark' | 'auto';
  quickActions?: boolean;
  showWeekNumbers?: boolean;
  onMonthChange?: (year: number, month: number) => void;
  onYearChange?: (year: number) => void;
}

export interface PersianHoliday {
  date: string; // Format: MM/DD
  name: string;
  type: 'national' | 'religious' | 'international';
  isOfficial: boolean;
}

export interface CalendarState {
  isOpen: boolean;
  inputValue: string;
  displayMonth: number;
  displayYear: number;
  selectedDate: string | null;
  hoveredDate: string | null;
  isLoading: boolean;
  quickActionActive: string | null;
}

export interface MonthYearSelectorProps {
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  minDate?: string;
  maxDate?: string;
  locale: 'fa' | 'en';
}

export interface QuickActionsProps {
  onToday: () => void;
  onClear: (e?: React.MouseEvent) => void;
  onClose?: () => void;
  onNextMonth?: () => void;
  onPrevMonth?: () => void;
  onNextYear?: () => void;
  onPrevYear?: () => void;
  disabled?: boolean;
  showClear?: boolean;
}

export interface CalendarGridProps {
  year: number;
  month: number;
  selectedDate: string | null;
  onDateSelect: (date: string, gregorianDate: Date) => void;
  disablePast?: boolean;
  disableFuture?: boolean;
  minDate?: string;
  maxDate?: string;
  showHolidays?: boolean;
  hoveredDate?: string | null;
  onDateHover?: (date: string | null) => void;
}

export interface DateButtonProps {
  day: CalendarDay;
  onClick: (date: string, gregorianDate: Date) => void;
  onHover?: (date: string | null) => void;
  size?: 'small' | 'middle' | 'large';
  showHolidayName?: boolean;
}

// Animation Types
export type AnimationDirection = 'left' | 'right' | 'up' | 'down';
export type AnimationType = 'slide' | 'fade' | 'scale' | 'flip';

export interface AnimationConfig {
  type: AnimationType;
  direction?: AnimationDirection;
  duration: number;
  easing: string;
}

// Preset Configurations
export type PresetType = 
  | 'default'
  | 'birthDate'
  | 'reservation'
  | 'expiry'
  | 'appointment'
  | 'event'
  | 'deadline';

export interface PresetConfig {
  placeholder: string;
  disablePast?: boolean;
  disableFuture?: boolean;
  showHolidays?: boolean;
  quickActions?: boolean;
  format?: string;
  size?: 'small' | 'middle' | 'large';
}
