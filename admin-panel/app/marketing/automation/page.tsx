'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Tabs, 
  Button, 
  Table, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Switch, 
  Progress, 
  Statistic, 
  message,
  Divider,
  Typography,
  Alert,
  Tooltip,
  Badge,
  Timeline,
  Steps
} from 'antd'
import { 
  ProCard, 
  ProTable, 
  ProForm, 
  ProFormText, 
  ProFormSelect, 
  ProFormTextArea, 
  ProFormSwitch, 
  ProFormDateRangePicker,
  ProFormDigit,
  StatisticCard
} from '@ant-design/pro-components'
import { 
  RocketOutlined,
  MailOutlined, 
  MessageOutlined,
  BellOutlined,
  UserOutlined,
  BarChartOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  EyeOutlined,
  SendOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { useRef } from 'react'

const { TabPane } = Tabs
const { Title, Text } = Typography
const { Option } = Select
const { Step } = Steps
const { RangePicker } = DatePicker

interface MarketingCampaign {
  id: string
  name: string
  type: 'email' | 'sms' | 'push' | 'automation'
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  targetSegment: string
  subject: string
  content: string
  scheduledDate?: Date
  startDate?: Date
  endDate?: Date
  budget?: number
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
    revenue: number
  }
  createdAt: Date
  updatedAt: Date
}

interface CustomerSegment {
  id: string
  name: string
  description: string
  criteria: {
    rfm_score?: string
    last_order_days?: number
    total_orders?: number
    total_spent?: number
    location?: string
    age_range?: string
    preferred_categories?: string[]
  }
  customerCount: number
  isActive: boolean
  createdAt: Date
}

interface AutomationRule {
  id: string
  name: string
  trigger: {
    type: 'order_placed' | 'birthday' | 'inactive_days' | 'first_order' | 'cart_abandoned'
    conditions: any
  }
  actions: {
    type: 'send_email' | 'send_sms' | 'send_push' | 'add_to_segment'
    template: string
    delay?: number
  }[]
  isActive: boolean
  stats: {
    triggered: number
    completed: number
    conversion_rate: number
  }
  createdAt: Date
}

