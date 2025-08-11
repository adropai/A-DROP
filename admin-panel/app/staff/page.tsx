'use client'

import { useEffect, useState } from 'react'
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
  Progress,
  Statistic,
  Calendar,
  Badge,
  Descriptions,
  Tooltip,
  Form
} from 'antd'
import { 
  ProTable, 
  ProForm, 
  ProFormText, 
  ProFormSelect, 
  ProFormTextArea,
  ProFormDigit,
  ProFormDatePicker,
  ProFormUploadButton,
  ProCard,
  StatisticCard
} from '@ant-design/pro-components'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  LockOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons'
import { useStaffStore } from '@/stores/staff-store'
import { useAuthStore } from '@/stores/auth-store'
import { Staff, Shift } from '@/types/staff'
import { User, UserRole, DEFAULT_ROLES } from '@/types/auth'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { useRef } from 'react'

const { TabPane } = Tabs

export default function StaffManagementPage() {
  const [currentTab, setCurrentTab] = useState('staff')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isShiftModalVisible, setIsShiftModalVisible] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [form] = ProForm.useForm()
  const [shiftForm] = ProForm.useForm()
  const actionRef = useRef<ActionType>()

  const {
    staff,
    shifts,
    stats,
    loading,
    error,
    fetchStaff,
    fetchShifts,
    fetchStats,
    addStaff,
    updateStaff,
    deleteStaff,
    addShift,
    updateShift,
    deleteShift
  } = useStaffStore()

  useEffect(() => {
    fetchStaff()
    fetchShifts()
    fetchStats()
  }, [])

  // Staff Table Columns
  const staffColumns: ProColumns<Staff>[] = [
    {
      title: 'پروفایل',
      dataIndex: 'avatar',
      valueType: 'avatar',
      width: 80,
      render: (_, record) => (
        <Avatar 
          size={40} 
          src={record.avatar} 
          icon={<UserOutlined />}
        />
      ),
      search: false,
    },
    {
      title: 'نام و نام خانوادگی',
      dataIndex: 'name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 'bold' }}>
            {record.firstName} {record.lastName}
          </span>
          <span style={{ color: '#666', fontSize: '12px' }}>
            {record.position}
          </span>
        </Space>
      ),
      search: true,
    },
    {
      title: 'بخش',
      dataIndex: 'department',
      valueType: 'select',
      valueEnum: {
        kitchen: { text: 'آشپزخانه', status: 'Processing' },
        service: { text: 'سرویس', status: 'Success' },
        management: { text: 'مدیریت', status: 'Warning' },
        delivery: { text: 'تحویل', status: 'Default' },
        cashier: { text: 'صندوق', status: 'Error' },
      },
      render: (_, record) => {
        const departmentMap = {
          kitchen: { color: 'blue', text: 'آشپزخانه' },
          service: { color: 'green', text: 'سرویس' },
          management: { color: 'gold', text: 'مدیریت' },
          delivery: { color: 'purple', text: 'تحویل' },
          cashier: { color: 'red', text: 'صندوق' },
        }
        const dept = departmentMap[record.department]
        return <Tag color={dept?.color}>{dept?.text}</Tag>
      }
    },
    {
      title: 'تماس',
      dataIndex: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space size={4}>
            <PhoneOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontSize: '12px' }}>{record.phone}</span>
          </Space>
          <Space size={4}>
            <MailOutlined style={{ color: '#52c41a' }} />
            <span style={{ fontSize: '12px' }}>{record.email}</span>
          </Space>
        </Space>
      ),
      search: false,
    },
    {
      title: 'حقوق',
      dataIndex: 'salary',
      valueType: 'money',
      render: (_, record) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          {record.salary.toLocaleString('fa-IR')} تومان
        </span>
      ),
      search: false,
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        active: { text: 'فعال', status: 'Success' },
        inactive: { text: 'غیرفعال', status: 'Default' },
        onLeave: { text: 'مرخصی', status: 'Warning' },
      },
      render: (_, record) => {
        const statusMap = {
          active: { color: 'success', text: 'فعال' },
          inactive: { color: 'default', text: 'غیرفعال' },
          onLeave: { color: 'warning', text: 'مرخصی' },
        }
        const status = statusMap[record.status]
        return <Badge status={status?.color as any} text={status?.text} />
      }
    },
    {
      title: 'عملکرد',
      dataIndex: 'performance',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Progress 
            percent={record.performance?.attendanceRate || 0} 
            size="small" 
            showInfo={false}
            strokeColor="#52c41a"
          />
          <span style={{ fontSize: '11px', color: '#666' }}>
            حضور: {record.performance?.attendanceRate || 0}%
          </span>
        </Space>
      ),
      search: false,
    },
    {
      title: 'عملیات',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Tooltip title="ویرایش" key="edit">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditStaff(record)}
          />
        </Tooltip>,
        <Tooltip title="حذف" key="delete">
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteStaff(record.id)}
          />
        </Tooltip>,
      ],
    },
  ]

  // Shift Table Columns
  const shiftColumns: ProColumns<Shift>[] = [
    {
      title: 'کارمند',
      dataIndex: 'staffId',
      render: (_, record) => {
        const staffMember = staff.find(s => s.id === record.staffId)
        return staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'نامشخص'
      }
    },
    {
      title: 'تاریخ',
      dataIndex: 'date',
      valueType: 'date',
    },
    {
      title: 'ساعت شروع',
      dataIndex: 'startTime',
      valueType: 'time',
    },
    {
      title: 'ساعت پایان',
      dataIndex: 'endTime',
      valueType: 'time',
    },
    {
      title: 'نوع شیفت',
      dataIndex: 'type',
      valueEnum: {
        regular: { text: 'عادی', status: 'Default' },
        overtime: { text: 'اضافه‌کار', status: 'Warning' },
        holiday: { text: 'تعطیل', status: 'Error' },
      }
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      valueEnum: {
        scheduled: { text: 'برنامه‌ریزی شده', status: 'Processing' },
        completed: { text: 'تکمیل شده', status: 'Success' },
        absent: { text: 'غایب', status: 'Error' },
        late: { text: 'تاخیر', status: 'Warning' },
      }
    },
    {
      title: 'عملیات',
      valueType: 'option',
      render: (_, record) => [
        <Button key="edit" type="link" onClick={() => handleEditShift(record)}>
          ویرایش
        </Button>,
        <Button key="delete" type="link" danger onClick={() => handleDeleteShift(record.id)}>
          حذف
        </Button>,
      ],
    },
  ]

  const handleAddStaff = () => {
    setEditingStaff(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff)
    form.setFieldsValue(staff)
    setIsModalVisible(true)
  }

  const handleDeleteStaff = async (id: string) => {
    Modal.confirm({
      title: 'آیا از حذف این کارمند اطمینان دارید؟',
      content: 'این عملیات قابل بازگشت نیست.',
      okText: 'بله',
      cancelText: 'لغو',
      onOk: async () => {
        await deleteStaff(id)
        message.success('کارمند با موفقیت حذف شد')
        actionRef.current?.reload()
      },
    })
  }

  const handleAddShift = () => {
    setEditingShift(null)
    shiftForm.resetFields()
    setIsShiftModalVisible(true)
  }

  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift)
    shiftForm.setFieldsValue(shift)
    setIsShiftModalVisible(true)
  }

  const handleDeleteShift = async (id: string) => {
    Modal.confirm({
      title: 'آیا از حذف این شیفت اطمینان دارید؟',
      onOk: async () => {
        await deleteShift(id)
        message.success('شیفت با موفقیت حذف شد')
      },
    })
  }

  const handleSubmitStaff = async (values: any) => {
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, values)
        message.success('کارمند با موفقیت ویرایش شد')
      } else {
        await addStaff(values)
        message.success('کارمند با موفقیت اضافه شد')
      }
      setIsModalVisible(false)
      actionRef.current?.reload()
    } catch (error) {
      message.error('خطایی رخ داد')
    }
  }

  const handleSubmitShift = async (values: any) => {
    try {
      if (editingShift) {
        await updateShift(editingShift.id, values)
        message.success('شیفت با موفقیت ویرایش شد')
      } else {
        await addShift(values)
        message.success('شیفت با موفقیت اضافه شد')
      }
      setIsShiftModalVisible(false)
    } catch (error) {
      message.error('خطایی رخ داد')
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="کل کارکنان"
              value={stats?.totalStaff || 0}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="کارکنان فعال"
              value={stats?.activeStaff || 0}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="در مرخصی"
              value={stats?.onLeave || 0}
              prefix={<CalendarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="کل حقوق"
              value={stats?.totalSalary || 0}
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => `${value?.toLocaleString('fa-IR')} تومان`}
            />
          </ProCard>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <Tabs activeKey={currentTab} onChange={setCurrentTab}>
          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                مدیریت کارکنان
              </span>
            } 
            key="staff"
          >
            <ProTable<Staff>
              actionRef={actionRef}
              columns={staffColumns}
              dataSource={staff}
              loading={loading}
              rowKey="id"
              search={{
                labelWidth: 'auto',
                defaultCollapsed: false,
              }}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `نمایش ${range[0]}-${range[1]} از ${total} کارمند`,
              }}
              toolBarRender={() => [
                <Button
                  key="add"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddStaff}
                >
                  افزودن کارمند جدید
                </Button>,
              ]}
              options={{
                setting: true,
                fullScreen: true,
                reload: () => fetchStaff(),
                density: true,
              }}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <ClockCircleOutlined />
                مدیریت شیفت‌ها
              </span>
            } 
            key="shifts"
          >
            <ProTable<Shift>
              columns={shiftColumns}
              dataSource={shifts}
              loading={loading}
              rowKey="id"
              search={{
                labelWidth: 'auto',
              }}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
              }}
              toolBarRender={() => [
                <Button
                  key="add-shift"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddShift}
                >
                  افزودن شیفت جدید
                </Button>,
              ]}
              options={{
                setting: true,
                fullScreen: true,
                reload: () => fetchShifts(),
              }}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <TrophyOutlined />
                عملکرد کارکنان
              </span>
            } 
            key="performance"
          >
            <Row gutter={[16, 16]}>
              {stats?.topPerformers?.map((performer, index) => (
                <Col xs={24} sm={12} md={8} key={performer.id}>
                  <Card
                    size="small"
                    title={
                      <Space>
                        <Avatar src={performer.avatar} icon={<UserOutlined />} />
                        {performer.firstName} {performer.lastName}
                      </Space>
                    }
                    extra={
                      <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}>
                        رتبه {index + 1}
                      </Tag>
                    }
                  >
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="میزان حضور">
                        <Progress percent={performer.performance?.attendanceRate || 0} size="small" />
                      </Descriptions.Item>
                      <Descriptions.Item label="رضایت مشتری">
                        <Progress percent={(performer.performance?.customerRating || 0) * 20} size="small" />
                      </Descriptions.Item>
                      <Descriptions.Item label="بخش">
                        {performer.department}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <UserOutlined />
                کاربران سیستم
              </span>
            } 
            key="users"
          >
            <SystemUsersTab />
          </TabPane>
        </Tabs>
      </Card>

      {/* Add/Edit Staff Modal */}
      <Modal
        title={editingStaff ? 'ویرایش کارمند' : 'افزودن کارمند جدید'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <ProForm
          form={form}
          onFinish={handleSubmitStaff}
          layout="vertical"
          submitter={{
            searchConfig: {
              submitText: editingStaff ? 'ویرایش' : 'افزودن',
              resetText: 'لغو',
            },
            onReset: () => setIsModalVisible(false),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="firstName"
                label="نام"
                rules={[{ required: true, message: 'نام الزامی است' }]}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="lastName"
                label="نام خانوادگی"
                rules={[{ required: true, message: 'نام خانوادگی الزامی است' }]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="email"
                label="ایمیل"
                rules={[
                  { required: true, message: 'ایمیل الزامی است' },
                  { type: 'email', message: 'فرمت ایمیل صحیح نیست' }
                ]}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="phone"
                label="شماره تلفن"
                rules={[{ required: true, message: 'شماره تلفن الزامی است' }]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="position"
                label="سمت"
                rules={[{ required: true, message: 'سمت الزامی است' }]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="department"
                label="بخش"
                rules={[{ required: true, message: 'بخش الزامی است' }]}
                options={[
                  { label: 'آشپزخانه', value: 'kitchen' },
                  { label: 'سرویس', value: 'service' },
                  { label: 'مدیریت', value: 'management' },
                  { label: 'تحویل', value: 'delivery' },
                  { label: 'صندوق', value: 'cashier' },
                ]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <ProFormDigit
                name="salary"
                label="حقوق (تومان)"
                rules={[{ required: true, message: 'حقوق الزامی است' }]}
                min={0}
                fieldProps={{
                  formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                  parser: (value) => Number(value!.replace(/\$\s?|(,*)/g, '')),
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormDatePicker
                name="hireDate"
                label="تاریخ استخدام"
                rules={[{ required: true, message: 'تاریخ استخدام الزامی است' }]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="status"
                label="وضعیت"
                rules={[{ required: true, message: 'وضعیت الزامی است' }]}
                options={[
                  { label: 'فعال', value: 'active' },
                  { label: 'غیرفعال', value: 'inactive' },
                  { label: 'مرخصی', value: 'onLeave' },
                ]}
              />
            </Col>
            <Col span={12}>
              <ProFormUploadButton
                name="avatar"
                label="تصویر پروفایل"
                max={1}
                fieldProps={{
                  name: 'file',
                  listType: 'picture-card',
                }}
              />
            </Col>
          </Row>

          <ProFormTextArea
            name="address"
            label="آدرس"
            placeholder="آدرس کامل"
          />
        </ProForm>
      </Modal>

      {/* Add/Edit Shift Modal */}
      <Modal
        title={editingShift ? 'ویرایش شیفت' : 'افزودن شیفت جدید'}
        open={isShiftModalVisible}
        onCancel={() => setIsShiftModalVisible(false)}
        footer={null}
        width={600}
      >
        <ProForm
          form={shiftForm}
          onFinish={handleSubmitShift}
          layout="vertical"
          submitter={{
            searchConfig: {
              submitText: editingShift ? 'ویرایش' : 'افزودن',
              resetText: 'لغو',
            },
            onReset: () => setIsShiftModalVisible(false),
          }}
        >
          <ProFormSelect
            name="staffId"
            label="کارمند"
            rules={[{ required: true, message: 'انتخاب کارمند الزامی است' }]}
            options={staff.map(s => ({
              label: `${s.firstName} ${s.lastName}`,
              value: s.id
            }))}
          />

          <Row gutter={16}>
            <Col span={12}>
              <ProFormDatePicker
                name="date"
                label="تاریخ"
                rules={[{ required: true, message: 'تاریخ الزامی است' }]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="type"
                label="نوع شیفت"
                rules={[{ required: true, message: 'نوع شیفت الزامی است' }]}
                options={[
                  { label: 'عادی', value: 'regular' },
                  { label: 'اضافه‌کار', value: 'overtime' },
                  { label: 'تعطیل', value: 'holiday' },
                ]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="startTime"
                label="ساعت شروع"
                rules={[{ required: true, message: 'ساعت شروع الزامی است' }]}
                placeholder="مثال: 08:00"
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="endTime"
                label="ساعت پایان"
                rules={[{ required: true, message: 'ساعت پایان الزامی است' }]}
                placeholder="مثال: 16:00"
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <ProFormDigit
                name="breakTime"
                label="زمان استراحت (دقیقه)"
                min={0}
                max={480}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="status"
                label="وضعیت"
                options={[
                  { label: 'برنامه‌ریزی شده', value: 'scheduled' },
                  { label: 'تکمیل شده', value: 'completed' },
                  { label: 'غایب', value: 'absent' },
                  { label: 'تاخیر', value: 'late' },
                ]}
              />
            </Col>
          </Row>
        </ProForm>
      </Modal>
    </div>
  )
}

// System Users Management Component
function SystemUsersTab() {
  const [isUserModalVisible, setIsUserModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userForm] = Form.useForm()
  const [showPassword, setShowPassword] = useState(false)
  const actionRef = useRef<ActionType>()

  // Mock system users data
  const [systemUsers, setSystemUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@adrop.com',
      name: 'مدیر کل',
      role: DEFAULT_ROLES[0], // super_admin
      permissions: DEFAULT_ROLES[0].permissions,
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      department: 'مدیریت',
    },
    {
      id: '2',
      email: 'manager@adrop.com',
      name: 'احمد محمدی',
      role: DEFAULT_ROLES[2], // manager
      permissions: DEFAULT_ROLES[2].permissions,
      status: 'active',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
      department: 'عملیات',
    },
    {
      id: '3',
      email: 'cashier@adrop.com',
      name: 'زهرا احمدی',
      role: DEFAULT_ROLES[3], // cashier
      permissions: DEFAULT_ROLES[3].permissions,
      status: 'active',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date(),
      department: 'فروش',
    },
  ])

  const handleSubmitUser = async (values: any) => {
    try {
      const userData: User = {
        id: editingUser?.id || String(Date.now()),
        email: values.email,
        name: values.name,
        role: DEFAULT_ROLES.find(role => role.name === values.role) || DEFAULT_ROLES[6], // default to employee
        permissions: DEFAULT_ROLES.find(role => role.name === values.role)?.permissions || [],
        status: values.status || 'active',
        createdAt: editingUser?.createdAt || new Date(),
        updatedAt: new Date(),
        department: values.department,
        password: values.password, // In real app, this should be hashed
      }

      if (editingUser) {
        // Update existing user
        setSystemUsers(prev => prev.map(user => 
          user.id === editingUser.id ? userData : user
        ))
        message.success('کاربر با موفقیت ویرایش شد')
      } else {
        // Add new user
        setSystemUsers(prev => [...prev, userData])
        message.success('کاربر جدید با موفقیت اضافه شد')
      }

      setIsUserModalVisible(false)
      setEditingUser(null)
      userForm.resetFields()
      actionRef.current?.reload()
    } catch (error) {
      message.error('خطا در ذخیره اطلاعات کاربر')
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    userForm.setFieldsValue({
      ...user,
      role: user.role.name,
      password: '', // Don't show existing password
    })
    setIsUserModalVisible(true)
  }

  const handleDeleteUser = async (user: User) => {
    Modal.confirm({
      title: 'حذف کاربر',
      content: `آیا از حذف کاربر "${user.name}" اطمینان دارید؟`,
      okText: 'بله، حذف کن',
      cancelText: 'انصراف',
      okType: 'danger',
      onOk: () => {
        setSystemUsers(prev => prev.filter(u => u.id !== user.id))
        message.success('کاربر با موفقیت حذف شد')
        actionRef.current?.reload()
      },
    })
  }

  const userColumns: ProColumns<User>[] = [
    {
      title: 'نام',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1890ff' }}>
            {record.name?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'نقش',
      dataIndex: 'role',
      key: 'role',
      render: (_, record) => {
        const roleColors: Record<string, string> = {
          'super_admin': '#f50',
          'admin': '#2db7f5',
          'manager': '#87d068',
          'cashier': '#108ee9',
          'kitchen_staff': '#f0ad4e',
          'delivery_staff': '#5cb85c',
          'employee': '#777',
        }
        return (
          <Tag color={roleColors[record.role.name] || '#777'}>
            {record.role.displayName}
          </Tag>
        )
      },
      filters: DEFAULT_ROLES.map(role => ({
        text: role.displayName,
        value: role.name,
      })),
      onFilter: (value, record) => record.role.name === value,
    },
    {
      title: 'بخش',
      dataIndex: 'department',
      key: 'department',
      filters: [
        { text: 'مدیریت', value: 'مدیریت' },
        { text: 'عملیات', value: 'عملیات' },
        { text: 'فروش', value: 'فروش' },
        { text: 'آشپزخانه', value: 'آشپزخانه' },
        { text: 'ارسال', value: 'ارسال' },
      ],
      onFilter: (value, record) => record.department === value,
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'فعال' : 'غیرفعال'}
        </Tag>
      ),
      filters: [
        { text: 'فعال', value: 'active' },
        { text: 'غیرفعال', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'تاریخ ایجاد',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: any) => new Date(date).toLocaleDateString('fa-IR'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            ویرایش
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record)}
          >
            حذف
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <ProTable<User>
        actionRef={actionRef}
        columns={userColumns}
        dataSource={systemUsers}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="کاربران سیستم"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingUser(null)
              userForm.resetFields()
              setIsUserModalVisible(true)
            }}
          >
            افزودن کاربر جدید
          </Button>,
        ]}
      />

      {/* Add/Edit User Modal */}
      <Modal
        title={editingUser ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
        open={isUserModalVisible}
        onCancel={() => {
          setIsUserModalVisible(false)
          setEditingUser(null)
          userForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <ProForm
          form={userForm}
          onFinish={handleSubmitUser}
          layout="vertical"
          submitter={{
            resetButtonProps: {
              style: { display: 'none' },
            },
            submitButtonProps: {
              style: { width: '100%' },
            },
            render: (props) => (
              <Row gutter={16}>
                <Col span={12}>
                  <Button 
                    onClick={() => {
                      setIsUserModalVisible(false)
                      setEditingUser(null)
                      userForm.resetFields()
                    }}
                    style={{ width: '100%' }}
                  >
                    انصراف
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    type="primary" 
                    onClick={() => props.form?.submit()}
                    style={{ width: '100%' }}
                  >
                    {editingUser ? 'ویرایش' : 'افزودن'}
                  </Button>
                </Col>
              </Row>
            ),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="name"
                label="نام و نام خانوادگی"
                placeholder="نام کاربر را وارد کنید"
                rules={[
                  { required: true, message: 'نام الزامی است' },
                  { min: 2, message: 'نام باید حداقل 2 کاراکتر باشد' }
                ]}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="email"
                label="ایمیل"
                placeholder="ایمیل کاربر را وارد کنید"
                rules={[
                  { required: true, message: 'ایمیل الزامی است' },
                  { type: 'email', message: 'فرمت ایمیل صحیح نیست' }
                ]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="role"
                label="نقش کاربر"
                placeholder="نقش را انتخاب کنید"
                options={DEFAULT_ROLES.map(role => ({
                  label: role.displayName,
                  value: role.name,
                }))}
                rules={[{ required: true, message: 'نقش الزامی است' }]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="department"
                label="بخش"
                placeholder="بخش را انتخاب کنید"
                options={[
                  { label: 'مدیریت', value: 'مدیریت' },
                  { label: 'عملیات', value: 'عملیات' },
                  { label: 'فروش', value: 'فروش' },
                  { label: 'آشپزخانه', value: 'آشپزخانه' },
                  { label: 'ارسال', value: 'ارسال' },
                ]}
                rules={[{ required: true, message: 'بخش الزامی است' }]}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <ProFormText.Password
                name="password"
                label={editingUser ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور'}
                placeholder="رمز عبور را وارد کنید"
                rules={editingUser ? [] : [
                  { required: true, message: 'رمز عبور الزامی است' },
                  { min: 6, message: 'رمز عبور باید حداقل 6 کاراکتر باشد' }
                ]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="status"
                label="وضعیت"
                placeholder="وضعیت را انتخاب کنید"
                options={[
                  { label: 'فعال', value: 'active' },
                  { label: 'غیرفعال', value: 'inactive' },
                ]}
                rules={[{ required: true, message: 'وضعیت الزامی است' }]}
              />
            </Col>
          </Row>
        </ProForm>
      </Modal>
    </>
  )
}
