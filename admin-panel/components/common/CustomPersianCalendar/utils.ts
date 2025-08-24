// 🧠 Advanced Persian Calendar Utilities
import moment from 'moment-jalaali';
import { CalendarDay, CalendarMonth, PersianHoliday } from './types';

// تنظیم moment-jalaali
moment.loadPersian({ dialect: 'persian-modern' });

// 📅 ماه‌های شمسی
export const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// 📅 روزهای هفته
export const PERSIAN_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
export const PERSIAN_DAYS_FULL = [
  'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'
];

// 🎊 تعطیلات رسمی ایران
export const IRANIAN_HOLIDAYS: PersianHoliday[] = [
  // تعطیلات ثابت
  { date: '01/01', name: 'جشن نوروز', type: 'national', isOfficial: true },
  { date: '01/02', name: 'عید نوروز', type: 'national', isOfficial: true },
  { date: '01/03', name: 'عید نوروز', type: 'national', isOfficial: true },
  { date: '01/04', name: 'عید نوروز', type: 'national', isOfficial: true },
  { date: '01/12', name: 'روز جمهوری اسلامی', type: 'national', isOfficial: true },
  { date: '01/13', name: 'سیزده بدر', type: 'national', isOfficial: true },
  { date: '03/14', name: 'رحلت امام خمینی', type: 'religious', isOfficial: true },
  { date: '03/15', name: 'قیام ۱۵ خرداد', type: 'national', isOfficial: true },
  { date: '11/22', name: 'انقلاب اسلامی', type: 'national', isOfficial: true },
  { date: '12/29', name: 'ملی شدن نفت', type: 'national', isOfficial: true },
  
  // تعطیلات متغیر (تقریبی - باید با تقویم دقیق محاسبه شود)
  { date: '01/26', name: 'شهادت حضرت فاطمه', type: 'religious', isOfficial: true },
  { date: '02/30', name: 'شهادت امام علی', type: 'religious', isOfficial: true },
  { date: '06/03', name: 'شهادت امام صادق', type: 'religious', isOfficial: true },
  { date: '07/27', name: 'عید فطر', type: 'religious', isOfficial: true },
  { date: '07/28', name: 'تعطیل عید فطر', type: 'religious', isOfficial: true },
  { date: '10/02', name: 'عید قربان', type: 'religious', isOfficial: true },
  { date: '10/10', name: 'عید غدیر', type: 'religious', isOfficial: true },
  { date: '10/28', name: 'تاسوعا', type: 'religious', isOfficial: true },
  { date: '10/29', name: 'عاشورا', type: 'religious', isOfficial: true },
  { date: '11/28', name: 'اربعین', type: 'religious', isOfficial: true },
  { date: '12/17', name: 'شهادت پیامبر و امام حسن', type: 'religious', isOfficial: true },
  { date: '12/19', name: 'شهادت امام رضا', type: 'religious', isOfficial: true },
];

// 🎯 Core Functions

/**
 * دریافت تاریخ امروز شمسی
 */
export const getTodayPersian = (): string => {
  return moment().format('jYYYY/jMM/jDD');
};

/**
 * فرمت کردن تاریخ شمسی
 */
export const formatPersianDate = (
  date: string | moment.Moment,
  format: string = 'jYYYY/jMM/jDD'
): string => {
  if (typeof date === 'string') {
    return moment(date, 'jYYYY/jMM/jDD').format(format);
  }
  return date.format(format);
};

/**
 * تبدیل تاریخ شمسی به میلادی
 */
export const convertPersianToGregorian = (persianDate: string): Date => {
  return moment(persianDate, 'jYYYY/jMM/jDD').toDate();
};

/**
 * تبدیل تاریخ میلادی به شمسی
 */
export const convertGregorianToPersian = (gregorianDate: Date): string => {
  return moment(gregorianDate).format('jYYYY/jMM/jDD');
};

/**
 * دریافت نام روز هفته شمسی
 */
export const getPersianDayName = (date: string): string => {
  const dayIndex = moment(date, 'jYYYY/jMM/jDD').day();
  return PERSIAN_DAYS_FULL[dayIndex];
};

/**
 * بررسی معتبر بودن تاریخ شمسی
 */
export const isValidPersianDate = (date: string): boolean => {
  return moment(date, 'jYYYY/jMM/jDD', true).isValid();
};

/**
 * بررسی اینکه آیا تاریخ آخر هفته است یا نه
 */
