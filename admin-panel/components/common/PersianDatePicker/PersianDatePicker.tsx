'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CalendarOutlined, CloseCircleFilled, LeftOutlined, RightOutlined } from '@ant-design/icons';
import moment from 'moment-jalaali';
import { PersianDatePickerProps, CalendarDay } from './types';
import {
  getTodayPersian,
  formatPersianDate,
  convertPersianToGregorian,
  getPersianDayName,
  isValidPersianDate,
  generateCalendarGrid,
  parsePersianDateInput,
  PERSIAN_MONTHS,
  PERSIAN_DAYS
} from './utils';
import styles from './styles.module.css';

const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  disabled = false,
  size = 'middle',
  format = 'jYYYY/jMM/jDD',
  allowClear = true,
  disablePast = false,
  showToday = true,
  minDate,
  maxDate,
  className = '',
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [displayMonth, setDisplayMonth] = useState(() => {
    const currentDate = value ? moment(value, 'jYYYY/jMM/jDD') : moment();
    return {
      year: currentDate.jYear(),
      month: currentDate.jMonth() + 1
    };
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle input focus
  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const parsed = parsePersianDateInput(newValue);
    if (parsed && isValidPersianDate(parsed)) {
      const gregorianDate = convertPersianToGregorian(parsed);
      onChange?.(parsed, gregorianDate);
    }
  };

  // Handle date selection
  const handleDateSelect = (day: CalendarDay) => {
    if (day.isDisabled || disabled) return;
    
    const selectedDate = day.date;
    setInputValue(selectedDate);
    setIsOpen(false);
    onChange?.(selectedDate, day.gregorianDate);
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue('');
    onChange?.('');
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setDisplayMonth(prev => {
      let newMonth = prev.month;
      let newYear = prev.year;
      
      if (direction === 'next') {
        newMonth += 1;
        if (newMonth > 12) {
          newMonth = 1;
          newYear += 1;
        }
      } else {
        newMonth -= 1;
        if (newMonth < 1) {
          newMonth = 12;
          newYear -= 1;
        }
      }
      
      return { year: newYear, month: newMonth };
    });
  };

  // Go to today
  const goToToday = () => {
    const today = getTodayPersian();
    setInputValue(today);
    const gregorianDate = convertPersianToGregorian(today);
    onChange?.(today, gregorianDate);
    setIsOpen(false);
    
    // Update display month to current month
    const currentMoment = moment();
    setDisplayMonth({
      year: currentMoment.jYear(),
      month: currentMoment.jMonth() + 1
    });
  };

  // Generate calendar
  const calendarGrid = generateCalendarGrid(
    displayMonth.year, 
    displayMonth.month, 
    disablePast ? getTodayPersian() : minDate, 
    maxDate
  );

  // Get input classes
  const getInputClasses = () => {
    const classes = [styles.pickerInput];
    if (disabled) classes.push(styles.disabled);
    if (size === 'small') classes.push(styles.small);
    if (size === 'large') classes.push(styles.large);
    return classes.join(' ');
  };

  return (
    <div 
      ref={containerRef} 
      className={`${styles.persianDatePicker} ${className}`}
      style={style}
    >
      {/* Input Field */}
      <div 
        className={getInputClasses()}
        onClick={handleInputFocus}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={styles.hiddenInput}
          style={{ 
            border: 'none', 
            outline: 'none', 
            background: 'transparent',
            width: '100%',
            fontSize: 'inherit',
            color: 'inherit'
          }}
          dir="ltr"
        />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {allowClear && inputValue && !disabled && (
            <CloseCircleFilled 
              className={styles.clearIcon}
              onClick={handleClear}
            />
          )}
          <CalendarOutlined className={styles.calendarIcon} />
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className={styles.calendarDropdown}>
          {/* Calendar Header */}
          <div className={styles.calendarHeader}>
            <button 
              className={styles.navButton}
              onClick={() => navigateMonth('next')}
              type="button"
            >
              <RightOutlined />
            </button>
            
            <div className={styles.monthYearSelector}>
              <button className={styles.monthSelector} type="button">
                {PERSIAN_MONTHS[displayMonth.month - 1]}
              </button>
              <button className={styles.yearSelector} type="button">
                {displayMonth.year}
              </button>
            </div>
            
            <button 
              className={styles.navButton}
              onClick={() => navigateMonth('prev')}
              type="button"
            >
              <LeftOutlined />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className={styles.calendarGrid}>
            {/* Weekday Headers */}
            <div className={styles.calendarWeekdays}>
              {PERSIAN_DAYS.map((day, index) => (
                <div key={index} className={styles.weekdayHeader}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Weeks */}
            <div className={styles.calendarWeeks}>
              {calendarGrid.map((week, weekIndex) => (
                <div key={weekIndex} className={styles.calendarWeek}>
                  {week.map((day, dayIndex) => {
                    const isSelected = day.date === inputValue;
                    const dayClasses = [styles.calendarDay];
                    
                    if (day.isToday) dayClasses.push(styles.today);
                    if (isSelected) dayClasses.push(styles.selected);
                    if (!day.isCurrentMonth) dayClasses.push(styles.otherMonth);
                    if (day.isDisabled) dayClasses.push(styles.disabled);
                    if (day.isPast && !day.isToday && !isSelected) dayClasses.push(styles.past);
                    
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={dayClasses.join(' ')}
                        onClick={() => handleDateSelect(day)}
                        title={`${getPersianDayName(day.gregorianDate, true)} ${day.date}`}
                      >
                        {day.day}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Footer */}
          {showToday && (
            <div className={styles.calendarFooter}>
              <button 
                className={styles.todayButton}
                onClick={goToToday}
                type="button"
              >
                امروز
              </button>
              <div className={styles.timeDisplay}>
                {getTodayPersian()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersianDatePicker;
