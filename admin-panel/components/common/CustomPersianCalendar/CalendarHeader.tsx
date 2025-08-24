'use client';

import React, { useState } from 'react';
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { PERSIAN_MONTHS, toPersianDigits } from './utils';
import styles from './calendar.module.css';

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMonthYearSelect: (year: number, month: number) => void;
  minDate?: string;
  maxDate?: string;
  locale: 'fa' | 'en';
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onMonthYearSelect,
  minDate,
  maxDate,
  locale
}) => {
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [yearPage, setYearPage] = useState(Math.floor(year / 20));

  const handleYearClick = () => {
    setShowYearSelector(!showYearSelector);
    setShowMonthSelector(false);
    setYearPage(Math.floor(year / 20));
  };

  const handleMonthClick = () => {
    setShowMonthSelector(!showMonthSelector);
    setShowYearSelector(false);
  };

  const handleYearSelect = (selectedYear: number) => {
    onMonthYearSelect(selectedYear, month);
    setShowYearSelector(false);
  };

  const handleMonthSelect = (selectedMonth: number) => {
    onMonthYearSelect(year, selectedMonth);
    setShowMonthSelector(false);
  };

  const handleYearPagePrev = () => {
    setYearPage(prev => prev - 1);
  };

  const handleYearPageNext = () => {
    setYearPage(prev => prev + 1);
  };

  const displayYear = locale === 'fa' ? toPersianDigits(year) : year.toString();
  const displayMonth = PERSIAN_MONTHS[month - 1];

  // تولید لیست سال‌ها برای صفحه فعلی (20 سال)
  const getYearsForPage = (page: number): number[] => {
    const startYear = page * 20;
    const years: number[] = [];
    for (let i = 0; i < 20; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  const currentPageYears = getYearsForPage(yearPage);

  return (
    <div className={styles.calendarHeader}>
      {/* ماه */}
      <div className={styles.headerSection}>
        <div 
          className={styles.headerDropdown}
          onClick={handleMonthClick}
        >
          {displayMonth}
        </div>
        
        {showMonthSelector && (
          <div className={styles.monthSelector}>
            <div className={styles.monthGrid}>
              {PERSIAN_MONTHS.map((monthName, index) => {
                const monthNumber = index + 1;
                const isSelected = monthNumber === month;
                
                return (
                  <button
                    key={monthNumber}
                    className={`${styles.monthItem} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleMonthSelect(monthNumber)}
                    type="button"
                  >
                    {monthName}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* سال */}
      <div className={styles.headerSection}>
        <div 
          className={styles.headerDropdown}
          onClick={handleYearClick}
        >
          {displayYear}
        </div>
        
        {showYearSelector && (
          <div className={styles.yearSelector}>
            {/* ناوبری سال‌ها */}
            <div className={styles.yearNavigation}>
              <button 
                className={styles.yearNavBtn}
                onClick={handleYearPagePrev}
                type="button"
              >
                <DoubleRightOutlined />
              </button>
              <span className={styles.yearRange}>
                {toPersianDigits(currentPageYears[0])} - {toPersianDigits(currentPageYears[19])}
              </span>
              <button 
                className={styles.yearNavBtn}
                onClick={handleYearPageNext}
                type="button"
              >
                <DoubleLeftOutlined />
              </button>
            </div>
            
            {/* شبکه سال‌ها */}
            <div className={styles.yearGrid}>
              {currentPageYears.map((yearOption: number) => {
                const isSelected = yearOption === year;
                const displayYearOption = locale === 'fa' ? toPersianDigits(yearOption) : yearOption.toString();
                
                return (
                  <button
                    key={yearOption}
                    className={`${styles.yearItem} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleYearSelect(yearOption)}
                    type="button"
                  >
                    {displayYearOption}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarHeader;