export const isWeekend = (date: string): boolean => {
  const dayOfWeek = moment(date, 'jYYYY/jMM/jDD').day();
  return dayOfWeek === 5; // جمعه
};

/**
 * بررسی اینکه آیا تاریخ تعطیل رسمی است یا نه
 */
export const isHoliday = (date: string): { isHoliday: boolean; holidayName?: string } => {
  const momentDate = moment(date, 'jYYYY/jMM/jDD');
  const monthDay = momentDate.format('jMM/jDD');
  
  const holiday = IRANIAN_HOLIDAYS.find(h => h.date === monthDay);
  
  return {
    isHoliday: !!holiday,
    holidayName: holiday?.name
  };
};

/**
 * مقایسه دو تاریخ شمسی
 */
export const comparePersianDates = (date1: string, date2: string): number => {
  const moment1 = moment(date1, 'jYYYY/jMM/jDD');
  const moment2 = moment(date2, 'jYYYY/jMM/jDD');
  
  if (moment1.isBefore(moment2)) return -1;
  if (moment1.isAfter(moment2)) return 1;
  return 0;
};

/**
 * بررسی اینکه آیا تاریخ در بازه مشخص است یا نه
 */
export const isDateInRange = (
  date: string,
  minDate?: string,
  maxDate?: string
): boolean => {
  const momentDate = moment(date, 'jYYYY/jMM/jDD');
  
  if (minDate) {
    const minMoment = moment(minDate, 'jYYYY/jMM/jDD');
    if (momentDate.isBefore(minMoment)) return false;
  }
  
  if (maxDate) {
    const maxMoment = moment(maxDate, 'jYYYY/jMM/jDD');
    if (momentDate.isAfter(maxMoment)) return false;
  }
  
  return true;
};

/**
 * تولید grid تقویم برای یک ماه مشخص
 */
export const generateCalendarGrid = (
  year: number,
  month: number,
  selectedDate?: string,
  disablePast?: boolean,
  disableFuture?: boolean,
  minDate?: string,
  maxDate?: string
): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const today = getTodayPersian();
  
  // اول ماه
  const firstDay = moment().jYear(year).jMonth(month - 1).jDate(1);
  const lastDay = moment().jYear(year).jMonth(month - 1).endOf('jMonth');
  
  // تعداد روزهای ماه قبل که باید نمایش داده شود
  const firstDayOfWeek = (firstDay.day() + 1) % 7; // تنظیم برای شروع از شنبه
  
  // روزهای ماه قبل
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDate = firstDay.clone().subtract(i + 1, 'days');
    const dateString = prevDate.format('jYYYY/jMM/jDD');
    const holidayInfo = isHoliday(dateString);
    
    days.push({
      day: prevDate.jDate(),
      month: prevDate.jMonth() + 1,
      year: prevDate.jYear(),
      isToday: dateString === today,
      isSelected: dateString === selectedDate,
      isWeekend: isWeekend(dateString),
      isHoliday: holidayInfo.isHoliday,
      isDisabled: (!isDateInRange(dateString, minDate, maxDate) ||
                 (disablePast && comparePersianDates(dateString, today) < 0) ||
                 (disableFuture && comparePersianDates(dateString, today) > 0)) ?? false,
      isOtherMonth: true,
      persianDate: dateString,
      gregorianDate: prevDate.toDate(),
      holidayName: holidayInfo.holidayName
    });
  }
  
  // روزهای ماه جاری
  for (let day = 1; day <= lastDay.jDate(); day++) {
    const currentDate = moment().jYear(year).jMonth(month - 1).jDate(day);
    const dateString = currentDate.format('jYYYY/jMM/jDD');
    const holidayInfo = isHoliday(dateString);
    
    days.push({
      day,
      month,
      year,
      isToday: dateString === today,
      isSelected: dateString === selectedDate,
      isWeekend: isWeekend(dateString),
      isHoliday: holidayInfo.isHoliday,
      isDisabled: (!isDateInRange(dateString, minDate, maxDate) ||
                 (disablePast && comparePersianDates(dateString, today) < 0) ||
                 (disableFuture && comparePersianDates(dateString, today) > 0)) ?? false,
      isOtherMonth: false,
      persianDate: dateString,
      gregorianDate: currentDate.toDate(),
      holidayName: holidayInfo.holidayName
    });
  }
  
  // روزهای ماه بعد (برای کامل کردن 6 هفته)
  const remainingDays = 42 - days.length; // 6 * 7 = 42
  for (let i = 1; i <= remainingDays; i++) {
    const nextDate = lastDay.clone().add(i, 'days');
    const dateString = nextDate.format('jYYYY/jMM/jDD');
    const holidayInfo = isHoliday(dateString);
    
    days.push({
      day: nextDate.jDate(),
      month: nextDate.jMonth() + 1,
      year: nextDate.jYear(),
      isToday: dateString === today,
      isSelected: dateString === selectedDate,
      isWeekend: isWeekend(dateString),
      isHoliday: holidayInfo.isHoliday,
      isDisabled: (!isDateInRange(dateString, minDate, maxDate) ||
                 (disablePast && comparePersianDates(dateString, today) < 0) ||
                 (disableFuture && comparePersianDates(dateString, today) > 0)) ?? false,
      isOtherMonth: true,
      persianDate: dateString,
      gregorianDate: nextDate.toDate(),
      holidayName: holidayInfo.holidayName
    });
  }
  
  return days;
};

