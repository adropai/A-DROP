import moment from 'moment-jalaali';
import type { CalendarDay } from './types';

// Persian month names
export const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// Persian day names
export const PERSIAN_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
export const PERSIAN_DAYS_FULL = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

/**
 * Get today's date in Persian format
 */
export function getTodayPersian(): string {
  return moment().format('jYYYY/jMM/jDD');
}

/**
 * Format Persian date
 */
export function formatPersianDate(date: Date | string | moment.Moment, format = 'jYYYY/jMM/jDD'): string {
  if (typeof date === 'string') {
    return date;
  }
  const momentDate = moment.isMoment(date) ? date : moment(date);
  return momentDate.format(format);
}

/**
 * Convert Persian date to Gregorian
 */
export function convertPersianToGregorian(persianDate: string): Date {
  const m = moment(persianDate, 'jYYYY/jMM/jDD');
  return m.toDate();
}

/**
 * Convert Gregorian date to Persian
 */
export function convertGregorianToPersian(gregorianDate: Date): string {
  return moment(gregorianDate).format('jYYYY/jMM/jDD');
}

/**
 * Get Persian day name
 */
export function getPersianDayName(date: string | Date | moment.Moment, full = false): string {
  const momentDate = typeof date === 'string' 
    ? moment(date, 'jYYYY/jMM/jDD') 
    : moment.isMoment(date) 
      ? date 
      : moment(date);
  
  const dayIndex = momentDate.day();
  return full ? PERSIAN_DAYS_FULL[dayIndex] : PERSIAN_DAYS[dayIndex];
}

/**
 * Check if date is valid Persian date
 */
export function isValidPersianDate(dateString: string): boolean {
  const regex = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;
  if (!regex.test(dateString)) return false;
  
  const m = moment(dateString, 'jYYYY/jMM/jDD');
  return m.isValid() && m.format('jYYYY/jMM/jDD') === dateString;
}

/**
 * Get month info
 */
export function getMonthInfo(year: number, month: number) {
  const startOfMonth = moment(`${year}/${month}/01`, 'jYYYY/jMM/jDD');
  const endOfMonth = startOfMonth.clone().endOf('jMonth');
  const daysInMonth = endOfMonth.jDate();
  
  return {
    startOfMonth,
    endOfMonth,
    daysInMonth,
    monthName: PERSIAN_MONTHS[month - 1]
  };
}

/**
 * Generate calendar grid for a month
 */
export function generateCalendarGrid(year: number, month: number, minDate?: string, maxDate?: string): CalendarDay[][] {
  const { startOfMonth } = getMonthInfo(year, month);
  const today = moment();
  
  // Start from beginning of week
  const startDate = startOfMonth.clone().startOf('week');
  const endDate = startOfMonth.clone().endOf('jMonth').endOf('week');
  
  const calendar: CalendarDay[][] = [];
  const current = startDate.clone();
  
  while (current.isSameOrBefore(endDate)) {
    const week: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const date = current.clone();
      const persianDate = date.format('jYYYY/jMM/jDD');
      const isToday = date.isSame(today, 'day');
      const isCurrentMonth = date.jMonth() === month - 1 && date.jYear() === year;
      const isPast = date.isBefore(today, 'day');
      
      let isDisabled = false;
      if (minDate && date.isBefore(moment(minDate, 'jYYYY/jMM/jDD'), 'day')) {
        isDisabled = true;
      }
      if (maxDate && date.isAfter(moment(maxDate, 'jYYYY/jMM/jDD'), 'day')) {
        isDisabled = true;
      }
      
      week.push({
        date: persianDate,
        day: date.format('jDD'),
        isToday,
        isCurrentMonth,
        isPast,
        isDisabled,
        gregorianDate: date.toDate()
      });
      current.add(1, 'day');
    }
    calendar.push(week);
  }
  
  return calendar;
}

/**
 * Parse Persian date input
 */
export function parsePersianDateInput(input: string): string | null {
  // Remove extra spaces and Persian/Arabic numbers
  let cleaned = input.trim()
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  
  // Try different formats
  const formats = [
    'jYYYY/jMM/jDD',
    'jYYYY/jM/jD',
    'jYY/jMM/jDD',
    'jYY/jM/jD'
  ];
  
  for (const format of formats) {
    const parsed = moment(cleaned, format);
    if (parsed.isValid()) {
      return parsed.format('jYYYY/jMM/jDD');
    }
  }
  
  return null;
}
