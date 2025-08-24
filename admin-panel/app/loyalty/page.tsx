'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Input, 
  Select, 
  Row, 
  Col,
  Statistic,
  Typography,
  Modal,
  Form,
  message,
  Progress,
  Badge,
  Tabs,
  InputNumber,
  Switch,
  DatePicker,
  Divider
} from 'antd'
import {
  GiftOutlined,
  StarOutlined,
  CrownOutlined,
  TrophyOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PercentageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { Title, Text } = Typography
const { TabPane } = Tabs
const { TextArea } = Input

interface LoyaltyProgram {
  id: string
  name: string
  description: string
  type: 'points' | 'cashback' | 'discount' | 'tier'
  status: 'active' | 'inactive' | 'expired'
  startDate: string
  endDate?: string
  rules: {
    earnRate: number // نقاط کسب شده در ازای هر تومان
    redeemRate: number // مقدار تومان در ازای هر امتیاز
    minSpend?: number // حداقل خرید برای شرکت
    maxEarn?: number // حداکثر امتیاز کسب شده در روز
    conditions: string[]
  }
  rewards: {
    id: string
    name: string
    description: string
    pointsRequired: number
    discount?: number
    type: 'discount' | 'freeItem' | 'cashback'
    isActive: boolean
  }[]
  participants: number
  totalPointsIssued: number
  totalPointsRedeemed: number
  createdAt: string
}

interface LoyaltyTransaction {
  id: string
  customerId: string
  customerName: string
  programId: string
  programName: string
  type: 'earn' | 'redeem'
  points: number
  description: string
  orderId?: string
  createdAt: string
}

// Mock data
const mockPrograms: LoyaltyProgram[] = [
  {
    id: '1',
    name: 'برنامه امتیازی A-DROP',
    description: 'برنامه اصلی امتیازی رستوران با امکان کسب و مصرف امتیاز',
    type: 'points',
    status: 'active',
    startDate: '2024-01-01',
    rules: {
      earnRate: 0.1, // 0.1 امتیاز به ازای هر تومان
      redeemRate: 100, // 100 تومان به ازای هر امتیاز
      minSpend: 50000,
      maxEarn: 100,
      conditions: [
        'حداقل خرید 50,000 تومان',
        'حداکثر 100 امتیاز در روز',
        'امتیازات 1 سال معتبر'
      ]
    },
    rewards: [
      {
        id: 'r1',
        name: 'تخفیف 10%',
        description: 'تخفیف 10 درصدی برای سفارش بعدی',
        pointsRequired: 50,
        discount: 10,
        type: 'discount',
        isActive: true
      },
      {
        id: 'r2',
        name: 'نوشیدنی رایگان',
        description: 'یک نوشیدنی رایگان',
        pointsRequired: 25,
        type: 'freeItem',
        isActive: true
      },
      {
        id: 'r3',
        name: 'بازگشت نقدی',
        description: '10,000 تومان بازگشت نقدی',
        pointsRequired: 100,
        type: 'cashback',
        isActive: true
      }
    ],
    participants: 1250,
    totalPointsIssued: 125000,
    totalPointsRedeemed: 45000,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'برنامه VIP',
    description: 'برنامه ویژه مشتریان VIP با مزایای اختصاصی',
    type: 'tier',
    status: 'active',
    startDate: '2024-02-01',
    rules: {
      earnRate: 0.2, // دو برابر امتیاز
      redeemRate: 50, // 50 تومان به ازای هر امتیاز
      minSpend: 100000,
      conditions: [
        'حداقل خرید 100,000 تومان',
        'مشتریان VIP',
        'تحویل رایگان'
      ]
    },
    rewards: [
      {
        id: 'r4',
        name: 'تخفیف 20%',
        description: 'تخفیف 20 درصدی ویژه VIP',
        pointsRequired: 30,
        discount: 20,
        type: 'discount',
        isActive: true
      },
      {
        id: 'r5',
        name: 'غذای رایگان',
        description: 'یک وعده غذای رایگان',
        pointsRequired: 80,
        type: 'freeItem',
        isActive: true
      }
    ],
    participants: 85,
    totalPointsIssued: 34000,
    totalPointsRedeemed: 18500,
    createdAt: '2024-02-01'
  },
  {
    id: '3',
    name: 'تخفیف آخر هفته',
    description: 'برنامه تخفیف ویژه آخر هفته‌ها',
    type: 'discount',
    status: 'inactive',
    startDate: '2024-10-01',
    endDate: '2024-11-30',
    rules: {
      earnRate: 0,
      redeemRate: 0,
      conditions: [
        'فقط جمعه و شنبه',
        'تخفیف 15% بر روی کل سفارش'
      ]
    },
    rewards: [],
    participants: 520,
    totalPointsIssued: 0,
    totalPointsRedeemed: 0,
    createdAt: '2024-10-01'
  }
]

const mockTransactions: LoyaltyTransaction[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'احمد محمدی',
    programId: '1',
    programName: 'برنامه امتیازی A-DROP',
    type: 'earn',
    points: 25,
    description: 'کسب امتیاز از سفارش شماره 1001',
    orderId: '1001',
    createdAt: '2024-12-01 14:30:00'
  },
  {
    id: '2',
    customerId: '1',
    customerName: 'احمد محمدی',
    programId: '1',
    programName: 'برنامه امتیازی A-DROP',
    type: 'redeem',
    points: -50,
    description: 'استفاده از امتیاز برای تخفیف 10%',
    orderId: '1002',
    createdAt: '2024-12-01 19:45:00'
  },
  {
    id: '3',
    customerId: '2',
    customerName: 'فاطمه احمدی',
    programId: '1',
    programName: 'برنامه امتیازی A-DROP',
    type: 'earn',
    points: 18,
    description: 'کسب امتیاز از سفارش شماره 1003',
    orderId: '1003',
    createdAt: '2024-11-30 20:15:00'
  },
  {
    id: '4',
    customerId: '4',
    customerName: 'زهرا رضایی',
    programId: '2',
    programName: 'برنامه VIP',
    type: 'earn',
    points: 40,
    description: 'کسب امتیاز VIP از سفارش شماره 1004',
    orderId: '1004',
    createdAt: '2024-11-30 21:00:00'
  }
]

