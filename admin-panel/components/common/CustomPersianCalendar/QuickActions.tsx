'use client';

import React from 'react';
import { CalendarOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import { QuickActionsProps } from './types';
import styles from './calendar.module.css';

const QuickActions: React.FC<QuickActionsProps> = ({
  onToday,
  onClear,
  onClose,
  disabled = false,
  showClear = true
}) => {
  if (disabled) return null;

  return (
    <div className={styles.quickActions}>
      {/* دکمه بستن */}
      {onClose && (
        <button
          className={`${styles.quickActionBtn} ${styles.closeButton}`}
          onClick={onClose}
          title="بستن"
          type="button"
        >
          بستن
        </button>
      )}

      {/* دکمه‌های اصلی */}
      <div className={styles.mainActions}>
        {/* خالی کردن */}
        {showClear && (
          <button
            className={`${styles.quickActionBtn} ${styles.clearButton}`}
            onClick={onClear}
            title="خالی کردن"
            type="button"
          >
            خالی
          </button>
        )}

        {/* امروز */}
        <button
          className={`${styles.quickActionBtn} ${styles.todayButton}`}
          onClick={onToday}
          title="امروز"
          type="button"
        >
          امروز
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
