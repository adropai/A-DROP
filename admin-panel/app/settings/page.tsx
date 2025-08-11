'use client'

import { useState } from 'react'
import { Card, Row, Col, Tabs, Form, Input, Button, Switch, Select, InputNumber, Divider, Upload, Space } from 'antd'
import { ProCard, ProForm, ProFormText, ProFormSelect, ProFormSwitch, ProFormTextArea, ProFormDigit } from '@ant-design/pro-components'
import { SettingOutlined, SecurityScanOutlined, BellOutlined, GlobalOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons'

const { TabPane } = Tabs

export default function SettingsPage() {
  const [currentTab, setCurrentTab] = useState('general')

  // تنظیمات عمومی
  const handleGeneralSettings = async (values: any) => {
    console.log('General settings updated:', values)
    // API call to update settings
    return true
  }

  // تنظیمات امنیتی
  const handleSecuritySettings = async (values: any) => {
    console.log('Security settings updated:', values)
    // API call to update security
    return true
  }

  // تنظیمات اطلاع‌رسانی
  const handleNotificationSettings = async (values: any) => {
    console.log('Notification settings updated:', values)
    // API call to update notifications
    return true
  }

  return (
    <div className="settings-page p-6">
      <ProCard title="تنظیمات سیستم" headerBordered>
        <Tabs activeKey={currentTab} onChange={setCurrentTab} tabPosition="left">
          
          {/* تنظیمات عمومی */}
          <TabPane tab={<span><SettingOutlined />تنظیمات عمومی</span>} key="general">
            <ProCard title="تنظیمات پایه سیستم" headerBordered>
              <ProForm
                onFinish={handleGeneralSettings}
                initialValues={{
                  restaurantName: 'رستوران A-DROP',
                  currency: 'IRR',
                  timezone: 'Asia/Tehran',
                  dateFormat: 'persian',
                  language: 'fa',
                  autoBackup: true,
                  maintenanceMode: false,
                }}
                submitter={{
                  searchConfig: {
                    submitText: 'ذخیره تنظیمات',
                  },
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <ProFormText
                      name="restaurantName"
                      label="نام رستوران"
                      placeholder="نام رستوران را وارد کنید"
                      rules={[{ required: true, message: 'نام رستوران الزامی است' }]}
                    />
                  </Col>
                  <Col span={12}>
                    <ProFormSelect
                      name="currency"
                      label="واحد پول"
                      options={[
                        { label: 'ریال ایران (IRR)', value: 'IRR' },
                        { label: 'تومان', value: 'TOMAN' },
                        { label: 'دلار آمریکا (USD)', value: 'USD' },
                        { label: 'یورو (EUR)', value: 'EUR' },
                      ]}
                    />
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <ProFormSelect
                      name="timezone"
                      label="منطقه زمانی"
                      options={[
                        { label: 'تهران', value: 'Asia/Tehran' },
                        { label: 'اصفهان', value: 'Asia/Tehran' },
                        { label: 'مشهد', value: 'Asia/Tehran' },
                        { label: 'شیراز', value: 'Asia/Tehran' },
                      ]}
                    />
                  </Col>
                  <Col span={12}>
                    <ProFormSelect
                      name="dateFormat"
                      label="فرمت تاریخ"
                      options={[
                        { label: 'شمسی', value: 'persian' },
                        { label: 'میلادی', value: 'gregorian' },
                        { label: 'قمری', value: 'hijri' },
                      ]}
                    />
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <ProFormSelect
                      name="language"
                      label="زبان پیش‌فرض"
                      options={[
                        { label: 'فارسی', value: 'fa' },
                        { label: 'انگلیسی', value: 'en' },
                        { label: 'عربی', value: 'ar' },
                      ]}
                    />
                  </Col>
                  <Col span={12}>
                    <ProFormDigit
                      name="sessionTimeout"
                      label="مدت انقضای نشست (دقیقه)"
                      min={15}
                      max={480}
                      initialValue={120}
                    />
                  </Col>
                </Row>

                <Divider />

                <Row gutter={16}>
                  <Col span={8}>
                    <ProFormSwitch
                      name="autoBackup"
                      label="پشتیبان‌گیری خودکار"
                      tooltip="فعال‌سازی پشتیبان‌گیری روزانه"
                    />
                  </Col>
                  <Col span={8}>
                    <ProFormSwitch
                      name="maintenanceMode"
                      label="حالت تعمیر و نگهداری"
                      tooltip="غیرفعال کردن دسترسی عمومی"
                    />
                  </Col>
                  <Col span={8}>
                    <ProFormSwitch
                      name="debugMode"
                      label="حالت اشکال‌زدایی"
                      tooltip="نمایش جزئیات خطاها"
                    />
                  </Col>
                </Row>
              </ProForm>
            </ProCard>
          </TabPane>

          {/* تنظیمات امنیتی */}
          <TabPane tab={<span><SecurityScanOutlined />امنیت</span>} key="security">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <ProCard title="تنظیمات احراز هویت" headerBordered>
                  <ProForm
                    onFinish={handleSecuritySettings}
                    initialValues={{
                      passwordPolicy: 'strong',
                      twoFactorAuth: true,
                      maxLoginAttempts: 5,
                      lockoutDuration: 30,
                      sessionTimeout: 120,
                    }}
                    submitter={{
                      searchConfig: {
                        submitText: 'ذخیره تنظیمات امنیتی',
                      },
                    }}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <ProFormSelect
                          name="passwordPolicy"
                          label="سیاست رمز عبور"
                          options={[
                            { label: 'ساده (حداقل 6 کاراکتر)', value: 'simple' },
                            { label: 'متوسط (8 کاراکتر + عدد)', value: 'medium' },
                            { label: 'قوی (12 کاراکتر + کاراکتر خاص)', value: 'strong' },
                          ]}
                        />
                      </Col>
                      <Col span={12}>
                        <ProFormDigit
                          name="maxLoginAttempts"
                          label="حداکثر تلاش ورود"
                          min={3}
                          max={10}
                        />
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <ProFormDigit
                          name="lockoutDuration"
                          label="مدت قفل شدن (دقیقه)"
                          min={5}
                          max={1440}
                        />
                      </Col>
                      <Col span={12}>
                        <ProFormDigit
                          name="passwordExpiry"
                          label="انقضای رمز عبور (روز)"
                          min={30}
                          max={365}
                          initialValue={90}
                        />
                      </Col>
                    </Row>

                    <Divider />

                    <Row gutter={16}>
                      <Col span={8}>
                        <ProFormSwitch
                          name="twoFactorAuth"
                          label="احراز هویت دو مرحله‌ای"
                          tooltip="فعال‌سازی 2FA"
                        />
                      </Col>
                      <Col span={8}>
                        <ProFormSwitch
                          name="ipWhitelist"
                          label="محدودیت IP"
                          tooltip="محدود کردن دسترسی به IP های مشخص"
                        />
                      </Col>
                      <Col span={8}>
                        <ProFormSwitch
                          name="auditLog"
                          label="ثبت فعالیت‌ها"
                          tooltip="ذخیره تمام عملیات کاربران"
                        />
                      </Col>
                    </Row>
                  </ProForm>
                </ProCard>
              </Col>

              <Col span={24}>
                <ProCard title="فایروال و دسترسی" headerBordered>
                  <ProForm
                    submitter={{
                      searchConfig: {
                        submitText: 'ذخیره تنظیمات فایروال',
                      },
                    }}
                  >
                    <ProFormTextArea
                      name="allowedIPs"
                      label="IP های مجاز"
                      placeholder="هر IP در یک خط، مثال: 192.168.1.0/24"
                      fieldProps={{
                        rows: 4,
                      }}
                    />
                    
                    <ProFormTextArea
                      name="blockedIPs"
                      label="IP های مسدود"
                      placeholder="هر IP در یک خط"
                      fieldProps={{
                        rows: 4,
                      }}
                    />

                    <Row gutter={16}>
                      <Col span={12}>
                        <ProFormSwitch
                          name="ddosProtection"
                          label="محافظت از DDoS"
                          tooltip="فعال‌سازی محافظت از حملات DDoS"
                        />
                      </Col>
                      <Col span={12}>
                        <ProFormSwitch
                          name="bruteForceProtection"
                          label="محافظت از Brute Force"
                          tooltip="مسدود کردن تلاش‌های مکرر ورود"
                        />
                      </Col>
                    </Row>
                  </ProForm>
                </ProCard>
              </Col>
            </Row>
          </TabPane>

          {/* تنظیمات اطلاع‌رسانی */}
          <TabPane tab={<span><BellOutlined />اطلاع‌رسانی</span>} key="notifications">
            <ProCard title="تنظیمات اطلاع‌رسانی" headerBordered>
              <ProForm
                onFinish={handleNotificationSettings}
                initialValues={{
                  emailNotifications: true,
                  smsNotifications: true,
                  pushNotifications: true,
                  orderAlerts: true,
                  stockAlerts: true,
                  errorAlerts: true,
                }}
                submitter={{
                  searchConfig: {
                    submitText: 'ذخیره تنظیمات اطلاع‌رسانی',
                  },
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <ProFormText
                      name="adminEmail"
                      label="ایمیل مدیر"
                      placeholder="admin@restaurant.com"
                      rules={[{ type: 'email' }]}
                    />
                  </Col>
                  <Col span={12}>
                    <ProFormText
                      name="adminPhone"
                      label="شماره موبایل مدیر"
                      placeholder="09123456789"
                    />
                  </Col>
                </Row>

                <Divider />

                <h4>روش‌های اطلاع‌رسانی</h4>
                <Row gutter={16}>
                  <Col span={8}>
                    <ProFormSwitch
                      name="emailNotifications"
                      label="اطلاع‌رسانی ایمیل"
                    />
                  </Col>
                  <Col span={8}>
                    <ProFormSwitch
                      name="smsNotifications"
                      label="اطلاع‌رسانی پیامک"
                    />
                  </Col>
                  <Col span={8}>
                    <ProFormSwitch
                      name="pushNotifications"
                      label="نوتیفیکیشن Push"
                    />
                  </Col>
                </Row>

                <Divider />

                <h4>انواع هشدارها</h4>
                <Row gutter={16}>
                  <Col span={8}>
                    <ProFormSwitch
                      name="orderAlerts"
                      label="هشدار سفارش جدید"
                    />
                  </Col>
                  <Col span={8}>
                    <ProFormSwitch
                      name="stockAlerts"
                      label="هشدار کمبود موجودی"
                    />
                  </Col>
                  <Col span={8}>
                    <ProFormSwitch
                      name="errorAlerts"
                      label="هشدار خطاهای سیستم"
                    />
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <ProFormSwitch
                      name="paymentAlerts"
                      label="هشدار پرداخت"
                    />
                  </Col>
                  <Col span={8}>
                    <ProFormSwitch
                      name="customerAlerts"
                      label="هشدار مشتری جدید"
                    />
                  </Col>
                  <Col span={8}>
                    <ProFormSwitch
                      name="reportAlerts"
                      label="هشدار گزارش‌ها"
                    />
                  </Col>
                </Row>
              </ProForm>
            </ProCard>
          </TabPane>

          {/* تنظیمات چندزبانه */}
          <TabPane tab={<span><GlobalOutlined />چندزبانه</span>} key="localization">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <ProCard title="تنظیمات زبان و منطقه" headerBordered>
                  <ProForm
                    submitter={{
                      searchConfig: {
                        submitText: 'ذخیره تنظیمات زبان',
                      },
                    }}
                    initialValues={{
                      supportedLanguages: ['fa', 'en'],
                      rtlSupport: true,
                    }}
                  >
                    <ProFormSelect
                      name="supportedLanguages"
                      label="زبان‌های پشتیبانی شده"
                      mode="multiple"
                      options={[
                        { label: 'فارسی', value: 'fa' },
                        { label: 'انگلیسی', value: 'en' },
                        { label: 'عربی', value: 'ar' },
                        { label: 'ترکی', value: 'tr' },
                        { label: 'کردی', value: 'ku' },
                      ]}
                    />

                    <Row gutter={16}>
                      <Col span={12}>
                        <ProFormSwitch
                          name="rtlSupport"
                          label="پشتیبانی از RTL"
                          tooltip="راست به چپ برای زبان‌های فارسی و عربی"
                        />
                      </Col>
                      <Col span={12}>
                        <ProFormSwitch
                          name="autoDetectLanguage"
                          label="تشخیص خودکار زبان"
                          tooltip="تشخیص زبان بر اساس مرورگر"
                        />
                      </Col>
                    </Row>
                  </ProForm>
                </ProCard>
              </Col>

              <Col span={24}>
                <ProCard title="آپلود فایل‌های ترجمه" headerBordered>
                  <Upload.Dragger
                    name="translationFiles"
                    action="/api/upload/translations"
                    multiple
                    accept=".json,.po,.csv"
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined style={{ fontSize: 48 }} />
                    </p>
                    <p className="ant-upload-text">
                      فایل‌های ترجمه را اینجا بکشید یا کلیک کنید
                    </p>
                    <p className="ant-upload-hint">
                      فرمت‌های پشتیبانی: JSON, PO, CSV
                    </p>
                  </Upload.Dragger>
                </ProCard>
              </Col>
            </Row>
          </TabPane>

          {/* تنظیمات API */}
          <TabPane tab={<span><SettingOutlined />API</span>} key="api">
            <ProCard title="تنظیمات API و ادغام" headerBordered>
              <ProForm
                submitter={{
                  searchConfig: {
                    submitText: 'ذخیره تنظیمات API',
                  },
                }}
              >
                <h4>API پرداخت</h4>
                <Row gutter={16}>
                  <Col span={12}>
                    <ProFormText
                      name="paymentGatewayUrl"
                      label="آدرس درگاه پرداخت"
                      placeholder="https://api.payment.com"
                    />
                  </Col>
                  <Col span={12}>
                    <ProFormText
                      name="paymentApiKey"
                      label="کلید API پرداخت"
                      placeholder="pk_live_..."
                      fieldProps={{ type: 'password' }}
                    />
                  </Col>
                </Row>

                <Divider />

                <h4>API پیامک</h4>
                <Row gutter={16}>
                  <Col span={12}>
                    <ProFormText
                      name="smsApiUrl"
                      label="آدرس API پیامک"
                      placeholder="https://api.sms.com"
                    />
                  </Col>
                  <Col span={12}>
                    <ProFormText
                      name="smsApiKey"
                      label="کلید API پیامک"
                      fieldProps={{ type: 'password' }}
                    />
                  </Col>
                </Row>

                <Divider />

                <h4>API نقشه و موقعیت‌یابی</h4>
                <Row gutter={16}>
                  <Col span={12}>
                    <ProFormText
                      name="mapApiKey"
                      label="کلید API نقشه"
                      placeholder="Google Maps یا Parsimap"
                      fieldProps={{ type: 'password' }}
                    />
                  </Col>
                  <Col span={12}>
                    <ProFormSelect
                      name="mapProvider"
                      label="ارائه‌دهنده نقشه"
                      options={[
                        { label: 'Google Maps', value: 'google' },
                        { label: 'Parsimap', value: 'parsimap' },
                        { label: 'OpenStreetMap', value: 'osm' },
                      ]}
                    />
                  </Col>
                </Row>

                <Divider />

                <Row gutter={16}>
                  <Col span={12}>
                    <ProFormSwitch
                      name="enableApiLogs"
                      label="ثبت فعالیت API"
                      tooltip="ذخیره تمام درخواست‌های API"
                    />
                  </Col>
                  <Col span={12}>
                    <ProFormSwitch
                      name="enableApiRateLimit"
                      label="محدودیت نرخ API"
                      tooltip="محدود کردن تعداد درخواست‌ها"
                    />
                  </Col>
                </Row>
              </ProForm>
            </ProCard>
          </TabPane>
        </Tabs>
      </ProCard>
    </div>
  )
}
