'use client';

import React, { useState } from 'react';
import { Card, Button, Select, Space, Divider } from 'antd';
import { 
  SettingOutlined,
  ReloadOutlined,
  PrinterOutlined,
  SoundOutlined
} from '@ant-design/icons';
import KitchenDashboard from '@/components/kitchen/KitchenDashboard';

const { Option } = Select;

const KitchenPage = () => {
  const [selectedStation, setSelectedStation] = useState<string | undefined>(undefined);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const stations = [
    { value: 'grill', label: 'کباب‌پز', icon: '🔥' },
    { value: 'cold', label: 'سالاد و نوشیدنی', icon: '🥗' },
    { value: 'hot', label: 'غذاهای گرم', icon: '🍲' },
    { value: 'dessert', label: 'دسر', icon: '🍰' },
    { value: 'oven', label: 'فر', icon: '🍕' }
  ];

  return (
    <div className="kitchen-page" style={{ padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              🍳 داشبورد آشپزخانه
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>
              مدیریت سفارشات و کنترل زمان پخت
            </p>
          </div>
          
          <Space wrap>
            <Select
              placeholder="انتخاب ایستگاه کاری"
              value={selectedStation}
              onChange={setSelectedStation}
              style={{ minWidth: 180 }}
              allowClear
            >
              {stations.map(station => (
                <Option key={station.value} value={station.value}>
                  {station.icon} {station.label}
                </Option>
              ))}
            </Select>
            
            <Divider type="vertical" />
            
            <Button
              icon={<SoundOutlined />}
              type={soundEnabled ? 'primary' : 'default'}
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'غیرفعال کردن صدا' : 'فعال کردن صدا'}
            />
            
            <Button
              icon={<ReloadOutlined />}
              type={autoRefresh ? 'primary' : 'default'}
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? 'غیرفعال کردن بروزرسانی خودکار' : 'فعال کردن بروزرسانی خودکار'}
            />
            
            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
              title="چاپ گزارش"
            />
            
            <Button
              icon={<SettingOutlined />}
              title="تنظیمات"
            />
          </Space>
        </div>
      </Card>

      {/* Main Dashboard */}
      <KitchenDashboard station={selectedStation} />

      {/* Custom Styles */}
      <style jsx global>{`
        .kitchen-page .ant-card {
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .kitchen-page .ant-card-head {
          border-bottom: 2px solid #f0f0f0;
        }
        
        .kitchen-page .ant-statistic-title {
          font-size: 14px;
          color: #666;
        }
        
        .kitchen-page .ant-statistic-content {
          font-size: 24px;
          font-weight: bold;
        }
        
        .kitchen-page .ant-list-item {
          border-bottom: 1px solid #f5f5f5;
        }
        
        .kitchen-page .ant-progress-line {
          margin-bottom: 8px;
        }
        
        .kitchen-page .ant-tag {
          border-radius: 16px;
          padding: 2px 12px;
          font-size: 12px;
        }
        
        .kitchen-page .order-card {
          transition: all 0.3s ease;
        }
        
        .kitchen-page .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
        
        .kitchen-page .overdue {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(255, 77, 79, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
        }
        
        @media print {
          .kitchen-page .ant-card-head-wrapper button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default KitchenPage;
