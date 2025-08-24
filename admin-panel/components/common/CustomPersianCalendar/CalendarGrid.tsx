'use client';

import React from 'react';
import { CalendarGridProps, DateButtonProps } from './types';
import { generateCalendarGrid, PERSIAN_DAYS, toPersianDigits } from './utils';
import styles from './calendar.module.css';

const CalendarGrid: React.FC<CalendarGridProps> = ({
  year,
  month,
  selectedDate,
  onDateSelect,
  disablePast,
  disableFuture,
  minDate,
  maxDate,
  showHolidays = true,
  hoveredDate,
  onDateHover
}) => {
  const calendarDays = generateCalendarGrid(
    year,
    month,
    selectedDate || undefined,
    disablePast,
    disableFuture,
    minDate,
    maxDate
  );

  return (
    <div className={styles.calendarGrid}>
      {/* Week Days Header */}
      <div className={styles.weekDays}>
        {PERSIAN_DAYS.map((day, index) => (
          <div key={index} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className={styles.daysGrid}>
        {calendarDays.map((day, index) => (
          <DateButton
            key={`${day.year}-${day.month}-${day.day}`}
            day={day}
            onClick={onDateSelect}
            onHover={onDateHover}
            showHolidayName={showHolidays}
          />
        ))}
      </div>
    </div>
  );
};

const DateButton: React.FC<DateButtonProps> = ({
  day,
  onClick,
  onHover,
  size = 'middle',
  showHolidayName = true
}) => {
  const handleClick = () => {
    if (!day.isDisabled) {
      onClick(day.persianDate, day.gregorianDate);
    }
  };

  const handleMouseEnter = () => {
    if (!day.isDisabled && onHover) {
      onHover(day.persianDate);
    }
  };

  const handleMouseLeave = () => {
    if (onHover) {
      onHover(null);
    }
  };

  // CSS Classes
  const buttonClasses = [
    styles.dayButton,
    day.isSelected && styles.selected,
    day.isToday && !day.isSelected && styles.today,
    day.isWeekend && !day.isHoliday && !day.isSelected && styles.weekend,
    day.isHoliday && !day.isSelected && styles.holiday,
    day.isDisabled && styles.disabled,
    day.isOtherMonth && styles.otherMonth,
    size && styles[`size-${size}`]
  ].filter(Boolean).join(' ');

  const displayDay = toPersianDigits(day.day);

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={day.isDisabled}
      title={
        day.holidayName 
          ? `${day.persianDate} - ${day.holidayName}`
          : day.persianDate
      }
      aria-label={
        day.isToday 
          ? `امروز - ${day.persianDate}` 
          : day.isSelected 
            ? `انتخاب شده - ${day.persianDate}`
            : day.persianDate
      }
      data-date={day.persianDate}
      type="button"
    >
      <span className={styles.dayNumber}>{displayDay}</span>
      
      {/* Holiday Indicator */}
      {day.isHoliday && showHolidayName && (
        <div className={styles.holidayIndicator}>
          <div className={styles.holidayDot} />
          {day.holidayName && (
            <div className={styles.holidayTooltip}>
              {day.holidayName}
            </div>
          )}
        </div>
      )}
      
      {/* Today Indicator */}
      {day.isToday && !day.isSelected && (
        <div className={styles.todayIndicator} />
      )}
      
      {/* Selection Ripple Effect */}
      {day.isSelected && (
        <div className={styles.selectionRipple} />
      )}
    </button>
  );
};

export default CalendarGrid;