import PersianCalendar from '@/components/common/AdvancedPersianCalendar';

export default function LoyaltyPage() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>(mockPrograms)
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>(mockTransactions)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('programs')
  const [selectedProgram, setSelectedProgram] = useState<LoyaltyProgram | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  // Get loyalty statistics
  const getLoyaltyStats = () => {
    const activePrograms = programs.filter(p => p.status === 'active')
    const totalParticipants = programs.reduce((sum, p) => sum + p.participants, 0)
    const totalPointsIssued = programs.reduce((sum, p) => sum + p.totalPointsIssued, 0)
    const totalPointsRedeemed = programs.reduce((sum, p) => sum + p.totalPointsRedeemed, 0)
    const redemptionRate = totalPointsIssued > 0 ? (totalPointsRedeemed / totalPointsIssued) * 100 : 0

    return {
      activePrograms: activePrograms.length,
      totalPrograms: programs.length,
      totalParticipants,
      totalPointsIssued,
      totalPointsRedeemed,
      redemptionRate
    }
  }

  const stats = getLoyaltyStats()

  // Handle program edit
  const handleEditProgram = (program: LoyaltyProgram) => {
    setSelectedProgram(program)
    form.setFieldsValue({
      name: program.name,
      description: program.description,
      type: program.type,
      status: program.status,
      startDate: program.startDate ? dayjs(program.startDate) : null,
      endDate: program.endDate ? dayjs(program.endDate) : null,
      earnRate: program.rules.earnRate,
      redeemRate: program.rules.redeemRate,
      minSpend: program.rules.minSpend,
      maxEarn: program.rules.maxEarn
    })
    setModalVisible(true)
  }

  // Handle program save
  const handleSaveProgram = async (values: any) => {
    try {
      setLoading(true)
      if (selectedProgram) {
        // Update existing program
        const updatedPrograms = programs.map(program =>
          program.id === selectedProgram.id
            ? {
                ...program,
                name: values.name,
                description: values.description,
                type: values.type,
                status: values.status,
                startDate: values.startDate.format('YYYY-MM-DD'),
                endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
                rules: {
                  ...program.rules,
                  earnRate: values.earnRate,
                  redeemRate: values.redeemRate,
                  minSpend: values.minSpend,
                  maxEarn: values.maxEarn
                }
              }
            : program
        )
        setPrograms(updatedPrograms)
        message.success('برنامه وفاداری با موفقیت بروزرسانی شد')
      } else {
        // Add new program
        const newProgram: LoyaltyProgram = {
          id: (programs.length + 1).toString(),
          name: values.name,
          description: values.description,
          type: values.type,
          status: values.status,
          startDate: values.startDate.format('YYYY-MM-DD'),
          endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
          rules: {
            earnRate: values.earnRate,
            redeemRate: values.redeemRate,
            minSpend: values.minSpend,
            maxEarn: values.maxEarn,
            conditions: []
          },
          rewards: [],
          participants: 0,
          totalPointsIssued: 0,
          totalPointsRedeemed: 0,
          createdAt: dayjs().format('YYYY-MM-DD')
        }
        setPrograms([...programs, newProgram])
        message.success('برنامه وفاداری جدید با موفقیت ایجاد شد')
      }
      setModalVisible(false)
      form.resetFields()
      setSelectedProgram(null)
    } catch (error) {
      message.error('خطا در ذخیره برنامه وفاداری')
    } finally {
      setLoading(false)
    }
  }

  // Handle program delete
  const handleDeleteProgram = (programId: string) => {
    Modal.confirm({
      title: 'حذف برنامه وفاداری',
      content: 'آیا از حذف این برنامه وفاداری اطمینان دارید؟',
      okText: 'حذف',
      cancelText: 'انصراف',
      okType: 'danger',
      onOk: () => {
        const updatedPrograms = programs.filter(p => p.id !== programId)
        setPrograms(updatedPrograms)
        message.success('برنامه وفاداری با موفقیت حذف شد')
      }
    })
  }

  // Programs table columns
  const programColumns = [
    {
      title: 'برنامه',
      key: 'program',
      render: (record: LoyaltyProgram) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {record.type === 'points' && <GiftOutlined style={{ marginRight: 8, color: '#1890ff' }} />}
            {record.type === 'tier' && <CrownOutlined style={{ marginRight: 8, color: '#faad14' }} />}
            {record.type === 'discount' && <PercentageOutlined style={{ marginRight: 8, color: '#52c41a' }} />}
            {record.type === 'cashback' && <TrophyOutlined style={{ marginRight: 8, color: '#722ed1' }} />}
            {record.name}
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description}
          </Text>
        </div>
      )
    },
    {
      title: 'نوع',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeColors = {
          points: 'blue',
          tier: 'gold',
          discount: 'green',
          cashback: 'purple'
        }
        const typeLabels = {
          points: 'امتیازی',
          tier: 'سطحی',
          discount: 'تخفیفی',
          cashback: 'بازگشت نقدی'
        }
        return <Tag color={typeColors[type as keyof typeof typeColors]}>{typeLabels[type as keyof typeof typeLabels]}</Tag>
      }
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusLabels = {
          active: 'فعال',
          inactive: 'غیرفعال',
          expired: 'منقضی'
        }
        const statusColors = {
          active: 'green',
          inactive: 'gray',
          expired: 'red'
        }
        return <Tag color={statusColors[status as keyof typeof statusColors]}>{statusLabels[status as keyof typeof statusLabels]}</Tag>
      }
    },
    {
      title: 'مشارکت‌کنندگان',
      dataIndex: 'participants',
      key: 'participants',
      render: (count: number) => (
        <Space>
          <UserOutlined />
          {count.toLocaleString('fa-IR')}
        </Space>
      ),
      sorter: (a: LoyaltyProgram, b: LoyaltyProgram) => a.participants - b.participants
    },
    {
      title: 'امتیاز صادر شده',
      dataIndex: 'totalPointsIssued',
      key: 'totalPointsIssued',
      render: (points: number) => points.toLocaleString('fa-IR'),
      sorter: (a: LoyaltyProgram, b: LoyaltyProgram) => a.totalPointsIssued - b.totalPointsIssued
    },
    {
      title: 'امتیاز استفاده شده',
      dataIndex: 'totalPointsRedeemed',
      key: 'totalPointsRedeemed',
      render: (points: number) => points.toLocaleString('fa-IR'),
      sorter: (a: LoyaltyProgram, b: LoyaltyProgram) => a.totalPointsRedeemed - b.totalPointsRedeemed
    },
    {
      title: 'نرخ استفاده',
      key: 'redemptionRate',
      render: (record: LoyaltyProgram) => {
        const rate = record.totalPointsIssued > 0 ? (record.totalPointsRedeemed / record.totalPointsIssued) * 100 : 0
        return (
          <Progress 
            percent={Math.round(rate)} 
            size="small" 
            format={(percent) => `${percent}%`}
            strokeColor={rate > 50 ? '#52c41a' : rate > 25 ? '#faad14' : '#ff4d4f'}
          />
        )
      }
    },
    {
      title: 'تاریخ شروع',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('YYYY/MM/DD')
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (record: LoyaltyProgram) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditProgram(record)}
          >
            ویرایش
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
            onClick={() => handleDeleteProgram(record.id)}
          >
            حذف
          </Button>
        </Space>
      )
    }
  ]

  // Transactions table columns
  const transactionColumns = [
    {
      title: 'مشتری',
      dataIndex: 'customerName',
      key: 'customerName'
    },
    {
      title: 'برنامه',
      dataIndex: 'programName',
      key: 'programName'
    },
    {
      title: 'نوع تراکنش',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'earn' ? 'green' : 'red'}>
          {type === 'earn' ? 'کسب امتیاز' : 'مصرف امتیاز'}
        </Tag>
      )
    },
    {
      title: 'امتیاز',
      dataIndex: 'points',
      key: 'points',
      render: (points: number) => (
        <Space>
          <StarOutlined style={{ color: points > 0 ? '#52c41a' : '#ff4d4f' }} />
          <span style={{ color: points > 0 ? '#52c41a' : '#ff4d4f' }}>
            {points > 0 ? '+' : ''}{points}
          </span>
        </Space>
      )
    },
    {
      title: 'توضیحات',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'تاریخ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY/MM/DD HH:mm')
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            🎁 برنامه‌های وفاداری - فاز 4
          </Title>
          <Text type="secondary">مدیریت برنامه‌های وفاداری و امتیازی مشتریان</Text>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedProgram(null)
              form.resetFields()
              setModalVisible(true)
            }}
          >
            برنامه جدید
          </Button>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card>
            <Statistic
              title="برنامه‌های فعال"
              value={stats.activePrograms}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card>
            <Statistic
              title="کل مشارکت‌کنندگان"
              value={stats.totalParticipants}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card>
            <Statistic
              title="امتیاز صادر شده"
              value={stats.totalPointsIssued}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card>
            <Statistic
              title="امتیاز استفاده شده"
              value={stats.totalPointsRedeemed}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card>
            <Statistic
              title="نرخ استفاده"
              value={stats.redemptionRate.toFixed(1)}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: stats.redemptionRate > 50 ? '#3f8600' : '#faad14' }}
            />
            <Progress 
              percent={Math.round(stats.redemptionRate)} 
              size="small" 
              showInfo={false}
              strokeColor={stats.redemptionRate > 50 ? '#3f8600' : '#faad14'}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card>
            <Statistic
              title="امتیاز موجود"
              value={stats.totalPointsIssued - stats.totalPointsRedeemed}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#f50' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="برنامه‌های وفاداری" key="programs">
            <Table
              columns={programColumns}
              dataSource={programs}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} از ${total} برنامه`
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>
          <TabPane tab="تراکنش‌های امتیاز" key="transactions">
            <Table
              columns={transactionColumns}
              dataSource={transactions}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} از ${total} تراکنش`
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Program Modal */}
      <Modal
        title={selectedProgram ? 'ویرایش برنامه وفاداری' : 'ایجاد برنامه وفاداری جدید'}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setSelectedProgram(null)
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProgram}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="نام برنامه"
                name="name"
                rules={[{ required: true, message: 'نام برنامه را وارد کنید' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="نوع برنامه"
                name="type"
                rules={[{ required: true, message: 'نوع برنامه را انتخاب کنید' }]}
              >
                <Select>
                  <Option value="points">امتیازی</Option>
                  <Option value="tier">سطحی</Option>
                  <Option value="discount">تخفیفی</Option>
                  <Option value="cashback">بازگشت نقدی</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="توضیحات"
                name="description"
              >
                <TextArea rows={3} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="وضعیت"
                name="status"
              >
                <Select>
                  <Option value="active">فعال</Option>
                  <Option value="inactive">غیرفعال</Option>
                  <Option value="expired">منقضی</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="تاریخ شروع"
                name="startDate"
                rules={[{ required: true, message: 'تاریخ شروع را انتخاب کنید' }]}
              >
                <PersianCalendar 
                  placeholder="انتخاب تاریخ شروع"
                  onChange={(date: string) => {
                    console.log('Start date selected:', date);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="تاریخ پایان"
                name="endDate"
              >
                <PersianCalendar 
                  placeholder="انتخاب تاریخ پایان"
                  onChange={(date: string) => {
                    console.log('End date selected:', date);
                  }}
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Divider>قوانین برنامه</Divider>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="نرخ کسب امتیاز (امتیاز به ازای هر تومان)"
                name="earnRate"
              >
                <InputNumber 
                  min={0} 
                  max={1} 
                  step={0.01} 
                  style={{ width: '100%' }}
                  placeholder="0.1"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="نرخ تبدیل امتیاز (تومان به ازای هر امتیاز)"
                name="redeemRate"
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }}
                  placeholder="100"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="حداقل خرید (تومان)"
                name="minSpend"
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }}
                  placeholder="50000"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="حداکثر امتیاز روزانه"
                name="maxEarn"
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }}
                  placeholder="100"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row justify="end" style={{ marginTop: 16 }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false)
                form.resetFields()
                setSelectedProgram(null)
              }}>
                انصراف
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedProgram ? 'بروزرسانی' : 'ایجاد'}
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
