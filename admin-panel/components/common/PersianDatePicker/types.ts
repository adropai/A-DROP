export interface PersianDatePickerProps {
  value?: string;
  onChange?: (date: string, gregorianDate?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  format?: string;
  allowClear?: boolean;
  disablePast?: boolean;
  showToday?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface CalendarDay {
  date: string;
  day: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  isPast: boolean;
  isDisabled: boolean;
  gregorianDate: Date;
}

export interface CalendarMonth {
  year: number;
  month: number;
  name: string;
  days: CalendarDay[][];
}
