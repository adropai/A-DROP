'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CalendarOutlined, CloseCircleFilled } from '@ant-design/icons';
import moment from 'moment-jalaali';

import { CustomPersianCalendarProps, CalendarState, CalendarDay } from './types';
import {
  getTodayPersian,
  formatPersianDate,
  convertPersianToGregorian,
  isValidPersianDate,
  generateCalendarGrid,
  parsePersianDateInput,
  PERSIAN_MONTHS,
  toPersianDigits,
  comparePersianDates
} from './utils';

import CalendarHeader from './CalendarHeader';
import QuickActions from './QuickActions';
import CalendarGrid from './CalendarGrid';
import styles from './calendar.module.css';

// تنظیم moment-jalaali
moment.loadPersian({ dialect: 'persian-modern' });

const CustomPersianCalendar: React.FC<CustomPersianCalendarProps> = ({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  disabled = false,
  size = 'middle',
  format = 'jYYYY/jMM/jDD',
  allowClear = true,
  disablePast = false,
  disableFuture = false,
  showToday = true,
  showHolidays = true,
  minDate,
  maxDate,
  className = '',
  style = {},
  locale = 'fa',
  theme = 'auto',
  quickActions = true,
  showWeekNumbers = false,
  onMonthChange,
  onYearChange
}) => {
  // State Management
  const [state, setState] = useState<CalendarState>(() => {
    const currentDate = value ? moment(value, 'jYYYY/jMM/jDD') : moment();
    return {
      isOpen: false,
      inputValue: value || '',
      displayMonth: currentDate.jMonth() + 1,
      displayYear: currentDate.jYear(),
      selectedDate: value || null,
      hoveredDate: null,
      isLoading: false,
      quickActionActive: null
    };
  });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ===============================
  // Event Handlers
  // ===============================

  /**
   * باز/بسته کردن تقویم
   */
  const toggleCalendar = useCallback(() => {
    if (disabled) return;
    
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  }, [disabled]);

  /**
   * بستن تقویم
   */
  const closeCalendar = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      hoveredDate: null,
      quickActionActive: null
    }));
  }, []);

  /**
   * انتخاب تاریخ
   */
  const handleDateSelect = useCallback((date: string, gregorianDate: Date) => {
    const formattedDate = formatPersianDate(date, format);
    
    setState(prev => ({
      ...prev,
      selectedDate: date,
      inputValue: formattedDate,
      isOpen: false
    }));

    if (onChange) {
      onChange(formattedDate, gregorianDate);
    }
  }, [format, onChange]);

  /**
   * تغییر ماه
   */
  const handleMonthChange = useCallback((direction: 'prev' | 'next') => {
    setState(prev => {
      let newMonth = prev.displayMonth;
      let newYear = prev.displayYear;

      if (direction === 'next') {
        if (newMonth === 12) {
          newMonth = 1;
          newYear += 1;
        } else {
          newMonth += 1;
        }
      } else {
        if (newMonth === 1) {
          newMonth = 12;
          newYear -= 1;
        } else {
          newMonth -= 1;
        }
      }

      // Call callbacks
      if (onMonthChange) onMonthChange(newYear, newMonth);
      if (onYearChange && newYear !== prev.displayYear) onYearChange(newYear);

      return {
        ...prev,
        displayMonth: newMonth,
        displayYear: newYear
      };
    });
  }, [onMonthChange, onYearChange]);

  /**
   * انتخاب سریع ماه/سال
   */
  const handleMonthYearSelect = useCallback((year: number, month: number) => {
    setState(prev => ({
      ...prev,
      displayYear: year,
      displayMonth: month
    }));

    if (onMonthChange) onMonthChange(year, month);
    if (onYearChange) onYearChange(year);
  }, [onMonthChange, onYearChange]);

  /**
   * پاک کردن انتخاب
   */
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    setState(prev => ({
      ...prev,
      selectedDate: null,
      inputValue: '',
      isOpen: false
    }));

    if (onChange) {
      onChange('', new Date());
    }
  }, [onChange]);

  /**
   * انتخاب امروز
   */
  const handleTodaySelect = useCallback(() => {
    const today = getTodayPersian();
    const gregorianToday = convertPersianToGregorian(today);
    const formattedToday = formatPersianDate(today, format);
    
    setState(prev => ({
      ...prev,
      selectedDate: today,
      inputValue: formattedToday,
      displayYear: moment(today, 'jYYYY/jMM/jDD').jYear(),
      displayMonth: moment(today, 'jYYYY/jMM/jDD').jMonth() + 1,
      isOpen: false,
      quickActionActive: 'today'
    }));

    if (onChange) {
      onChange(formattedToday, gregorianToday);
    }

    // Reset quick action highlight
    setTimeout(() => {
      setState(prev => ({ ...prev, quickActionActive: null }));
    }, 300);
  }, [format, onChange]);

  /**
   * تغییر مقدار input
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setState(prev => ({ ...prev, inputValue: newValue }));

    // تلاش برای parse کردن تاریخ
    const parsedDate = parsePersianDateInput(newValue);
    if (parsedDate && isValidPersianDate(parsedDate)) {
      const gregorianDate = convertPersianToGregorian(parsedDate);
      
      setState(prev => ({
        ...prev,
        selectedDate: parsedDate,
        displayYear: moment(parsedDate, 'jYYYY/jMM/jDD').jYear(),
        displayMonth: moment(parsedDate, 'jYYYY/jMM/jDD').jMonth() + 1
      }));

      if (onChange) {
        onChange(formatPersianDate(parsedDate, format), gregorianDate);
      }
    }
  }, [format, onChange]);

  /**
   * hover روی تاریخ
   */
  const handleDateHover = useCallback((date: string | null) => {
    setState(prev => ({ ...prev, hoveredDate: date }));
  }, []);

  // ===============================
  // Effects
  // ===============================

  /**
   * بروزرسانی state هنگام تغییر value از خارج
   */
  useEffect(() => {
    if (value !== state.inputValue) {
      setState(prev => {
        if (value && isValidPersianDate(value)) {
          const momentDate = moment(value, 'jYYYY/jMM/jDD');
          return {
            ...prev,
            inputValue: value,
            selectedDate: value,
            displayYear: momentDate.jYear(),
            displayMonth: momentDate.jMonth() + 1
          };
        } else {
          return {
            ...prev,
            inputValue: value || '',
            selectedDate: value || null
          };
        }
      });
    }
  }, [value, state.inputValue]);

  /**
   * بستن تقویم هنگام کلیک خارج از component
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeCalendar();
      }
    };

    if (state.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [state.isOpen, closeCalendar]);

  /**
   * مدیریت keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.isOpen) return;

      switch (e.key) {
        case 'Escape':
          closeCalendar();
          break;
        case 'Enter':
          if (state.hoveredDate) {
            const gregorianDate = convertPersianToGregorian(state.hoveredDate);
            handleDateSelect(state.hoveredDate, gregorianDate);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleMonthChange('next');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleMonthChange('prev');
          break;
        default:
          break;
      }
    };

    if (state.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [state.isOpen, state.hoveredDate, closeCalendar, handleDateSelect, handleMonthChange]);

  // ===============================
  // Computed Values
  // ===============================

  const calendarDays = generateCalendarGrid(
    state.displayYear,
    state.displayMonth,
    state.selectedDate || undefined,
    disablePast,
    disableFuture,
    minDate,
    maxDate
  );

  const hasValue = state.inputValue && state.inputValue.trim() !== '';
  const showClearIcon = allowClear && hasValue && !disabled;

  // CSS Classes
  const containerClasses = [
    styles.calendarContainer,
    size && styles[`size-${size}`],
    disabled && styles.disabled,
    theme && styles[`theme-${theme}`],
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    styles.calendarInput,
    disabled && styles.disabled,
    state.isOpen && styles.focused,
    size && styles[`input-${size}`]
  ].filter(Boolean).join(' ');

  // ===============================
  // Render
  // ===============================

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={style}
      data-testid="custom-persian-calendar"
    >
      {/* Input Field */}
      <div className={styles.inputWrapper} onClick={toggleCalendar}>
        <input
          ref={inputRef}
          type="text"
          value={state.inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          readOnly={false}
          autoComplete="off"
          data-testid="calendar-input"
        />
        
        <CalendarOutlined className={styles.inputIcon} />
        
        {showClearIcon && (
          <CloseCircleFilled
            className={styles.clearIcon}
            onClick={handleClear}
            data-testid="clear-button"
          />
        )}
      </div>

      {/* Calendar Dropdown */}
      {state.isOpen && (
        <div className={styles.calendarDropdown} data-testid="calendar-dropdown">
          {state.isLoading ? (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner} />
            </div>
          ) : (
            <>
              {/* Header */}
              <CalendarHeader
                year={state.displayYear}
                month={state.displayMonth}
                onPrevMonth={() => handleMonthChange('prev')}
                onNextMonth={() => handleMonthChange('next')}
                onMonthYearSelect={handleMonthYearSelect}
                minDate={minDate}
                maxDate={maxDate}
                locale={locale}
              />

              {/* Quick Actions */}
              {quickActions && (
                <QuickActions
                  onToday={handleTodaySelect}
                  onClear={handleClear}
                  onClose={closeCalendar}
                  disabled={disabled}
                  showClear={allowClear}
                />
              )}

              {/* Calendar Grid */}
              <CalendarGrid
                year={state.displayYear}
                month={state.displayMonth}
                selectedDate={state.selectedDate}
                onDateSelect={handleDateSelect}
                disablePast={disablePast}
                disableFuture={disableFuture}
                minDate={minDate}
                maxDate={maxDate}
                showHolidays={showHolidays}
                hoveredDate={state.hoveredDate}
                onDateHover={handleDateHover}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomPersianCalendar;
