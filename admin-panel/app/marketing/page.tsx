'use client'

import { useState, useRef } from 'react'
import { ProTable, ProForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormTreeSelect, ProCard } from '@ant-design/pro-components'
import { Button, Modal, message, Tag, Space, Tabs, Card, Row, Col, Statistic, Progress, List, Avatar, Upload } from 'antd'
import { PlusOutlined, SendOutlined, EyeOutlined, EditOutlined, DeleteOutlined, MessageOutlined, BellOutlined, ApiOutlined, BarChartOutlined } from '@ant-design/icons'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Campaign {
  id: string
  name: string
  type: 'sms' | 'notification' | 'email' | 'banner'
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused'
  target: string[]
  message: string
  scheduledDate?: string
  sentCount: number
  openRate: number
  clickRate: number
  createdAt: string
  budget?: number
}

interface Banner {
  id: string
  title: string
  image: string
  link?: string
  position: 'header' | 'sidebar' | 'popup' | 'footer'
  active: boolean
  startDate: string
  endDate: string
  views: number
  clicks: number
}

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [campaignModalVisible, setCampaignModalVisible] = useState(false)
  const [bannerModalVisible, setBannerModalVisible] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const campaignActionRef = useRef<ActionType>()
  const bannerActionRef = useRef<ActionType>()
  const [campaignForm] = ProForm.useForm()
  const [bannerForm] = ProForm.useForm()

  // داده‌های نمونه کمپین‌ها
  const campaignsData: Campaign[] = [
    {
      id: 'CAMP-001',
      name: 'تخفیف ویژه نوروز',
      type: 'sms',
      status: 'active',
      target: ['vip', 'regular'],
      message: 'در ایام نوروز از ۲۰٪ تخفیف ویژه بهره‌مند شوید! کد: NOWRUZ2024',
      scheduledDate: '2024-03-20 10:00',
      sentCount: 1250,
      openRate: 85.5,
      clickRate: 12.3,
      createdAt: '2024-03-15',
      budget: 500000
    },
    {
      id: 'CAMP-002',
      name: 'معرفی منوی جدید',
      type: 'notification',
      status: 'completed',
      target: ['all'],
      message: 'طعم‌های جدید و متنوع در منوی ما منتظر شماست!',
      sentCount: 3200,
      openRate: 92.1,
      clickRate: 18.7,
      createdAt: '2024-03-10',
      budget: 750000
    },
    {
      id: 'CAMP-003',
      name: 'بازگشت مشتریان',
      type: 'email',
      status: 'scheduled',
      target: ['inactive'],
      message: 'دلتان برای طعم‌های خوشمزه ما تنگ نشده؟ با ۱۵٪ تخفیف برگردید!',
      scheduledDate: '2024-03-25 09:00',
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: '2024-03-18',
      budget: 300000
    }
  ]

  // داده‌های نمونه بنرها
  const bannersData: Banner[] = [
    {
      id: 'BAN-001',
      title: 'تخفیف ویژه ماه رمضان',
      image: '/banners/ramadan-offer.jpg',
      link: '/menu?category=iftar',
      position: 'header',
      active: true,
      startDate: '2024-03-20',
      endDate: '2024-04-20',
      views: 45680,
      clicks: 1234
    },
    {
      id: 'BAN-002',
      title: 'منوی جدید آشپزی ایرانی',
      image: '/banners/iranian-menu.jpg',
      position: 'sidebar',
      active: true,
      startDate: '2024-03-15',
      endDate: '2024-04-15',
      views: 28900,
      clicks: 567
    }
  ]

  // ستون‌های جدول کمپین‌ها
  const campaignColumns: ProColumns<Campaign>[] = [
    {
      title: 'نام کمپین',
      dataIndex: 'name',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'نوع',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: {
        sms: { text: 'پیامک', status: 'Default' },
        notification: { text: 'اعلان', status: 'Processing' },
        email: { text: 'ایمیل', status: 'Success' },
        banner: { text: 'بنر', status: 'Warning' }
      },
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        draft: { text: 'پیش‌نویس', status: 'Default' },
        scheduled: { text: 'زمان‌بندی شده', status: 'Processing' },
        active: { text: 'فعال', status: 'Success' },
        completed: { text: 'تکمیل شده', status: 'Success' },
        paused: { text: 'متوقف', status: 'Warning' }
      },
    },
    {
      title: 'ارسال شده',
      dataIndex: 'sentCount',
      search: false,
      render: (_: any, record: Campaign) => record.sentCount.toLocaleString('fa-IR'),
    },
    {
      title: 'نرخ بازدید',
      dataIndex: 'openRate',
      search: false,
      render: (_: any, record: Campaign) => `${record.openRate}%`,
    },
    {
      title: 'نرخ کلیک',
      dataIndex: 'clickRate',
      search: false,
      render: (_: any, record: Campaign) => `${record.clickRate}%`,
    },
    {
      title: 'بودجه',
      dataIndex: 'budget',
      search: false,
      render: (_: any, record: Campaign) => 
        record.budget ? `${record.budget.toLocaleString('fa-IR')} تومان` : '-',
    },
    {
      title: 'عملیات',
      valueType: 'option',
      render: (_: any, record: Campaign) => [
        <Button
          key="view"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewCampaign(record)}
        >
          مشاهده
        </Button>,
        <Button
          key="edit"
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEditCampaign(record)}
        >
          ویرایش
        </Button>,
        <Button
          key="delete"
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteCampaign(record.id)}
        >
          حذف
        </Button>,
      ],
    },
  ]

  // ستون‌های جدول بنرها
  const bannerColumns: ProColumns<Banner>[] = [
    {
      title: 'تصویر',
      dataIndex: 'image',
      valueType: 'image',
      width: 80,
      search: false,
    },
    {
      title: 'عنوان',
      dataIndex: 'title',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'موقعیت',
      dataIndex: 'position',
      valueType: 'select',
      valueEnum: {
        header: { text: 'هدر', status: 'Default' },
        sidebar: { text: 'کناری', status: 'Processing' },
        popup: { text: 'پاپ‌آپ', status: 'Warning' },
        footer: { text: 'فوتر', status: 'Success' }
      },
    },
    {
      title: 'وضعیت',
      dataIndex: 'active',
      valueType: 'select',
      valueEnum: {
        true: { text: 'فعال', status: 'Success' },
        false: { text: 'غیرفعال', status: 'Default' }
      },
    },
    {
      title: 'بازدید',
      dataIndex: 'views',
      search: false,
      render: (_: any, record: Banner) => record.views.toLocaleString('fa-IR'),
    },
    {
      title: 'کلیک',
      dataIndex: 'clicks',
      search: false,
      render: (_: any, record: Banner) => record.clicks.toLocaleString('fa-IR'),
    },
    {
      title: 'نرخ کلیک',
      search: false,
      render: (_: any, record: Banner) => 
        record.views > 0 ? `${((record.clicks / record.views) * 100).toFixed(2)}%` : '0%',
    },
    {
      title: 'عملیات',
      valueType: 'option',
      render: (_: any, record: Banner) => [
        <Button
          key="edit"
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEditBanner(record)}
        >
          ویرایش
        </Button>,
        <Button
          key="delete"
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteBanner(record.id)}
        >
          حذف
        </Button>,
      ],
    },
  ]

  // هندلرهای کمپین
  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    campaignForm.setFieldsValue(campaign)
    setCampaignModalVisible(true)
  }

  const handleViewCampaign = (campaign: Campaign) => {
    Modal.info({
      title: `جزئیات کمپین: ${campaign.name}`,
      content: (
        <div style={{ padding: '16px 0' }}>
          <p><strong>پیام:</strong> {campaign.message}</p>
          <p><strong>مخاطبین:</strong> {campaign.target.join(', ')}</p>
          <p><strong>تاریخ ایجاد:</strong> {campaign.createdAt}</p>
          {campaign.scheduledDate && (
            <p><strong>زمان ارسال:</strong> {campaign.scheduledDate}</p>
          )}
        </div>
      ),
      width: 600,
    })
  }

  const handleDeleteCampaign = (id: string) => {
    Modal.confirm({
      title: 'حذف کمپین',
      content: 'آیا مطمئن هستید که می‌خواهید این کمپین را حذف کنید؟',
      okText: 'حذف',
      cancelText: 'انصراف',
      onOk: () => {
        message.success('کمپین با موفقیت حذف شد')
        campaignActionRef.current?.reload()
      },
    })
  }

  // هندلرهای بنر
  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner)
    bannerForm.setFieldsValue(banner)
    setBannerModalVisible(true)
  }

  const handleDeleteBanner = (id: string) => {
    Modal.confirm({
      title: 'حذف بنر',
      content: 'آیا مطمئن هستید که می‌خواهید این بنر را حذف کنید؟',
      okText: 'حذف',
      cancelText: 'انصراف',
      onOk: () => {
        message.success('بنر با موفقیت حذف شد')
        bannerActionRef.current?.reload()
      },
    })
  }

  // داده‌های نمودار عملکرد کمپین‌ها
  const campaignPerformanceData = [
    { month: 'فروردین', sms: 1250, email: 890, notification: 3200 },
    { month: 'اردیبهشت', sms: 1450, email: 1020, notification: 3800 },
    { month: 'خرداد', sms: 1680, email: 1150, notification: 4200 },
    { month: 'تیر', sms: 1820, email: 1280, notification: 4600 },
  ]

  const performanceConfig = {
    data: campaignPerformanceData,
    xField: 'month',
    yField: ['sms', 'email', 'notification'],
    geometryOptions: [
      { geometry: 'column', color: '#5B8FF9' },
      { geometry: 'column', color: '#5AD8A6' },
      { geometry: 'column', color: '#F6BD16' },
    ],
  }

  // آمار کلی
  const totalCampaigns = campaignsData.length
  const activeCampaigns = campaignsData.filter(c => c.status === 'active').length
  const totalSent = campaignsData.reduce((sum, c) => sum + c.sentCount, 0)
  const avgOpenRate = campaignsData.reduce((sum, c) => sum + c.openRate, 0) / campaignsData.length

  return (
    <div style={{ padding: '24px' }}>
      <ProCard 
        title="مدیریت تبلیغات و نوتیفیکیشن" 
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingCampaign(null)
                campaignForm.resetFields()
                setCampaignModalVisible(true)
              }}
            >
              ایجاد کمپین جدید
            </Button>
          </Space>
        }
      >
        {/* آمار کلی */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="کل کمپین‌ها"
                value={totalCampaigns}
                prefix={<ApiOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="کمپین‌های فعال"
                value={activeCampaigns}
                prefix={<BellOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="کل ارسال شده"
                value={totalSent}
                prefix={<SendOutlined />}
                formatter={(value) => value?.toLocaleString('fa-IR')}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="میانگین نرخ بازدید"
                value={avgOpenRate.toFixed(1)}
                suffix="%"
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'campaigns',
              label: (
                <span>
                  <MessageOutlined />
                  کمپین‌های بازاریابی
                </span>
              ),
              children: (
                <ProTable<Campaign>
                  columns={campaignColumns}
                  actionRef={campaignActionRef}
                  request={async () => ({
                    data: campaignsData,
                    success: true,
                    total: campaignsData.length,
                  })}
                  rowKey="id"
                  search={{
                    labelWidth: 'auto',
                  }}
                  pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                  }}
                  dateFormatter="string"
                  headerTitle="لیست کمپین‌ها"
                  toolBarRender={() => [
                    <Button
                      key="button"
                      icon={<PlusOutlined />}
                      type="primary"
                      onClick={() => {
                        setEditingCampaign(null)
                        campaignForm.resetFields()
                        setCampaignModalVisible(true)
                      }}
                    >
                      کمپین جدید
                    </Button>,
                  ]}
                />
              ),
            },
            {
              key: 'banners',
              label: (
                <span>
                  <BellOutlined />
                  بنرهای تبلیغاتی
                </span>
              ),
              children: (
                <ProTable<Banner>
                  columns={bannerColumns}
                  actionRef={bannerActionRef}
                  request={async () => ({
                    data: bannersData,
                    success: true,
                    total: bannersData.length,
                  })}
                  rowKey="id"
                  search={{
                    labelWidth: 'auto',
                  }}
                  pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                  }}
                  dateFormatter="string"
                  headerTitle="لیست بنرها"
                  toolBarRender={() => [
                    <Button
                      key="button"
                      icon={<PlusOutlined />}
                      type="primary"
                      onClick={() => {
                        setEditingBanner(null)
                        bannerForm.resetFields()
                        setBannerModalVisible(true)
                      }}
                    >
                      بنر جدید
                    </Button>,
                  ]}
                />
              ),
            },
            {
              key: 'analytics',
              label: (
                <span>
                  <BarChartOutlined />
                  آنالیتیکس
                </span>
              ),
              children: (
                <Row gutter={16}>
                  <Col span={24}>
                    <Card title="عملکرد کمپین‌ها">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={campaignPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="sms" fill="#5B8FF9" name="پیامک" />
                          <Bar dataKey="email" fill="#5AD8A6" name="ایمیل" />
                          <Bar dataKey="notification" fill="#F6BD16" name="اعلان" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </Row>
              ),
            },
          ]}
        />
      </ProCard>

      {/* مودال ایجاد/ویرایش کمپین */}
      <Modal
        title={editingCampaign ? 'ویرایش کمپین' : 'ایجاد کمپین جدید'}
        open={campaignModalVisible}
        onCancel={() => setCampaignModalVisible(false)}
        footer={null}
        width={800}
      >
        <ProForm
          form={campaignForm}
          onFinish={async (values) => {
            console.log('Campaign values:', values)
            message.success(editingCampaign ? 'کمپین با موفقیت ویرایش شد' : 'کمپین جدید ایجاد شد')
            setCampaignModalVisible(false)
            campaignActionRef.current?.reload()
          }}
          layout="vertical"
        >
          <ProFormText
            name="name"
            label="نام کمپین"
            placeholder="نام کمپین را وارد کنید"
            rules={[{ required: true, message: 'نام کمپین الزامی است!' }]}
          />
          
          <ProFormSelect
            name="type"
            label="نوع کمپین"
            options={[
              { label: 'پیامک', value: 'sms' },
              { label: 'اعلان', value: 'notification' },
              { label: 'ایمیل', value: 'email' },
              { label: 'بنر', value: 'banner' },
            ]}
            rules={[{ required: true, message: 'نوع کمپین الزامی است!' }]}
          />

          <ProFormTreeSelect
            name="target"
            label="مخاطبین هدف"
            placeholder="گروه‌های هدف را انتخاب کنید"
            allowClear
            fieldProps={{
              multiple: true,
              treeData: [
                {
                  title: 'همه مشتریان',
                  value: 'all',
                  children: [
                    { title: 'مشتریان VIP', value: 'vip' },
                    { title: 'مشتریان عادی', value: 'regular' },
                    { title: 'مشتریان جدید', value: 'new' },
                    { title: 'مشتریان غیرفعال', value: 'inactive' },
                  ],
                },
                {
                  title: 'بر اساس منطقه',
                  value: 'location',
                  children: [
                    { title: 'تهران', value: 'tehran' },
                    { title: 'اصفهان', value: 'isfahan' },
                    { title: 'شیراز', value: 'shiraz' },
                  ],
                },
              ]
            }}
            rules={[{ required: true, message: 'انتخاب مخاطبین الزامی است!' }]}
          />

          <ProFormTextArea
            name="message"
            label="متن پیام"
            placeholder="متن کمپین را وارد کنید"
            rules={[{ required: true, message: 'متن پیام الزامی است!' }]}
            fieldProps={{
              rows: 4,
              showCount: true,
              maxLength: 500,
            }}
          />

          <ProFormSelect
            name="status"
            label="وضعیت"
            options={[
              { label: 'پیش‌نویس', value: 'draft' },
              { label: 'زمان‌بندی شده', value: 'scheduled' },
              { label: 'فعال', value: 'active' },
            ]}
            initialValue="draft"
          />
        </ProForm>
      </Modal>

      {/* مودال ایجاد/ویرایش بنر */}
      <Modal
        title={editingBanner ? 'ویرایش بنر' : 'ایجاد بنر جدید'}
        open={bannerModalVisible}
        onCancel={() => setBannerModalVisible(false)}
        footer={null}
        width={600}
      >
        <ProForm
          form={bannerForm}
          onFinish={async (values) => {
            console.log('Banner values:', values)
            message.success(editingBanner ? 'بنر با موفقیت ویرایش شد' : 'بنر جدید ایجاد شد')
            setBannerModalVisible(false)
            bannerActionRef.current?.reload()
          }}
          layout="vertical"
        >
          <ProFormText
            name="title"
            label="عنوان بنر"
            placeholder="عنوان بنر را وارد کنید"
            rules={[{ required: true, message: 'عنوان بنر الزامی است!' }]}
          />
          
          <ProFormText
            name="image"
            label="تصویر بنر"
            tooltip="آدرس تصویر را وارد کنید یا از بخش آپلود استفاده کنید"
            extra="فرمت‌های مجاز: JPG, PNG, GIF - حداکثر حجم: 2MB"
          />

          <ProFormSelect
            name="position"
            label="موقعیت نمایش"
            options={[
              { label: 'هدر سایت', value: 'header' },
              { label: 'کناری', value: 'sidebar' },
              { label: 'پاپ‌آپ', value: 'popup' },
              { label: 'فوتر', value: 'footer' },
            ]}
            rules={[{ required: true, message: 'موقعیت نمایش الزامی است!' }]}
          />

          <ProFormText
            name="link"
            label="لینک (اختیاری)"
            placeholder="آدرس لینک را وارد کنید"
          />
        </ProForm>
      </Modal>
    </div>
  )
}
