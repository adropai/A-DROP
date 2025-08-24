"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Table,
  message,
  Spin,
  Modal,
  Tag,
  Space,
  Divider,
  TimePicker,
  InputNumber,
  Avatar,
  Typography,
  Badge,
  Tabs,
  Alert,
  Tooltip,
  Switch,
  Steps,
  List,
  Popover,
  Calendar,
  App,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  TableOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  HomeOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import moment from "moment-jalaali";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import PersianCalendar from "@/components/common/AdvancedPersianCalendar";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

// Types
interface Table {
  id: string;
  number: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "maintenance";
  location: string;
  type: "indoor" | "outdoor" | "vip";
  isRecommended?: boolean;
  spareCapacity?: number;
}

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  persianDate: string;
  persianTime: string;
  reservationDate: string; // ISO date
  startTime: string; // ISO date  
  endTime: string; // ISO date
  partySize: number;
  tableId: string;
  table: {
    name: string;
    hall: string;
    number: string;
    capacity: number;
    location?: string;
  };
  status: "pending" | "confirmed" | "seated" | "completed" | "cancelled" | "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AvailabilityResult {
  availableTables: Table[];
  occupiedTables: Table[];
  stats: {
    totalTables: number;
    availableTables: number;
    occupiedTables: number;
    recommendedTables: number;
  };
  suggestions: Array<{
    time: string;
    availableCount: number;
    tables: Table[];
  }>;
  message: string;
}

// Helper functions for Persian date with moment-jalaali
moment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' });

function getTodayPersian(): string {
  return moment().format('jYYYY/jMM/jDD');
}

function formatDateToPersian(date: Date | Dayjs | string): string {
  if (typeof date === 'string') {
    return date;
  }
  const dateToConvert = date instanceof Date ? date : (date as any).toDate();
  return moment(dateToConvert).format('jYYYY/jMM/jDD');
}

function convertPersianToGregorian(persianDate: string): Date {
  const m = moment(persianDate, 'jYYYY/jMM/jDD');
  return m.toDate();
}

function getPersianDayName(date: string | Date): string {
  const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  const m = typeof date === 'string' ? moment(date, 'jYYYY/jMM/jDD') : moment(date);
  return dayNames[m.day()];
}

function getTodayInfo(): { persianDate: string; dayName: string; gregorianDate: string } {
  const today = moment();
  return {
    persianDate: today.format('jYYYY/jMM/jDD'),
    dayName: getPersianDayName(today.toDate()),
    gregorianDate: today.format('YYYY/MM/DD')
  };
}

function formatPersianDate(date: Date | string): string {
  const m = typeof date === 'string' ? moment(date) : moment(date);
  return m.format('jYYYY/jMM/jDD');
}

function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toTimeString().slice(0, 5);
}

// API Functions
const fetchReservations = async (): Promise<Reservation[]> => {
  try {
    const res = await fetch("/api/reservations");
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data.reservations || [];
  } catch (error) {
    throw new Error("خطا در دریافت رزروها");
  }
};

const checkAvailability = async (date: string, time: string, partySize: number): Promise<AvailabilityResult> => {
  try {
    const res = await fetch(`/api/reservations/check-availability?date=${encodeURIComponent(date)}&time=${time}&partySize=${partySize}`);
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  } catch (error) {
    throw error;
  }
};

const submitReservation = async (data: any) => {
  const res = await fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result;
};

