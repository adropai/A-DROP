'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import fa_IR from 'antd/locale/fa_IR';
import CashierPage from '../../components/cashier/CashierPage';

export default function Cashier() {
  return (
    <ConfigProvider 
      locale={fa_IR}
      direction="rtl"
      theme={{
        token: {
          fontFamily: 'IRANSans, Tahoma, Arial, sans-serif',
        },
      }}
    >
      <CashierPage />
    </ConfigProvider>
  );
}