/**
 * پارس کردن ورودی کاربر برای تاریخ
 */
export const parsePersianDateInput = (input: string): string | null => {
  // پاک کردن کاراکترهای اضافی
  const cleaned = input.replace(/[^\u06F0-\u06F9\u0660-\u0669\d\/\-\s]/g, '');
  
  // تبدیل اعداد فارسی به انگلیسی
  const english = cleaned
    .replace(/[\u06F0-\u06F9]/g, (char) => 
      String.fromCharCode(char.charCodeAt(0) - 1728))
    .replace(/[\u0660-\u0669]/g, (char) => 
      String.fromCharCode(char.charCodeAt(0) - 1584));
  
  // تلاش برای تشخیص فرمت
  const formats = [
    'jYYYY/jMM/jDD',
    'jYYYY/jM/jD',
    'jYY/jMM/jDD',
    'jYY/jM/jD',
    'jYYYY-jMM-jDD',
    'jYYYY-jM-jD'
  ];
  
  for (const format of formats) {
    const parsed = moment(english, format, true);
    if (parsed.isValid()) {
      return parsed.format('jYYYY/jMM/jDD');
    }
  }
  
  return null;
};

/**
 * دریافت لیست سال‌های قابل انتخاب
 */
export const getAvailableYears = (
  currentYear: number,
  range: number = 50
): number[] => {
  const years: number[] = [];
  // برای تاریخ تولد، بیشتر به گذشته برویم
  const startYear = currentYear - Math.max(range, 100);
  const endYear = currentYear + 10;
  
  for (let i = startYear; i <= endYear; i++) {
    years.push(i);
  }
  return years.reverse(); // جدیدترین سال‌ها در بالا
};

/**
 * تبدیل اعداد انگلیسی به فارسی
 */
export const toPersianDigits = (str: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
};

/**
 * تبدیل اعداد فارسی به انگلیسی
 */
export const toEnglishDigits = (str: string): string => {
  return str
    .replace(/[\u06F0-\u06F9]/g, (char) => 
      String.fromCharCode(char.charCodeAt(0) - 1728))
    .replace(/[\u0660-\u0669]/g, (char) => 
      String.fromCharCode(char.charCodeAt(0) - 1584));
};

/**
 * محاسبه فاصله بین دو تاریخ
 */
export const getDateDifference = (
  date1: string,
  date2: string,
  unit: 'days' | 'months' | 'years' = 'days'
): number => {
  const moment1 = moment(date1, 'jYYYY/jMM/jDD');
  const moment2 = moment(date2, 'jYYYY/jMM/jDD');
  
  return moment1.diff(moment2, unit);
};

/**
 * اضافه کردن مدت زمان به تاریخ
 */
export const addToDate = (
  date: string,
  amount: number,
  unit: 'days' | 'months' | 'years'
): string => {
  return moment(date, 'jYYYY/jMM/jDD')
    .add(amount, unit)
    .format('jYYYY/jMM/jDD');
};

/**
 * کم کردن مدت زمان از تاریخ
 */
export const subtractFromDate = (
  date: string,
  amount: number,
  unit: 'days' | 'months' | 'years'
): string => {
  return moment(date, 'jYYYY/jMM/jDD')
    .subtract(amount, unit)
    .format('jYYYY/jMM/jDD');
};
