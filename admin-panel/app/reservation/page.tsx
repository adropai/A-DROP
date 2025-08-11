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
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// Types
interface Table {
  id: string;
  name: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "maintenance";
  hall: string;
  location?: string;
}

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number;
  tableId: string;
  tableName: string;
  hall: string;
  status: "pending" | "confirmed" | "seated" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
}

// API Functions
const fetchTables = async (): Promise<Table[]> => {
  try {
    const res = await fetch("/api/tables");
    if (!res.ok) throw new Error("خطا در دریافت اطلاعات میزها");
    return await res.json();
  } catch {
    throw new Error("خطا در دریافت اطلاعات میزها");
  }
};

const fetchReservations = async (): Promise<Reservation[]> => {
  try {
    const res = await fetch("/api/reservation");
    if (!res.ok) throw new Error("خطا در دریافت رزروها");
    return await res.json();
  } catch {
    throw new Error("خطا در دریافت رزروها");
  }
};

const submitReservation = async (data: any) => {
  const res = await fetch("/api/reservation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("خطا در ثبت رزرو");
  return res.json();
};

const updateReservationStatus = async (id: string, status: string) => {
  const res = await fetch(`/api/reservation/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("خطا در بروزرسانی وضعیت رزرو");
  return res.json();
};

const ReservationPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tablesData, reservationsData] = await Promise.all([
        fetchTables(),
        fetchReservations(),
      ]);
      setTables(tablesData || []);
      setReservations(reservationsData || []);
    } catch (error: any) {
      message.error(error.message || "خطا در بارگذاری اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  // Get available tables for specific date/time
  const getAvailableTables = (date: dayjs.Dayjs, time: dayjs.Dayjs) => {
    if (!Array.isArray(tables) || !Array.isArray(reservations)) return [];
    
    const reservationDateTime = dayjs(`${date.format("YYYY-MM-DD")} ${time.format("HH:mm")}`);
    
    return tables.filter((table) => {
      if (table.status !== "available") return false;
      
      // Check for conflicting reservations
      const hasConflict = reservations.some((reservation) => {
        if (reservation.tableId !== table.id) return false;
        if (reservation.status === "cancelled") return false;
        
        const reservationTime = dayjs(`${reservation.date} ${reservation.time}`);
        const timeDiff = Math.abs(reservationDateTime.diff(reservationTime, "hour"));
        
        return timeDiff < 2; // 2 hour buffer
      });
      
      return !hasConflict;
    });
  };

  // Submit new reservation
  const onFinish = async (values: any) => {
    console.log('Form values received:', values);
    
    setSubmitting(true);
    try {
      // Check if tableId exists
      if (!values.tableId) {
        message.error("لطفاً میز را انتخاب کنید");
        setSubmitting(false);
        return;
      }

      // Find selected table info
      const selectedTable = tables.find(t => t.id === values.tableId);
      console.log('Selected table:', selectedTable);

      const reservationData = {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        date: values.date.format("YYYY-MM-DD"),
        time: values.time.format("HH:mm"),
        partySize: values.partySize,
        tableId: values.tableId,
        tableName: selectedTable?.name || `میز ${values.tableId}`,
        hall: selectedTable?.hall || values.hall,
        notes: values.notes || "",
        status: "pending",
      };

      console.log('Reservation data to submit:', reservationData);

      await submitReservation(reservationData);
      message.success("رزرو با موفقیت ثبت شد");
      
      form.resetFields();
      setModalVisible(false);
      loadData(); // Reload data
    } catch (err: any) {
      console.error('Error submitting reservation:', err);
      message.error(err.message || "خطا در ثبت رزرو");
    }
    setSubmitting(false);
  };

  // Update reservation status
  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateReservationStatus(id, status);
      message.success("وضعیت رزرو بروزرسانی شد");
      loadData();
    } catch (err: any) {
      message.error(err.message || "خطا در بروزرسانی وضعیت");
    }
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "green";
      case "occupied": return "red";
      case "reserved": return "orange";
      case "maintenance": return "gray";
      case "pending": return "orange";
      case "confirmed": return "blue";
      case "seated": return "green";
      case "completed": return "gray";
      case "cancelled": return "red";
      default: return "default";
    }
  };

  // Status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "available": return "آزاد";
      case "occupied": return "اشغال";
      case "reserved": return "رزرو شده";
      case "maintenance": return "تعمیرات";
      case "pending": return "در انتظار";
      case "confirmed": return "تایید شده";
      case "seated": return "نشسته";
      case "completed": return "تکمیل شده";
      case "cancelled": return "لغو شده";
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
            <CalendarOutlined /> {dayjs(record.date).format("jYYYY/jMM/jDD")}
          </div>
          <div>
            <ClockCircleOutlined /> {record.time}
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
            <TableOutlined /> {record.tableName}
          </div>
          <Text type="secondary">{record.hall}</Text>
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
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusUpdate(record.id, "confirmed")}
              >
                تایید
              </Button>
              <Button
                danger
                size="small"
                icon={<ExclamationCircleOutlined />}
                onClick={() => handleStatusUpdate(record.id, "cancelled")}
              >
                لغو
              </Button>
            </>
          )}
          {record.status === "confirmed" && (
            <Button
              type="primary"
              size="small"
              icon={<TeamOutlined />}
              onClick={() => handleStatusUpdate(record.id, "seated")}
            >
              نشسته
            </Button>
          )}
          {record.status === "seated" && (
            <Button
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusUpdate(record.id, "completed")}
            >
              تکمیل
            </Button>
          )}
          <Button
            size="small"
            icon={<EyeOutlined />}
          >
            جزئیات
          </Button>
        </Space>
      ),
    },
  ];

  // Filter reservations by date
  const todaysReservations = Array.isArray(reservations) ? reservations.filter(
    (res) => dayjs(res.date).isSame(selectedDate, "day")
  ) : [];

  // Group tables by hall
  const tablesByHall = Array.isArray(tables) ? tables.reduce((acc, table) => {
    if (!acc[table.hall]) acc[table.hall] = [];
    acc[table.hall].push(table);
    return acc;
  }, {} as Record<string, Table[]>) : {};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="در حال بارگذاری اطلاعات رزرو..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Title level={2}>
            <TableOutlined /> مدیریت رزرو میز
          </Title>
          <Text type="secondary">
            مدیریت رزروها، وضعیت میزها و برنامه‌ریزی سالن
          </Text>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div className="text-center">
                <Badge count={Array.isArray(tables) ? tables.filter(t => t.status === "available").length : 0} showZero>
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
                <Badge count={Array.isArray(tables) ? tables.filter(t => t.status === "occupied").length : 0} showZero>
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

        {/* Main Content */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="رزروهای امروز" key="1">
            <Card>
              <div className="mb-4 flex justify-between items-center">
                <Space>
                  <DatePicker
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date || dayjs())}
                    placeholder="انتخاب تاریخ"
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                  >
                    رزرو جدید
                  </Button>
                </Space>
                <Button onClick={loadData}>
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
          </TabPane>

          <TabPane tab="وضعیت میزها" key="2">
            <div className="space-y-6">
              {Object.entries(tablesByHall).map(([hall, hallTables]) => (
                <Card key={hall} title={<><HomeOutlined /> {hall}</>}>
                  <Row gutter={[16, 16]}>
                    {hallTables.map((table) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={table.id}>
                        <Card
                          size="small"
                          className={`border-2 ${
                            table.status === "available" ? "border-green-300" :
                            table.status === "occupied" ? "border-red-300" :
                            table.status === "reserved" ? "border-orange-300" :
                            "border-gray-300"
                          }`}
                        >
                          <div className="text-center">
                            <Avatar
                              size={40}
                              style={{
                                backgroundColor: 
                                  table.status === "available" ? "#52c41a" :
                                  table.status === "occupied" ? "#f5222d" :
                                  table.status === "reserved" ? "#fa8c16" :
                                  "#d9d9d9"
                              }}
                            >
                              <TableOutlined />
                            </Avatar>
                            <div className="mt-2">
                              <Text strong>{table.name}</Text>
                              <div>
                                <Tag color={getStatusColor(table.status)}>
                                  {getStatusText(table.status)}
                                </Tag>
                              </div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                ظرفیت: {table.capacity} نفر
                              </Text>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              ))}
            </div>
          </TabPane>
        </Tabs>

        {/* New Reservation Modal */}
        <Modal
          title="رزرو جدید میز"
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Alert
            message="توجه"
            description="لطفاً اطلاعات رزرو را با دقت وارد کنید. پس از ثبت، مشتری از طریق پیامک اطلاع‌رسانی خواهد شد."
            type="info"
            showIcon
            className="mb-4"
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              date: dayjs().add(1, 'day'),
              time: dayjs().hour(19).minute(0),
              partySize: 2,
            }}
            onValuesChange={(changedValues, allValues) => {
              console.log('Form values changed:', changedValues, 'All values:', allValues);
              // Force re-render when date, time or hall changes
              if (changedValues.date || changedValues.time || changedValues.hall) {
                if (changedValues.date || changedValues.time) {
                  form.setFieldsValue({ tableId: undefined });
                }
              }
            }}
            onFinishFailed={(errorInfo) => {
              console.log('Form validation failed:', errorInfo);
              message.error("لطفاً همه فیلدهای ضروری را تکمیل کنید");
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="نام مشتری"
                  name="customerName"
                  rules={[{ required: true, message: "نام مشتری را وارد کنید" }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="نام و نام خانوادگی"
                  />
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
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="09123456789"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="تاریخ رزرو"
                  name="date"
                  rules={[{ required: true, message: "تاریخ را انتخاب کنید" }]}
                >
                  <DatePicker
                    className="w-full"
                    placeholder="انتخاب تاریخ"
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="ساعت رزرو"
                  name="time"
                  rules={[{ required: true, message: "ساعت را انتخاب کنید" }]}
                >
                  <TimePicker
                    className="w-full"
                    format="HH:mm"
                    placeholder="انتخاب ساعت"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="تعداد نفرات"
                  name="partySize"
                  rules={[{ required: true, message: "تعداد نفرات را وارد کنید" }]}
                >
                  <InputNumber
                    min={1}
                    max={20}
                    placeholder="تعداد نفرات"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="سالن"
                  name="hall"
                  rules={[{ required: true, message: "سالن را انتخاب کنید" }]}
                >
                  <Select 
                    placeholder="انتخاب سالن"
                    onChange={(value) => {
                      // Clear table selection when hall changes
                      form.setFieldsValue({ tableId: undefined });
                    }}
                  >
                    {Object.keys(tablesByHall).map((hall) => (
                      <Option key={hall} value={hall}>
                        {hall}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item dependencies={['date', 'time', 'hall']} noStyle>
              {({ getFieldValue }) => {
                const selectedDate = getFieldValue('date');
                const selectedTime = getFieldValue('time');
                const selectedHall = getFieldValue('hall');
                
                console.log('Form values:', { selectedDate, selectedTime, selectedHall });
                console.log('Tables data:', tables);
                
                let availableTables = [];
                
                if (selectedDate && selectedTime) {
                  // Get available tables based on date/time
                  availableTables = getAvailableTables(selectedDate, selectedTime);
                } else {
                  // Show all available tables if no date/time selected
                  availableTables = tables.filter((table) => table.status === 'available');
                }
                
                // Filter by hall if selected
                if (selectedHall) {
                  availableTables = availableTables.filter((table) => table.hall === selectedHall);
                }

                console.log('Available tables:', availableTables);

                return (
                  <Form.Item
                    label="انتخاب میز"
                    name="tableId"
                    rules={[{ required: true, message: "میز را انتخاب کنید" }]}
                  >
                    <div>
                      <Select
                        placeholder="انتخاب میز"
                        disabled={false} // Always enable to debug
                        showSearch
                        optionFilterProp="children"
                        style={{ width: '100%' }}
                        dropdownStyle={{ zIndex: 1050 }}
                        onChange={(value) => {
                          console.log('Selected table ID:', value);
                          form.setFieldsValue({ tableId: value });
                        }}
                      >
                        {availableTables.map((table) => (
                          <Option key={table.id} value={table.id}>
                            {table.name} (ظرفیت: {table.capacity} نفر) - {table.hall}
                          </Option>
                        ))}
                      </Select>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {!selectedDate || !selectedTime 
                            ? "ابتدا تاریخ و ساعت را انتخاب کنید" 
                            : `${availableTables.length} میز موجود است`}
                        </Text>
                      </div>
                    </div>
                  </Form.Item>
                );
              }}
            </Form.Item>

            <Form.Item label="یادداشت" name="notes">
              <TextArea
                rows={3}
                placeholder="یادداشت‌های اضافی برای رزرو (اختیاری)"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button onClick={() => setModalVisible(false)}>
                  انصراف
                </Button>
                <Button 
                  onClick={() => {
                    const values = form.getFieldsValue();
                    console.log('Current form values:', values);
                    message.info(`مقادیر فرم: ${JSON.stringify(values, null, 2)}`);
                  }}
                >
                  تست مقادیر
                </Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  ثبت رزرو
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default ReservationPage;