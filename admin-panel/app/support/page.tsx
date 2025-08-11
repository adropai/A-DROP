'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Space, 
  Tag, 
  Avatar, 
  Modal, 
  message,
  Tabs,
  Badge,
  Descriptions,
  Input,
  Form,
  Select,
  Typography
} from 'antd'
import { 
  ProTable, 
  ProForm, 
  ProFormText, 
  ProFormSelect, 
  ProFormTextArea,
  ProCard,
  StatisticCard
} from '@ant-design/pro-components'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  MessageOutlined,
  PhoneOutlined,
  MailOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons'
import type { ActionType, ProColumns } from '@ant-design/pro-components'

const { TabPane } = Tabs
const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

interface SupportTicket {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'billing' | 'general' | 'complaint'
  customerName: string
  customerEmail: string
  customerPhone?: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  responses: SupportResponse[]
}

interface SupportResponse {
  id: string
  ticketId: string
  message: string
  isStaff: boolean
  author: string
  createdAt: Date
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  isActive: boolean
  viewCount: number
  createdAt: Date
}

export default function SupportPage() {
  const [currentTab, setCurrentTab] = useState('tickets')
  const [isTicketModalVisible, setIsTicketModalVisible] = useState(false)
  const [isFAQModalVisible, setIsFAQModalVisible] = useState(false)
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [ticketForm] = Form.useForm()
  const [faqForm] = Form.useForm()
  const actionRef = useRef<ActionType>()

  // State management
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [faqs, setFAQs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(false)
  const [supportStats, setSupportStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: '0 ساعت'
  })

  // Load data
  const loadTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/support/tickets')
      const data = await response.json()
      
      if (data.success) {
        setTickets(data.data)
        setSupportStats({
          totalTickets: data.stats.total,
          openTickets: data.stats.open,
          resolvedTickets: data.stats.resolved,
          avgResponseTime: '2.5 ساعت'
        })
      }
    } catch (error) {
      message.error('خطا در بارگذاری تیکت‌ها')
    } finally {
      setLoading(false)
    }
  }

  const loadFAQs = async () => {
    try {
      const response = await fetch('/api/support/faq')
      const data = await response.json()
      
      if (data.success) {
        setFAQs(data.data)
      }
    } catch (error) {
      message.error('خطا در بارگذاری سوالات متداول')
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadTickets()
    loadFAQs()
  }, [])

  const handleSubmitTicket = async (values: any) => {
    try {
      setLoading(true)
      const url = editingTicket ? '/api/support/tickets' : '/api/support/tickets'
      const method = editingTicket ? 'PUT' : 'POST'
      
      const body = editingTicket 
        ? { id: editingTicket.id, ...values }
        : values

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        message.success(data.message)
        setIsTicketModalVisible(false)
        setEditingTicket(null)
        ticketForm.resetFields()
        loadTickets() // Reload data
        actionRef.current?.reload()
      } else {
        message.error(data.error || 'خطا در ذخیره تیکت')
      }
    } catch (error) {
      message.error('خطا در ذخیره تیکت')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFAQ = async (values: any) => {
    try {
      setLoading(true)
      const url = '/api/support/faq'
      const method = editingFAQ ? 'PUT' : 'POST'
      
      const body = editingFAQ 
        ? { id: editingFAQ.id, ...values }
        : values

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        message.success(data.message)
        setIsFAQModalVisible(false)
        setEditingFAQ(null)
        faqForm.resetFields()
        loadFAQs() // Reload data
      } else {
        message.error(data.error || 'خطا در ذخیره سوال')
      }
    } catch (error) {
      message.error('خطا در ذخیره سوال')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTicket = async (id: string) => {
    try {
      const response = await fetch(`/api/support/tickets?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        message.success('تیکت حذف شد')
        loadTickets()
        actionRef.current?.reload()
      } else {
        message.error(data.error || 'خطا در حذف تیکت')
      }
    } catch (error) {
      message.error('خطا در حذف تیکت')
    }
  }

  const handleDeleteFAQ = async (id: string) => {
    try {
      const response = await fetch(`/api/support/faq?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        message.success('سوال حذف شد')
        loadFAQs()
      } else {
        message.error(data.error || 'خطا در حذف سوال')
      }
    } catch (error) {
      message.error('خطا در حذف سوال')
    }
  }

  const ticketColumns: ProColumns<SupportTicket>[] = [
    {
      title: 'شناسه',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'عنوان',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.title}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.customerName} - {record.customerEmail}
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
          open: { color: 'red', text: 'باز' },
          in_progress: { color: 'orange', text: 'در حال بررسی' },
          resolved: { color: 'green', text: 'حل شده' },
          closed: { color: 'gray', text: 'بسته شده' }
        }
        return (
          <Tag color={statusConfig[status as keyof typeof statusConfig]?.color}>
            {statusConfig[status as keyof typeof statusConfig]?.text}
          </Tag>
        )
      },
      filters: [
        { text: 'باز', value: 'open' },
        { text: 'در حال بررسی', value: 'in_progress' },
        { text: 'حل شده', value: 'resolved' },
        { text: 'بسته شده', value: 'closed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'اولویت',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const priorityConfig = {
          low: { color: 'green', text: 'کم' },
          medium: { color: 'orange', text: 'متوسط' },
          high: { color: 'red', text: 'بالا' },
          urgent: { color: 'magenta', text: 'فوری' }
        }
        return (
          <Tag color={priorityConfig[priority as keyof typeof priorityConfig]?.color}>
            {priorityConfig[priority as keyof typeof priorityConfig]?.text}
          </Tag>
        )
      },
    },
    {
      title: 'دسته‌بندی',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const categoryNames = {
          technical: 'فنی',
          billing: 'مالی',
          general: 'عمومی',
          complaint: 'شکایت'
        }
        return categoryNames[category as keyof typeof categoryNames]
      },
    },
    {
      title: 'تاریخ ایجاد',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: any) => {
        if (!date) return '-'
        const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)
        return dateObj.toLocaleDateString('fa-IR')
      },
      sorter: (a: SupportTicket, b: SupportTicket) => {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return dateA.getTime() - dateB.getTime()
      },
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingTicket(record)
              ticketForm.setFieldsValue(record)
              setIsTicketModalVisible(true)
            }}
          >
            ویرایش
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'حذف تیکت',
                content: 'آیا از حذف این تیکت اطمینان دارید؟',
                onOk: () => handleDeleteTicket(record.id),
              })
            }}
          >
            حذف
          </Button>
        </Space>
      ),
    },
  ]

  const faqColumns: ProColumns<FAQ>[] = [
    {
      title: 'سوال',
      dataIndex: 'question',
      key: 'question',
    },
    {
      title: 'دسته‌بندی',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'وضعیت',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'فعال' : 'غیرفعال'}
        </Tag>
      ),
    },
    {
      title: 'تعداد بازدید',
      dataIndex: 'viewCount',
      key: 'viewCount',
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingFAQ(record)
              faqForm.setFieldsValue(record)
              setIsFAQModalVisible(true)
            }}
          >
            ویرایش
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'حذف سوال',
                content: 'آیا از حذف این سوال اطمینان دارید؟',
                onOk: () => handleDeleteFAQ(record.id),
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
      <Title level={2}>مرکز پشتیبانی</Title>
      
      {/* آمار کلی */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <ProCard>
            <StatisticCard
              statistic={{
                title: 'کل تیکت‌ها',
                value: supportStats.totalTickets,
                icon: <MessageOutlined style={{ color: '#1890ff' }} />,
              }}
            />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard>
            <StatisticCard
              statistic={{
                title: 'تیکت‌های باز',
                value: supportStats.openTickets,
                icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
              }}
            />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard>
            <StatisticCard
              statistic={{
                title: 'حل شده',
                value: supportStats.resolvedTickets,
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
              }}
            />
          </ProCard>
        </Col>
        <Col span={6}>
          <ProCard>
            <StatisticCard
              statistic={{
                title: 'میانگین پاسخ',
                value: supportStats.avgResponseTime,
                icon: <ClockCircleOutlined style={{ color: '#722ed1' }} />,
              }}
            />
          </ProCard>
        </Col>
      </Row>

      {/* محتوای اصلی */}
      <Card>
        <Tabs activeKey={currentTab} onChange={setCurrentTab}>
          <TabPane 
            tab={
              <span>
                <MessageOutlined />
                تیکت‌های پشتیبانی
              </span>
            } 
            key="tickets"
          >
            <ProTable<SupportTicket>
              actionRef={actionRef}
              columns={ticketColumns}
              dataSource={tickets}
              loading={loading}
              rowKey="id"
              search={{
                labelWidth: 'auto',
              }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              dateFormatter="string"
              headerTitle="تیکت‌های پشتیبانی"
              toolBarRender={() => [
                <Button
                  key="add"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingTicket(null)
                    ticketForm.resetFields()
                    setIsTicketModalVisible(true)
                  }}
                >
                  تیکت جدید
                </Button>,
              ]}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <QuestionCircleOutlined />
                سوالات متداول
              </span>
            } 
            key="faq"
          >
            <ProTable<FAQ>
              columns={faqColumns}
              dataSource={faqs}
              loading={loading}
              rowKey="id"
              search={{
                labelWidth: 'auto',
              }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              dateFormatter="string"
              headerTitle="سوالات متداول"
              toolBarRender={() => [
                <Button
                  key="add"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingFAQ(null)
                    faqForm.resetFields()
                    setIsFAQModalVisible(true)
                  }}
                >
                  سوال جدید
                </Button>,
              ]}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal تیکت */}
      <Modal
        title={editingTicket ? 'ویرایش تیکت' : 'تیکت جدید'}
        open={isTicketModalVisible}
        onCancel={() => {
          setIsTicketModalVisible(false)
          setEditingTicket(null)
          ticketForm.resetFields()
        }}
        footer={null}
        width={800}
      >
        <ProForm
          form={ticketForm}
          onFinish={handleSubmitTicket}
          layout="vertical"
          submitter={{
            searchConfig: {
              resetText: 'انصراف',
              submitText: editingTicket ? 'ویرایش' : 'ایجاد',
            },
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="customerName"
                label="نام مشتری"
                rules={[{ required: true, message: 'نام مشتری الزامی است' }]}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="customerEmail"
                label="ایمیل مشتری"
                rules={[
                  { required: true, message: 'ایمیل الزامی است' },
                  { type: 'email', message: 'فرمت ایمیل صحیح نیست' }
                ]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="customerPhone"
                label="تلفن مشتری"
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="assignedTo"
                label="تخصیص به"
                options={[
                  { label: 'پشتیبان 1', value: 'پشتیبان 1' },
                  { label: 'پشتیبان 2', value: 'پشتیبان 2' },
                  { label: 'مدیر پشتیبانی', value: 'مدیر پشتیبانی' },
                ]}
              />
            </Col>
          </Row>

          <ProFormText
            name="title"
            label="عنوان تیکت"
            rules={[{ required: true, message: 'عنوان الزامی است' }]}
          />

          <ProFormTextArea
            name="description"
            label="توضیحات"
            rules={[{ required: true, message: 'توضیحات الزامی است' }]}
            fieldProps={{ rows: 4 }}
          />

          <Row gutter={16}>
            <Col span={8}>
              <ProFormSelect
                name="status"
                label="وضعیت"
                options={[
                  { label: 'باز', value: 'open' },
                  { label: 'در حال بررسی', value: 'in_progress' },
                  { label: 'حل شده', value: 'resolved' },
                  { label: 'بسته شده', value: 'closed' },
                ]}
                rules={[{ required: true, message: 'وضعیت الزامی است' }]}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="priority"
                label="اولویت"
                options={[
                  { label: 'کم', value: 'low' },
                  { label: 'متوسط', value: 'medium' },
                  { label: 'بالا', value: 'high' },
                  { label: 'فوری', value: 'urgent' },
                ]}
                rules={[{ required: true, message: 'اولویت الزامی است' }]}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="category"
                label="دسته‌بندی"
                options={[
                  { label: 'فنی', value: 'technical' },
                  { label: 'مالی', value: 'billing' },
                  { label: 'عمومی', value: 'general' },
                  { label: 'شکایت', value: 'complaint' },
                ]}
                rules={[{ required: true, message: 'دسته‌بندی الزامی است' }]}
              />
            </Col>
          </Row>
        </ProForm>
      </Modal>

      {/* Modal سوالات متداول */}
      <Modal
        title={editingFAQ ? 'ویرایش سوال' : 'سوال جدید'}
        open={isFAQModalVisible}
        onCancel={() => {
          setIsFAQModalVisible(false)
          setEditingFAQ(null)
          faqForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <ProForm
          form={faqForm}
          onFinish={handleSubmitFAQ}
          layout="vertical"
          submitter={{
            searchConfig: {
              resetText: 'انصراف',
              submitText: editingFAQ ? 'ویرایش' : 'ایجاد',
            },
          }}
        >
          <ProFormText
            name="question"
            label="سوال"
            rules={[{ required: true, message: 'سوال الزامی است' }]}
          />

          <ProFormTextArea
            name="answer"
            label="پاسخ"
            rules={[{ required: true, message: 'پاسخ الزامی است' }]}
            fieldProps={{ rows: 4 }}
          />

          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="category"
                label="دسته‌بندی"
                rules={[{ required: true, message: 'دسته‌بندی الزامی است' }]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="isActive"
                label="وضعیت"
                options={[
                  { label: 'فعال', value: true },
                  { label: 'غیرفعال', value: false },
                ]}
                rules={[{ required: true, message: 'وضعیت الزامی است' }]}
              />
            </Col>
          </Row>
        </ProForm>
      </Modal>
    </div>
  )
}