export default function MarketingAutomationPage() {
  const [currentTab, setCurrentTab] = useState('campaigns')
  const [loading, setLoading] = useState(false)
  const actionRef = useRef<ActionType>()

  // State management
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([])
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [automations, setAutomations] = useState<AutomationRule[]>([])
  const [campaignModalVisible, setCampaignModalVisible] = useState(false)
  const [segmentModalVisible, setSegmentModalVisible] = useState(false)
  const [automationModalVisible, setAutomationModalVisible] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null)
  const [editingSegment, setEditingSegment] = useState<CustomerSegment | null>(null)
  const [editingAutomation, setEditingAutomation] = useState<AutomationRule | null>(null)

  // Forms
  const [campaignForm] = Form.useForm()
  const [segmentForm] = Form.useForm()
  const [automationForm] = Form.useForm()

  // Marketing stats
  const [marketingStats, setMarketingStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSent: 0,
    averageOpenRate: 0,
    totalRevenue: 0,
    automationRules: 0
  })

  // Load data on component mount
  useEffect(() => {
    loadCampaigns()
    loadSegments()
    loadAutomations()
    loadMarketingStats()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/marketing/campaigns')
      const data = await response.json()
      if (data.success) {
        setCampaigns(data.data)
      }
    } catch (error) {
      message.error('خطا در بارگذاری کمپین‌ها')
    } finally {
      setLoading(false)
    }
  }

  const loadSegments = async () => {
    try {
      const response = await fetch('/api/marketing/segments')
      const data = await response.json()
      if (data.success) {
        setSegments(data.data)
      }
    } catch (error) {
      message.error('خطا در بارگذاری بخش‌بندی‌ها')
    }
  }

  const loadAutomations = async () => {
    try {
      const response = await fetch('/api/marketing/automations')
      const data = await response.json()
      if (data.success) {
        setAutomations(data.data)
      }
    } catch (error) {
      message.error('خطا در بارگذاری اتوماسیون‌ها')
    }
  }

  const loadMarketingStats = async () => {
    try {
      const response = await fetch('/api/marketing/stats')
      const data = await response.json()
      if (data.success) {
        setMarketingStats(data.data)
      }
    } catch (error) {
      message.error('خطا در بارگذاری آمار')
    }
  }

  const handleSaveCampaign = async (values: any) => {
    try {
      setLoading(true)
      const url = '/api/marketing/campaigns'
      const method = editingCampaign ? 'PUT' : 'POST'
      
      const body = editingCampaign 
        ? { id: editingCampaign.id, ...values }
        : values

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      if (data.success) {
        message.success(data.message)
        setCampaignModalVisible(false)
        setEditingCampaign(null)
        campaignForm.resetFields()
        loadCampaigns()
        actionRef.current?.reload()
      } else {
        message.error(data.error)
      }
    } catch (error) {
      message.error('خطا در ذخیره کمپین')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSegment = async (values: any) => {
    try {
      setLoading(true)
      const url = '/api/marketing/segments'
      const method = editingSegment ? 'PUT' : 'POST'
      
      const body = editingSegment 
        ? { id: editingSegment.id, ...values }
        : values

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      if (data.success) {
        message.success(data.message)
        setSegmentModalVisible(false)
        setEditingSegment(null)
        segmentForm.resetFields()
        loadSegments()
      } else {
        message.error(data.error)
      }
    } catch (error) {
      message.error('خطا در ذخیره بخش‌بندی')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAutomation = async (values: any) => {
    try {
      setLoading(true)
      const url = '/api/marketing/automations'
      const method = editingAutomation ? 'PUT' : 'POST'
      
      const body = editingAutomation 
        ? { id: editingAutomation.id, ...values }
        : values

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      if (data.success) {
        message.success(data.message)
        setAutomationModalVisible(false)
        setEditingAutomation(null)
        automationForm.resetFields()
        loadAutomations()
      } else {
        message.error(data.error)
      }
    } catch (error) {
      message.error('خطا در ذخیره اتوماسیون')
    } finally {
      setLoading(false)
    }
  }

  const handleCampaignAction = async (id: string, action: 'start' | 'pause' | 'stop' | 'delete') => {
    try {
      const response = await fetch(`/api/marketing/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      const data = await response.json()
      if (data.success) {
        message.success(data.message)
        loadCampaigns()
        actionRef.current?.reload()
      } else {
        message.error(data.error)
      }
    } catch (error) {
      message.error('خطا در اجرای عملیات')
    }
  }

  // Columns for campaigns table
  const campaignColumns: ProColumns<MarketingCampaign>[] = [
    {
      title: 'نام کمپین',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.type === 'email' && '📧 ایمیل'}
            {record.type === 'sms' && '📱 پیامک'}
            {record.type === 'push' && '🔔 Push'}
            {record.type === 'automation' && '🤖 اتوماسیون'}
          </div>
        </div>
      ),
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          draft: { color: 'default', text: 'پیش‌نویس' },
          active: { color: 'green', text: 'فعال' },
          paused: { color: 'orange', text: 'متوقف' },
          completed: { color: 'blue', text: 'تکمیل شده' },
          cancelled: { color: 'red', text: 'لغو شده' }
        }
        return (
          <Tag color={statusConfig[status as keyof typeof statusConfig]?.color}>
            {statusConfig[status as keyof typeof statusConfig]?.text}
          </Tag>
        )
      },
    },
    {
      title: 'مخاطبان',
      dataIndex: 'targetSegment',
      key: 'targetSegment',
    },
    {
      title: 'آمار',
      key: 'metrics',
      render: (_, record) => (
        <div>
          <div>ارسال: {record.metrics.sent}</div>
          <div>باز شده: {record.metrics.opened} ({record.metrics.sent > 0 ? Math.round((record.metrics.opened / record.metrics.sent) * 100) : 0}%)</div>
          <div>کلیک: {record.metrics.clicked}</div>
        </div>
      ),
    },
    {
      title: 'درآمد',
      dataIndex: ['metrics', 'revenue'],
      key: 'revenue',
      render: (revenue) => revenue ? `${revenue.toLocaleString()} تومان` : '-',
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'draft' && (
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              onClick={() => handleCampaignAction(record.id, 'start')}
            >
              شروع
            </Button>
          )}
          {record.status === 'active' && (
            <Button
              type="link"
              icon={<PauseCircleOutlined />}
              onClick={() => handleCampaignAction(record.id, 'pause')}
            >
              توقف
            </Button>
          )}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCampaign(record)
              campaignForm.setFieldsValue(record)
              setCampaignModalVisible(true)
            }}
          >
            ویرایش
          </Button>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              // Show campaign details modal
            }}
          >
            مشاهده
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'حذف کمپین',
                content: 'آیا از حذف این کمپین اطمینان دارید؟',
                onOk: () => handleCampaignAction(record.id, 'delete'),
              })
            }}
          >
            حذف
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={18}>
          <Title level={2}>
            <RocketOutlined style={{ marginRight: '8px' }} />
            اتوماسیون تبلیغاتی
          </Title>
        </Col>
        <Col span={6} style={{ textAlign: 'right' }}>
          <Badge count={marketingStats.activeCampaigns}>
            <Button icon={<CheckCircleOutlined />}>
              کمپین‌های فعال
            </Button>
          </Badge>
        </Col>
      </Row>

      {/* آمار کلی */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={4}>
          <ProCard>
            <StatisticCard
              statistic={{
                title: 'کل کمپین‌ها',
                value: marketingStats.totalCampaigns,
                icon: <RocketOutlined style={{ color: '#1890ff' }} />,
              }}
            />
          </ProCard>
        </Col>
        <Col span={4}>
          <ProCard>
            <StatisticCard
              statistic={{
                title: 'کمپین‌های فعال',
                value: marketingStats.activeCampaigns,
                icon: <PlayCircleOutlined style={{ color: '#52c41a' }} />,
              }}
            />
          </ProCard>
        </Col>
        <Col span={4}>
          <ProCard>
            <StatisticCard
              statistic={{
                title: 'کل ارسال',
                value: marketingStats.totalSent,
                icon: <SendOutlined style={{ color: '#faad14' }} />,
              }}
            />
          </ProCard>
        </Col>
        <Col span={4}>
          <ProCard>
            <StatisticCard
              statistic={{
                title: 'نرخ باز شدن',
                value: marketingStats.averageOpenRate,
                suffix: '%',
                icon: <EyeOutlined style={{ color: '#722ed1' }} />,
              }}
            />
          </ProCard>
        </Col>
        <Col span={4}>
          <ProCard>
            <StatisticCard
              statistic={{
                title: 'درآمد',
                value: marketingStats.totalRevenue,
                suffix: 'تومان',
                icon: <DollarOutlined style={{ color: '#13c2c2' }} />,
              }}
            />
          </ProCard>
        </Col>
        <Col span={4}>
          <ProCard>
            <StatisticCard
              statistic={{
                title: 'اتوماسیون‌ها',
                value: marketingStats.automationRules,
                icon: <UserOutlined style={{ color: '#eb2f96' }} />,
              }}
            />
          </ProCard>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={currentTab} onChange={setCurrentTab}>
          
          {/* کمپین‌های تبلیغاتی */}
          <TabPane 
            tab={
              <span>
                <RocketOutlined />
                کمپین‌ها
              </span>
            } 
            key="campaigns"
          >
            <ProTable<MarketingCampaign>
              actionRef={actionRef}
              columns={campaignColumns}
              dataSource={campaigns}
              rowKey="id"
              loading={loading}
              search={{
                labelWidth: 'auto',
              }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              dateFormatter="string"
              headerTitle="کمپین‌های تبلیغاتی"
              toolBarRender={() => [
                <Button
                  key="add"
                  type="primary"
                  icon={<PlusOutlined />}
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
          </TabPane>

          {/* بخش‌بندی مشتریان */}
          <TabPane 
            tab={
              <span>
                <UserOutlined />
                بخش‌بندی مشتریان
              </span>
            } 
            key="segments"
          >
            <Alert
              message="بخش‌بندی هوشمند مشتریان"
              description="مشتریان را بر اساس رفتار، سابقه خرید و ویژگی‌های دموگرافیک دسته‌بندی کنید."
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />

            <Row gutter={16}>
              {segments.map((segment) => (
                <Col span={8} key={segment.id} style={{ marginBottom: '16px' }}>
                  <Card
                    size="small"
                    title={segment.name}
                    extra={
                      <Space>
                        <Switch
                          checked={segment.isActive}
                          size="small"
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditingSegment(segment)
                            segmentForm.setFieldsValue(segment)
                            setSegmentModalVisible(true)
                          }}
                        />
                      </Space>
                    }
                  >
                    <Statistic
                      title="تعداد مشتری"
                      value={segment.customerCount}
                      suffix="نفر"
                    />
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      {segment.description}
                    </div>
                  </Card>
                </Col>
              ))}
              
              <Col span={8}>
                <Card
                  size="small"
                  style={{ 
                    border: '2px dashed #d9d9d9',
                    textAlign: 'center',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingSegment(null)
                      segmentForm.resetFields()
                      setSegmentModalVisible(true)
                    }}
                  >
                    بخش‌بندی جدید
                  </Button>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* اتوماسیون تبلیغات */}
          <TabPane 
            tab={
              <span>
                <UserOutlined />
                اتوماسیون
              </span>
            } 
            key="automation"
          >
            <Alert
              message="اتوماسیون تبلیغاتی"
              description="قوانین هوشمند برای ارسال خودکار پیام‌ها بر اساس رفتار مشتریان تنظیم کنید."
              type="success"
              showIcon
              style={{ marginBottom: '16px' }}
            />

            <Row gutter={16}>
              {automations.map((automation) => (
                <Col span={12} key={automation.id} style={{ marginBottom: '16px' }}>
                  <Card
                    title={automation.name}
                    extra={
                      <Space>
                        <Switch
                          checked={automation.isActive}
                          size="small"
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditingAutomation(automation)
                            automationForm.setFieldsValue(automation)
                            setAutomationModalVisible(true)
                          }}
                        />
                      </Space>
                    }
                  >
                    <div style={{ marginBottom: '16px' }}>
                      <Tag color="blue">
                        {automation.trigger.type === 'order_placed' && 'سفارش جدید'}
                        {automation.trigger.type === 'birthday' && 'تولد مشتری'}
                        {automation.trigger.type === 'inactive_days' && 'عدم فعالیت'}
                        {automation.trigger.type === 'first_order' && 'اولین سفارش'}
                        {automation.trigger.type === 'cart_abandoned' && 'سبد رها شده'}
                      </Tag>
                    </div>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Statistic
                          title="اجرا شده"
                          value={automation.stats.triggered}
                          valueStyle={{ fontSize: '16px' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="تکمیل شده"
                          value={automation.stats.completed}
                          valueStyle={{ fontSize: '16px' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="نرخ تبدیل"
                          value={automation.stats.conversion_rate}
                          suffix="%"
                          valueStyle={{ fontSize: '16px' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}

              <Col span={12}>
                <Card
                  style={{ 
                    border: '2px dashed #d9d9d9',
                    textAlign: 'center',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Button
                    type="dashed"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingAutomation(null)
                      automationForm.resetFields()
                      setAutomationModalVisible(true)
                    }}
                  >
                    اتوماسیون جدید
                  </Button>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* آمار و گزارش */}
          <TabPane 
            tab={
              <span>
                <BarChartOutlined />
                آمار و گزارش
              </span>
            } 
            key="analytics"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Title level={4}>گزارش عملکرد تبلیغات</Title>
                <Text type="secondary">
                  آمار کلی از عملکرد کمپین‌های تبلیغاتی در بازه زمانی انتخابی
                </Text>
              </Col>
            </Row>

            {/* نمودارها و آمار تفصیلی اینجا اضافه می‌شود */}
            <div style={{ height: '400px', marginTop: '24px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <BarChartOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <div style={{ marginTop: '16px', color: '#999' }}>نمودارهای تفصیلی در نسخه بعدی</div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal کمپین جدید/ویرایش */}
      <Modal
        title={editingCampaign ? 'ویرایش کمپین' : 'کمپین جدید'}
        open={campaignModalVisible}
        onCancel={() => {
          setCampaignModalVisible(false)
          setEditingCampaign(null)
          campaignForm.resetFields()
        }}
        footer={null}
        width={800}
      >
        <ProForm
          form={campaignForm}
          onFinish={handleSaveCampaign}
          layout="vertical"
          submitter={{
            searchConfig: {
              resetText: 'انصراف',
              submitText: editingCampaign ? 'ویرایش' : 'ایجاد',
            },
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="name"
                label="نام کمپین"
                rules={[{ required: true, message: 'نام کمپین الزامی است' }]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="type"
                label="نوع کمپین"
                options={[
                  { label: '📧 ایمیل', value: 'email' },
                  { label: '📱 پیامک', value: 'sms' },
                  { label: '🔔 Push Notification', value: 'push' },
                  { label: '🤖 اتوماسیون', value: 'automation' },
                ]}
                rules={[{ required: true, message: 'نوع کمپین الزامی است' }]}
              />
            </Col>
          </Row>

          <ProFormSelect
            name="targetSegment"
            label="مخاطبان هدف"
            options={segments.map(segment => ({
              label: `${segment.name} (${segment.customerCount} نفر)`,
              value: segment.id
            }))}
            rules={[{ required: true, message: 'انتخاب مخاطبان الزامی است' }]}
          />

          <ProFormText
            name="subject"
            label="موضوع پیام"
            rules={[{ required: true, message: 'موضوع پیام الزامی است' }]}
          />

          <ProFormTextArea
            name="content"
            label="محتوای پیام"
            rules={[{ required: true, message: 'محتوای پیام الزامی است' }]}
            fieldProps={{ rows: 6 }}
            extra="می‌توانید از متغیرهای {نام_مشتری}، {نام_رستوران} استفاده کنید"
          />

          <Row gutter={16}>
            <Col span={12}>
              <ProFormDateRangePicker
                name="scheduledDate"
                label="بازه زمانی اجرا"
              />
            </Col>
            <Col span={12}>
              <ProFormDigit
                name="budget"
                label="بودجه (تومان)"
                fieldProps={{
                  formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                  parser: (value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0,
                }}
              />
            </Col>
          </Row>
        </ProForm>
      </Modal>

      {/* سایر Modal ها برای Segment و Automation در ادامه... */}

    </div>
  )
}