const updateReservationStatus = async (id: string, status: string) => {
  const res = await fetch(`/api/reservations`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result;
};

const ReservationPageNew: React.FC = () => {
  const { message } = App.useApp();
  
  // States
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayPersian());
  const [activeTab, setActiveTab] = useState("1");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [form] = Form.useForm();

  // Load data
  useEffect(() => {
    loadReservations();
    loadAllReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const reservationsData = await fetchReservations();
      setReservations(reservationsData || []);
    } catch (error: any) {
      message.error(error.message || "خطا در بارگذاری اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  const loadAllReservations = async () => {
    try {
      const res = await fetch('/api/reservations?limit=1000&sortBy=reservationDate&order=asc');
      const result = await res.json();
      if (result.success) {
        const sortedReservations = (result.data.reservations || []).sort((a: any, b: any) => {
          const dateA = new Date(a.reservationDate);
          const dateB = new Date(b.reservationDate);
          if (dateA.getTime() === dateB.getTime()) {
            // اگر تاریخ یکسان است، بر اساس ساعت مرتب کن
            const timeA = new Date(a.startTime);
            const timeB = new Date(b.startTime);
            return timeA.getTime() - timeB.getTime();
          }
          return dateA.getTime() - dateB.getTime();
        });
        setAllReservations(sortedReservations);
      }
    } catch (error: any) {
      // خطا در دریافت رزروها - برای لاگ سیستم
    }
  };

  // Check availability
  const handleCheckAvailability = async (date: string, time: string, partySize: number) => {
    setCheckingAvailability(true);
    try {
      const result = await checkAvailability(date, time, partySize);
      setAvailability(result);
      message.success(result.message);
    } catch (error: any) {
      message.error(error.message || "خطا در بررسی دسترسی");
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Submit new reservation
  const onFinish = async (values: any) => {
    // دریافت تمام مقادیر فرم
    const allFormValues = form.getFieldsValue();
    
    setSubmitting(true);
    try {
      if (!selectedTable) {
        message.error("لطفاً میز را انتخاب کنید");
        setSubmitting(false);
        return;
      }

      // استفاده از مقادیر کامل فرم
      const reservationData = {
        customerName: allFormValues.customerName || values.customerName,
        customerPhone: allFormValues.customerPhone || values.customerPhone,
        persianDate: allFormValues.persianDate || values.persianDate,
        time: allFormValues.time || values.time || "19:00",
        partySize: parseInt(allFormValues.partySize || values.partySize) || 0,
        tableId: selectedTable.id,
        notes: allFormValues.notes || values.notes || "",
        status: "PENDING",
      };

      // بررسی اینکه همه فیلدهای اجباری پر هستند
      const missingFields: string[] = [];
      if (!reservationData.customerName) missingFields.push('نام مشتری');
      if (!reservationData.customerPhone) missingFields.push('شماره تلفن');
      if (!reservationData.persianDate) missingFields.push('تاریخ');
      if (!reservationData.partySize || reservationData.partySize <= 0) missingFields.push('تعداد نفرات');
      if (!reservationData.tableId) missingFields.push('میز');
      
      if (missingFields.length > 0) {
        message.error(`فیلدهای زیر اجباری هستند: ${missingFields.join(', ')}`);
        setSubmitting(false);
        return;
      }

      const result = await submitReservation(reservationData);
      message.success("رزرو با موفقیت ثبت شد");
      
      // تنظیم selectedDate به تاریخ رزرو جدید
      if (reservationData.persianDate) {
        setSelectedDate(reservationData.persianDate);
      }
      
      form.resetFields();
      setModalVisible(false);
      setCurrentStep(0);
      setSelectedTable(null);
      setAvailability(null);
      loadReservations();
      loadAllReservations();
    } catch (err: any) {
      message.error(err.message || "خطا در ثبت رزرو");
    }
    setSubmitting(false);
  };

  // Update reservation status
  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateReservationStatus(id, status);
      message.success("وضعیت رزرو بروزرسانی شد");
      loadReservations();
      loadAllReservations();
    } catch (err: any) {
      message.error(err.message || "خطا در بروزرسانی وضعیت");
    }
  };

  // Status colors
  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case "AVAILABLE": return "green";
      case "OCCUPIED": return "red";
      case "RESERVED": return "orange";
      case "MAINTENANCE": return "gray";
      case "PENDING": return "orange";
      case "CONFIRMED": return "blue";
      case "COMPLETED": return "gray";
      case "CANCELLED": return "red";
      case "NO_SHOW": return "purple";
      default: return "default";
    }
  };

  // Status text
  const getStatusText = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case "AVAILABLE": return "آزاد";
      case "OCCUPIED": return "اشغال";
      case "RESERVED": return "رزرو شده";
      case "MAINTENANCE": return "تعمیرات";
      case "PENDING": return "در انتظار";
      case "CONFIRMED": return "تایید شده";
      case "COMPLETED": return "تکمیل شده";
      case "CANCELLED": return "لغو شده";
      case "NO_SHOW": return "عدم حضور";
      default: return status;
    }
  };

  // Table columns for reservations
  const reservationColumns: ColumnsType<Reservation> = [
    {
      title: "مشتری",
      dataIndex: "customerName",
      key: "customerName",
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.customerPhone}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "تاریخ و زمان",
      key: "datetime",
      render: (_, record) => (
        <div>
          <div>
            <CalendarOutlined /> {record.persianDate}
          </div>
          <div>
            <ClockCircleOutlined /> {record.persianTime}
          </div>
        </div>
      ),
    },
    {
      title: "میز",
      key: "table",
      render: (_, record) => (
        <div>
          <div>
            <TableOutlined /> {record.table.name}
          </div>
          <Text type="secondary">{record.table.hall}</Text>
        </div>
      ),
    },
    {
      title: "تعداد نفرات",
      dataIndex: "partySize",
      key: "partySize",
      render: (size) => (
        <Tag icon={<TeamOutlined />}>
          {size} نفر
        </Tag>
      ),
    },
    {
      title: "وضعیت",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "عملیات",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.status.toUpperCase() === "PENDING" && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusUpdate(record.id, "CONFIRMED")}
              >
                تایید
              </Button>
              <Button
                danger
                size="small"
                icon={<ExclamationCircleOutlined />}
                onClick={() => handleStatusUpdate(record.id, "CANCELLED")}
              >
                لغو
              </Button>
            </>
          )}
          {record.status.toUpperCase() === "CONFIRMED" && (
            <Button
              type="primary"
              size="small"
              icon={<TeamOutlined />}
              onClick={() => handleStatusUpdate(record.id, "COMPLETED")}
            >
              تکمیل شد
            </Button>
          )}
          {(record.status.toUpperCase() === "COMPLETED" || record.status.toUpperCase() === "CANCELLED") && (
            <Button
              size="small"
              icon={<ExclamationCircleOutlined />}
              onClick={() => handleStatusUpdate(record.id, "NO_SHOW")}
            >
              عدم حضور
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Filter reservations by date
  const todaysReservations = Array.isArray(reservations) ? reservations.filter(
    (res) => !selectedDate || res.persianDate === selectedDate
  ) : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large">
          <div className="mt-4">در حال بارگذاری اطلاعات رزرو...</div>
        </Spin>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Title level={2}>
            <TableOutlined /> مدیریت رزرو میز (نسخه جدید)
          </Title>
          <Text type="secondary">
            مدیریت رزروها با تقویم شمسی و چک خودکار دسترسی میزها
          </Text>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-center">
                <Badge count={availability?.stats.availableTables || 0} showZero>
                  <Avatar size={48} style={{ backgroundColor: "#52c41a" }}>
                    <TableOutlined />
                  </Avatar>
                </Badge>
                <div className="mt-2">
                  <Text strong>میزهای آزاد</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-center">
                <Badge count={todaysReservations.filter(r => r.status === "pending").length} showZero>
                  <Avatar size={48} style={{ backgroundColor: "#fa8c16" }}>
                    <ClockCircleOutlined />
                  </Avatar>
                </Badge>
                <div className="mt-2">
                  <Text strong>رزروهای انتظار</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-center">
                <Badge count={todaysReservations.filter(r => r.status === "confirmed").length} showZero>
                  <Avatar size={48} style={{ backgroundColor: "#1890ff" }}>
                    <CheckCircleOutlined />
                  </Avatar>
                </Badge>
                <div className="mt-2">
                  <Text strong>رزروهای تایید شده</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-center">
                <Badge count={availability?.stats.occupiedTables || 0} showZero>
                  <Avatar size={48} style={{ backgroundColor: "#f5222d" }}>
                    <TeamOutlined />
                  </Avatar>
                </Badge>
                <div className="mt-2">
                  <Text strong>میزهای اشغال</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Persian Calendar Widget */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={8}>
            <Card title="📅 تقویم شمسی" size="small">
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Space direction="vertical" size={12}>
                  <div>
                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                      📆 {getTodayInfo().dayName}
                    </Title>
                    <Text strong style={{ fontSize: '16px' }}>
                      {getTodayInfo().persianDate}
                    </Text>
                  </div>
                  
                  <Divider style={{ margin: '8px 0' }} />
                  
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      تاریخ میلادی: {getTodayInfo().gregorianDate}
                    </Text>
                  </div>
                  
                  <div style={{ 
                    background: '#f0f9ff', 
                    padding: '8px', 
                    borderRadius: '6px',
                    border: '1px solid #e6f7ff'
                  }}>
                    <Text style={{ fontSize: '11px', color: '#1890ff' }}>
                      🕒 رزروهای امروز: {todaysReservations.length} رزرو
                    </Text>
                  </div>
                  
                  <Button 
                    size="small" 
                    type="primary" 
                    icon={<CalendarOutlined />}
                    onClick={() => {
                      const today = getTodayPersian();
                      setSelectedDate(today);
                      message.success(`تاریخ ${getTodayInfo().dayName} انتخاب شد`);
                    }}
                  >
                    انتخاب امروز
                  </Button>
                </Space>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={16}>
            <Card title="📊 تقویم هفتگی" size="small">
              <div>
                {/* نمایش هفته جاری */}
                <div style={{ marginBottom: '16px' }}>
                  <Title level={5} style={{ textAlign: 'center', margin: '0 0 12px 0' }}>
                    ۱۰ روز آینده
                  </Title>
                  <Row gutter={8}>
                    {(() => {
                      const today = moment();
                      const weekDays: React.ReactElement[] = [];
                      
                      for (let i = 0; i < 10; i++) {
                        const day = today.clone().add(i, 'days');
                        const persianDate = day.format('jYYYY/jMM/jDD');
                        const isToday = i === 0; // فقط روز اول (امروز) هست
                        const dayReservations = reservations.filter(r => r.persianDate === persianDate);
                        
                        weekDays.push(
                          <Col span={2.4} key={i} style={{ textAlign: 'center' }}>
                            <div 
                              style={{
                                padding: '8px 4px',
                                borderRadius: '6px',
                                backgroundColor: isToday ? '#1890ff' : '#f5f5f5',
                                color: isToday ? 'white' : '#333',
                                cursor: 'pointer',
                                border: `2px solid ${isToday ? '#1890ff' : 'transparent'}`,
                                minHeight: '60px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                              }}
                              onClick={() => {
                                setSelectedDate(persianDate);
                                message.info(`تاریخ ${persianDate} انتخاب شد`);
                              }}
                            >
                              <div style={{ fontSize: '10px', marginBottom: '2px' }}>
                                {getPersianDayName(day.toDate())}
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                {day.jDate()}
                              </div>
                              {dayReservations.length > 0 && (
                                <div style={{
                                  fontSize: '8px',
                                  marginTop: '2px',
                                  backgroundColor: isToday ? 'rgba(255,255,255,0.3)' : '#52c41a',
                                  color: isToday ? 'white' : 'white',
                                  borderRadius: '8px',
                                  padding: '1px 4px'
                                }}>
                                  {dayReservations.length} رزرو
                                </div>
                              )}
                            </div>
                          </Col>
                        );
                      }
                      return weekDays;
                    })()}
                  </Row>
                </div>
                
                <Divider style={{ margin: '12px 0' }} />
                
                {/* آمار هفته */}
                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '12px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                        {todaysReservations.filter(r => r.status === 'confirmed').length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>تایید شده امروز</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '12px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                        {todaysReservations.filter(r => r.status === 'pending').length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>در انتظار امروز</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: '12px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                        {(() => {
                          const today = moment();
                          const startOfWeek = today.clone().startOf('week');
                          let weekReservations = 0;
                          for (let i = 0; i < 7; i++) {
                            const day = startOfWeek.clone().add(i, 'days');
                            const persianDate = day.format('jYYYY/jMM/jDD');
                            weekReservations += reservations.filter(r => r.persianDate === persianDate).length;
                          }
                          return weekReservations;
                        })()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>کل هفته</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: "1",
              label: "رزروهای امروز",
              children: (
                <Card>
                  <div className="mb-4 flex justify-between items-center">
                    <Space>
                      <Input
                        placeholder="تاریخ شمسی (مثال: 1403/08/21)"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: 200 }}
                      />
                      <Button
                        onClick={() => setSelectedDate('')}
                        type="default"
                      >
                        نمایش همه
                      </Button>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setModalVisible(true)}
                      >
                        رزرو جدید
                      </Button>
                    </Space>
                    <Button icon={<ReloadOutlined />} onClick={loadReservations}>
                      بروزرسانی
                    </Button>
                  </div>

                  <Table
                    columns={reservationColumns}
                    dataSource={todaysReservations}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: "رزروی برای این تاریخ وجود ندارد" }}
                  />
                </Card>
              )
            },
            {
              key: "2",
              label: "کل رزروها",
              children: (
                <Card>
                  <div className="mb-4 flex justify-between items-center">
                    <Space>
                      <Typography.Title level={4} style={{ margin: 0 }}>
                        تمام رزروها (مرتب بر اساس تاریخ و ساعت)
                      </Typography.Title>
                    </Space>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={() => {
                        loadReservations();
                        loadAllReservations();
                      }}
                    >
                      بروزرسانی
                    </Button>
                  </div>

                  <Table
                    columns={reservationColumns}
                    dataSource={allReservations}
                    rowKey="id"
                    pagination={{ 
                      pageSize: 20,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} از ${total} رزرو`
                    }}
                    locale={{ emptyText: "رزروی وجود ندارد" }}
                    scroll={{ x: 1200 }}
                    expandable={{
                      expandedRowRender: (record) => (
                        <div style={{ margin: 0 }}>
                          <Row gutter={16}>
                            <Col span={8}>
                              <strong>تاریخ رزرو:</strong> {formatPersianDate(record.reservationDate)}
                            </Col>
                            <Col span={8}>
                              <strong>ساعت شروع:</strong> {formatTime(new Date(record.startTime))}
                            </Col>
                            <Col span={8}>
                              <strong>ساعت پایان:</strong> {formatTime(new Date(record.endTime))}
                            </Col>
                          </Row>
                          {record.notes && (
                            <div style={{ marginTop: 8 }}>
                              <strong>یادداشت:</strong> {record.notes}
                            </div>
                          )}
                        </div>
                      ),
                      rowExpandable: (record) => !!(record.notes || record.startTime || record.endTime),
                    }}
                  />
                </Card>
              )
            },
            {
              key: "3",
              label: "بررسی دسترسی میزها",
              children: (
                <Card title="چک دسترسی میزها">
                  <Form
                    layout="inline"
                    onFinish={(values) => handleCheckAvailability(values.date, values.time, values.partySize)}
                    initialValues={{
                      date: getTodayPersian(),
                      time: "19:00",
                      partySize: 4
                    }}
                  >
                    <Form.Item name="date" label="تاریخ">
                      <Input placeholder="1403/08/21" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item name="time" label="ساعت">
                      <Input placeholder="19:00" style={{ width: 80 }} />
                    </Form.Item>
                    <Form.Item name="partySize" label="تعداد نفرات">
                      <InputNumber min={1} max={20} style={{ width: 80 }} />
                    </Form.Item>
                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={checkingAvailability}
                        icon={<SearchOutlined />}
                      >
                        بررسی
                      </Button>
                    </Form.Item>
                  </Form>

                  {availability && (
                    <div className="mt-6">
                      <Alert
                        message={availability.message}
                        type={availability.availableTables.length > 0 ? "success" : "warning"}
                        showIcon
                        className="mb-4"
                      />

                      {availability.availableTables.length > 0 && (
                        <div className="mb-6">
                          <Title level={4}>میزهای موجود</Title>
                          <Row gutter={[16, 16]}>
                            {availability.availableTables.map((table) => (
                              <Col xs={24} sm={12} md={8} lg={6} key={table.id}>
                                <Card
                                  size="small"
                                  className={`border-2 ${table.isRecommended ? "border-green-500" : "border-green-300"}`}
                                  title={`میز ${table.number}`}
                                  extra={table.isRecommended && <Tag color="green">پیشنهادی</Tag>}
                                >
                                  <div className="text-center">
                                    <div>ظرفیت: {table.capacity} نفر</div>
                                    <div>موقعیت: {table.location}</div>
                                    <div>نوع: {table.type === 'indoor' ? 'داخلی' : table.type === 'outdoor' ? 'بیرونی' : 'VIP'}</div>
                                    {table.spareCapacity !== undefined && (
                                      <div className="text-gray-500">فضای اضافی: {table.spareCapacity} نفر</div>
                                    )}
                                  </div>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      )}

                      {availability.suggestions.length > 0 && (
                        <div>
                          <Title level={4}>پیشنهادات ساعت جایگزین</Title>
                          <List
                            dataSource={availability.suggestions}
                            renderItem={(suggestion) => (
                              <List.Item>
                                <div>
                                  <strong>ساعت {suggestion.time}</strong> - {suggestion.availableCount} میز موجود
                                  <div className="text-gray-500">
                                    {suggestion.tables.map(t => `میز ${t.number}`).join(', ')}
                                  </div>
                                </div>
                              </List.Item>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            }
          ]}
        />

        {/* New Reservation Modal */}
        <Modal
          title="رزرو جدید میز"
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setCurrentStep(0);
            setSelectedTable(null);
            setAvailability(null);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Steps current={currentStep} className="mb-6">
            <Step title="اطلاعات مشتری" icon={<UserOutlined />} />
            <Step title="انتخاب زمان" icon={<CalendarOutlined />} />
            <Step title="انتخاب میز" icon={<TableOutlined />} />
            <Step title="تایید رزرو" icon={<CheckCircleOutlined />} />
          </Steps>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              persianDate: getTodayPersian(),
              time: "19:00",
              partySize: 2,
            }}
          >
            <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
              <div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="نام مشتری"
                      name="customerName"
                      rules={[{ required: true, message: "نام مشتری را وارد کنید" }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="نام و نام خانوادگی" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="شماره تلفن"
                      name="customerPhone"
                      rules={[
                        { required: true, message: "شماره تلفن را وارد کنید" },
                        { pattern: /^09\d{9}$/, message: "شماره تلفن معتبر نیست" }
                      ]}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="09123456789" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="یادداشت" name="notes">
                  <TextArea rows={2} placeholder="یادداشت‌های اضافی (اختیاری)" />
                </Form.Item>
                <div className="text-right">
                  <Button type="primary" onClick={() => setCurrentStep(1)}>
                    مرحله بعد
                  </Button>
                </div>
              </div>
            </div>

            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
              <div>
                {/* نمایش تاریخ امروز */}
                <Alert
                  message={
                    <div style={{ textAlign: 'center' }}>
                      <strong>📅 امروز: {getTodayInfo().dayName} {getTodayInfo().persianDate}</strong>
                      <br />
                      <small style={{ color: '#666' }}>({getTodayInfo().gregorianDate})</small>
                    </div>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label="تاریخ (شمسی)"
                      name="persianDate"
                      rules={[{ required: true, message: "تاریخ را وارد کنید" }]}
                    >
                      <PersianCalendar 
                        placeholder="انتخاب تاریخ رزرو"
                        onChange={(date: string) => {
                          form.setFieldsValue({ persianDate: date });
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="ساعت"
                      name="time"
                      rules={[{ required: true, message: "ساعت را وارد کنید" }]}
                    >
                      <Input placeholder="19:00" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="تعداد نفرات"
                      name="partySize"
                      rules={[{ required: true, message: "تعداد نفرات را وارد کنید" }]}
                    >
                      <InputNumber min={1} max={20} className="w-full" />
                    </Form.Item>
                  </Col>
                </Row>
                <div className="text-right space-x-2 space-x-reverse">
                  <Button onClick={() => setCurrentStep(0)}>
                    مرحله قبل
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={async () => {
                      const values = form.getFieldsValue();
                      await handleCheckAvailability(values.persianDate, values.time, values.partySize);
                      setCurrentStep(2);
                    }}
                    loading={checkingAvailability}
                  >
                    بررسی دسترسی
                  </Button>
                </div>
              </div>
            </div>

            <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
              <div>
                {availability?.availableTables.length === 0 ? (
                  <Alert
                    message="هیچ میزی موجود نیست"
                    description="لطفاً زمان دیگری انتخاب کنید"
                    type="warning"
                    showIcon
                  />
                ) : (
                  <div>
                    <Title level={5}>میز مورد نظر را انتخاب کنید:</Title>
                    <Row gutter={[16, 16]} className="mt-4">
                      {availability?.availableTables.map((table) => (
                        <Col xs={24} sm={12} md={8} key={table.id}>
                          <Card
                            size="small"
                            className={`cursor-pointer border-2 ${
                              selectedTable?.id === table.id 
                                ? "border-blue-500 bg-blue-50" 
                                : table.isRecommended 
                                  ? "border-green-400" 
                                  : "border-gray-300"
                            }`}
                            onClick={() => setSelectedTable(table)}
                            title={`میز ${table.number}`}
                            extra={table.isRecommended && <Tag color="green">پیشنهادی</Tag>}
                          >
                            <div>
                              <div>ظرفیت: {table.capacity} نفر</div>
                              <div>موقعیت: {table.location}</div>
                              <div>نوع: {table.type === 'indoor' ? 'داخلی' : table.type === 'outdoor' ? 'بیرونی' : 'VIP'}</div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
                <div className="text-right space-x-2 space-x-reverse mt-4">
                  <Button onClick={() => setCurrentStep(1)}>
                    مرحله قبل
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={() => setCurrentStep(3)}
                    disabled={!selectedTable}
                  >
                    ادامه
                  </Button>
                </div>
              </div>
            </div>

            <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
              <div>
                <Alert
                  message="تایید رزرو"
                  description="لطفاً اطلاعات رزرو را بررسی کنید"
                  type="info"
                  showIcon
                  className="mb-4"
                />
                
                {selectedTable && (
                  <Card title="خلاصه رزرو">
                    <Row gutter={16}>
                      <Col span={12}>
                        <div><strong>مشتری:</strong> {form.getFieldValue('customerName')}</div>
                        <div><strong>تلفن:</strong> {form.getFieldValue('customerPhone')}</div>
                        <div><strong>تاریخ:</strong> {form.getFieldValue('persianDate')}</div>
                        <div><strong>ساعت:</strong> {form.getFieldValue('time')}</div>
                      </Col>
                      <Col span={12}>
                        <div><strong>میز:</strong> میز {selectedTable.number}</div>
                        <div><strong>ظرفیت:</strong> {selectedTable.capacity} نفر</div>
                        <div><strong>تعداد نفرات:</strong> {form.getFieldValue('partySize')} نفر</div>
                        <div><strong>موقعیت:</strong> {selectedTable.location}</div>
                      </Col>
                    </Row>
                  </Card>
                )}

                <div className="text-right space-x-2 space-x-reverse mt-4">
                  <Button onClick={() => setCurrentStep(1)}>
                    مرحله قبل
                  </Button>
                  <Button type="primary" htmlType="submit" loading={submitting}>
                    ثبت رزرو
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

// Wrap component with App provider for message context
const ReservationPageWithProvider: React.FC = () => {
  return (
    <App>
      <ReservationPageNew />
    </App>
  );
};

export default ReservationPageWithProvider;
