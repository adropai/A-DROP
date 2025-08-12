'use client';

import { ConfigProvider, theme, App } from 'antd';
import { ProConfigProvider } from '@ant-design/pro-components';
import fa_IR from 'antd/locale/fa_IR';
import fa_IR_ProComponents from '@/lib/locale-fa';
import { ReactNode } from 'react';
import { HydrationSafeConfigProvider, AntdHydrationSafe } from '@/lib/hydration-fix';

interface AntdProviderProps {
  children: ReactNode;
}

const AntdProvider = ({ children }: AntdProviderProps) => {
  return (
    <HydrationSafeConfigProvider>
      <ConfigProvider
        locale={fa_IR}
        direction="rtl"
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 8,
            // Fixed values برای consistency
            wireframe: false,
          },
          algorithm: theme.defaultAlgorithm,
          components: {
            // تنظیمات ثابت برای جلوگیری از hydration mismatch
            Table: {
              headerBg: '#fafafa',
              borderRadiusLG: 6,
              padding: 16,
              paddingXS: 8,
            },
            Card: {
              borderRadiusLG: 6,
              padding: 24,
              paddingLG: 24,
            },
            Form: {
              itemMarginBottom: 24,
              verticalLabelPadding: '0 0 8px',
            },
          },
        }}
      >
        <App>
          <ProConfigProvider 
            valueTypeMap={{}}
            hashed={false}
          >
            <AntdHydrationSafe>
              {children}
            </AntdHydrationSafe>
          </ProConfigProvider>
        </App>
      </ConfigProvider>
    </HydrationSafeConfigProvider>
  );
};

export default AntdProvider;
