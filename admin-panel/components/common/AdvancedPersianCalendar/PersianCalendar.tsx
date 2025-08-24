'use client';

import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment-jalaali';
import { toPersianDigit } from './helper';
import './new-calendar.css';

moment.loadPersian();

interface PersianCalendarProps {
  onChange?: (date: string) => void;
  value?: string;
  className?: string;
  placeholder?: string;
  showAsInput?: boolean;
}

const PersianCalendar: React.FC<PersianCalendarProps> = ({
  onChange,
  value,
  className = '',
  placeholder = 'انتخاب تاریخ',
  showAsInput = true
}) => {
  const [currentDate, setCurrentDate] = useState(() => {
    if (value && value.trim() !== '' && value !== 'Invalid date') {
      try {
        let parsedDate = moment(value, 'YYYY/MM/DD');
        if (!parsedDate.isValid()) {
          parsedDate = moment(value);
        }
        return parsedDate.isValid() ? parsedDate : moment();
      } catch {
        return moment();
      }
    }
    return moment();
  });
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(() => {
    if (value && value.trim() !== '' && value !== 'Invalid date') {
      try {
        let parsedDate = moment(value, 'YYYY/MM/DD');
        if (!parsedDate.isValid()) {
          parsedDate = moment(value);
        }
        return parsedDate.isValid() ? parsedDate : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [yearPage, setYearPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle value changes from outside
  useEffect(() => {
    if (value && value !== 'Invalid date' && value.trim() !== '') {
      try {
        // تلاش برای parse کردن با فرمت‌های مختلف
        let parsedDate = moment(value, 'YYYY/MM/DD');
        
        // اگر معتبر نبود، با فرمت‌های دیگر امتحان کن
        if (!parsedDate.isValid()) {
          parsedDate = moment(value, 'YYYY-MM-DD');
        }
        if (!parsedDate.isValid()) {
          parsedDate = moment(value);
        }
        
        if (parsedDate.isValid()) {
          setSelectedDate(parsedDate);
          setCurrentDate(parsedDate);
        } else {
          console.warn('Invalid date value received:', value);
          setSelectedDate(null);
        }
      } catch (error) {
        console.error('Error parsing date value:', error);
        setSelectedDate(null);
      }
    } else if (!value) {
      setSelectedDate(null);
    }
  }, [value]);

  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const persianDayNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

  // تابع تشخیص امروز
  const isToday = (date: moment.Moment) => {
    const today = moment();
    return date.jYear() === today.jYear() && 
           date.jMonth() === today.jMonth() && 
           date.jDate() === today.jDate();
  };

  // تابع تشخیص تولد (28 مهر)
  const isBirthday = (date: moment.Moment) => {
    return date.jMonth() === 6 && date.jDate() === 28;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const startOfMonth = currentDate.clone().startOf('jMonth');
    const firstDayOfWeek = startOfMonth.day();
    const startDate = startOfMonth.clone().subtract(firstDayOfWeek, 'days');
    const days: moment.Moment[] = [];
    const current = startDate.clone();

    for (let i = 0; i < 42; i++) {
      days.push(current.clone());
      current.add(1, 'day');
    }
    return days;
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => prev.clone().subtract(1, 'jMonth'));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => prev.clone().add(1, 'jMonth'));
  };

  const goToPreviousYear = () => {
    setCurrentDate(prev => prev.clone().subtract(1, 'jYear'));
  };

  const goToNextYear = () => {
    setCurrentDate(prev => prev.clone().add(1, 'jYear'));
  };

  // Handle date click
  const handleDateClick = (day: moment.Moment) => {
    setSelectedDate(day);
    setShowCalendar(false);
    if (onChange) {
      // تبدیل تاریخ شمسی به میلادی برای ذخیره در دیتابیس
      const gregorianDate = day.format('YYYY/MM/DD');
      console.log('Persian Calendar: Converting date', day.format('jYYYY/jMM/jDD'), 'to', gregorianDate);
      
      // بررسی validation تاریخ
      if (day.isValid()) {
        onChange(gregorianDate);
      } else {
        console.error('Invalid date selected:', day);
        onChange('Invalid date');
      }
    }
  };

  // Month and year selection
  const handleMonthSelect = (monthIndex: number) => {
    setCurrentDate(prev => prev.clone().jMonth(monthIndex));
    setShowMonthSelector(false);
  };

  const handleYearSelect = (year: number) => {
    setCurrentDate(prev => prev.clone().jYear(year));
    setShowYearSelector(false);
  };

  // Generate years
  const generateYears = () => {
    const currentYear = currentDate.jYear();
    const baseYear = Math.floor(currentYear / 20) * 20;
    const startYear = baseYear + (yearPage * 20);
    const years: number[] = [];
    
    for (let i = 0; i < 20; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  const calendarDays = generateCalendarDays();

  // Format date for display
  const formatDisplayDate = (date: moment.Moment) => {
    if (!date || !date.isValid()) {
      return '';
    }
    try {
      const jDay = date.jDate();
      const jMonth = date.jMonth();
      const jYear = date.jYear();
      
      if (isNaN(jDay) || isNaN(jMonth) || isNaN(jYear)) {
        return '';
      }
      
      return `${toPersianDigit(jDay.toString())} ${persianMonths[jMonth]} ${toPersianDigit(jYear.toString())}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const displayValue = selectedDate ? formatDisplayDate(selectedDate) : '';

  // Handle value changes from parent
  useEffect(() => {
    if (value) {
      const parsedDate = moment(value, 'YYYY/MM/DD');
      setSelectedDate(parsedDate);
      setCurrentDate(parsedDate);
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
        setShowMonthSelector(false);
        setShowYearSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (showAsInput) {
    return (
      <div ref={containerRef} className={`persian-datepicker-container ${className}`}>
        <div 
          className="datepicker-input"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <span className={displayValue ? 'has-value' : 'placeholder'}>
            {displayValue || placeholder}
          </span>
          <span className="calendar-icon">📅</span>
        </div>

        {showCalendar && (
          <div className="calendar-dropdown">
            <div className="persian-calendar-container">
              <div className="calendar-header">
                <div className="year-section">
                  <button onClick={goToPreviousYear} className="nav-btn">-</button>
                  <button 
                    onClick={() => {
                      setShowYearSelector(!showYearSelector);
                      setShowMonthSelector(false);
                    }}
                    className="year-month-btn"
                  >
                    {toPersianDigit(currentDate.jYear().toString())}
                  </button>
                  <button onClick={goToNextYear} className="nav-btn">+</button>
                </div>

                <div className="month-section">
                  <button onClick={goToPreviousMonth} className="nav-btn">-</button>
                  <button 
                    onClick={() => {
                      setShowMonthSelector(!showMonthSelector);
                      setShowYearSelector(false);
                    }}
                    className="year-month-btn"
                  >
                    {persianMonths[currentDate.jMonth()]}
                  </button>
                  <button onClick={goToNextMonth} className="nav-btn">+</button>
                </div>
              </div>

              {showMonthSelector && (
                <div className="selector-dropdown">
                  <div className="month-grid">
                    {persianMonths.map((month, index) => (
                      <button
                        key={index}
                        onClick={() => handleMonthSelect(index)}
                        className={`month-item ${currentDate.jMonth() === index ? 'selected' : ''}`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showYearSelector && (
                <div className="selector-dropdown">
                  <div className="year-selector-header">
                    <button 
                      onClick={() => setYearPage(prev => prev - 1)}
                      className="nav-btn"
                    >
                      {'<<'}
                    </button>
                    <span className="year-range-title">سال</span>
                    <button 
                      onClick={() => setYearPage(prev => prev + 1)}
                      className="nav-btn"
                    >
                      {'>>'}
                    </button>
                  </div>
                  <div className="year-grid">
                    {generateYears().map((year) => (
                      <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={`year-item ${currentDate.jYear() === year ? 'selected' : ''}`}
                      >
                        {toPersianDigit(year.toString())}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!showMonthSelector && !showYearSelector && (
                <div className="calendar-body">
                  <div className="days-header">
                    {persianDayNames.map((dayName, index) => (
                      <div key={index} className="day-name">
                        {dayName}
                      </div>
                    ))}
                  </div>

                  <div className="calendar-days-grid">
                    {calendarDays.map((day, index) => {
                      const isCurrentMonth = day.jMonth() === currentDate.jMonth();
                      const isTodayCheck = isToday(day);
                      const isBirthdayCheck = isBirthday(day);
                      const isSelected = selectedDate && day.isSame(selectedDate, 'day');

                      return (
                        <button
                          key={index}
                          onClick={() => handleDateClick(day)}
                          className={`calendar-day ${
                            isCurrentMonth ? 'current-month' : 'other-month'
                          } ${isTodayCheck ? 'today' : ''} ${isBirthdayCheck ? 'birthday' : ''} ${isSelected ? 'selected' : ''}`}
                        >
                          <span className="day-number">{toPersianDigit(day.jDate().toString())}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default view (always visible)
  return (
    <div className={`persian-calendar-container ${className}`}>
      <div className="calendar-header">
        <div className="year-section">
          <button onClick={goToPreviousYear} className="nav-btn">-</button>
          <button 
            onClick={() => {
              setShowYearSelector(!showYearSelector);
              setShowMonthSelector(false);
            }}
            className="year-month-btn"
          >
            {toPersianDigit(currentDate.jYear().toString())}
          </button>
          <button onClick={goToNextYear} className="nav-btn">+</button>
        </div>

        <div className="month-section">
          <button onClick={goToPreviousMonth} className="nav-btn">-</button>
          <button 
            onClick={() => {
              setShowMonthSelector(!showMonthSelector);
              setShowYearSelector(false);
            }}
            className="year-month-btn"
          >
            {persianMonths[currentDate.jMonth()]}
          </button>
          <button onClick={goToNextMonth} className="nav-btn">+</button>
        </div>
      </div>

      {showMonthSelector && (
        <div className="selector-dropdown">
          <div className="month-grid">
            {persianMonths.map((month, index) => (
              <button
                key={index}
                onClick={() => handleMonthSelect(index)}
                className={`month-item ${currentDate.jMonth() === index ? 'selected' : ''}`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      )}

      {showYearSelector && (
        <div className="selector-dropdown">
          <div className="year-selector-header">
            <button 
              onClick={() => setYearPage(prev => prev - 1)}
              className="nav-btn"
            >
              {'<<'}
            </button>
            <span className="year-range-title">سال</span>
            <button 
              onClick={() => setYearPage(prev => prev + 1)}
              className="nav-btn"
            >
              {'>>'}
            </button>
          </div>
          <div className="year-grid">
            {generateYears().map((year) => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className={`year-item ${currentDate.jYear() === year ? 'selected' : ''}`}
              >
                {toPersianDigit(year.toString())}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showMonthSelector && !showYearSelector && (
        <div className="calendar-body">
          <div className="days-header">
            {persianDayNames.map((dayName, index) => (
              <div key={index} className="day-name">
                {dayName}
              </div>
            ))}
          </div>

          <div className="calendar-days-grid">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day.jMonth() === currentDate.jMonth();
              const isTodayCheck = isToday(day);
              const isBirthdayCheck = isBirthday(day);
              const isSelected = selectedDate && day.isSame(selectedDate, 'day');

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`calendar-day ${
                    isCurrentMonth ? 'current-month' : 'other-month'
                  } ${isTodayCheck ? 'today' : ''} ${isBirthdayCheck ? 'birthday' : ''} ${isSelected ? 'selected' : ''}`}
                >
                  <span className="day-number">{toPersianDigit(day.jDate().toString())}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersianCalendar;
