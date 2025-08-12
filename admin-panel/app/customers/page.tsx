
"use client";

import { useState, useEffect } from "react";
import { ProTable, ProDescriptions, ProForm, ProFormText, ProFormSelect, ProFormTextArea, ProFormDigit, ProFormCheckbox, ProFormSegmented } from "@ant-design/pro-components";
import { Button, Modal, Drawer, Tag, Card, Space, Avatar, Row, Col, Typography, Statistic, App, Tabs, Badge, Progress } from "antd";
import { UserOutlined, EditOutlined, DeleteOutlined, PlusOutlined, CrownOutlined, GiftOutlined, StarOutlined } from "@ant-design/icons";
import { useCustomersStore } from "../../stores/customers-store";
import { Customer, CustomerTier, CustomerStatus } from "../../types/customers";

const { Title, Text } = Typography;

export default function CustomersPage() {
  const { message } = App.useApp();
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setSelectedCustomer,
    selectedCustomer,
    filters,
    setFilters,
    loading,
    getCustomerStats,
    getCustomersByTier,
    fetchCustomers,
  } = useCustomersStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // دریافت داده‌ها هنگام بارگذاری صفحه
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Analytics & Stats
  const stats = getCustomerStats();

  // Table Columns
  const columns = [
    {
      title: "نام",
      dataIndex: "name",
      render: (_: any, record: Customer) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div>{record.name}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>{record.phone}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "سطح وفاداری",
      dataIndex: "tier",
      render: (_: any, record: Customer) => (
        <Tag color={record.tier === "Gold" ? "gold" : record.tier === "Silver" ? "silver" : record.tier === "Bronze" ? "blue" : "purple"} icon={record.tier === "Gold" ? <CrownOutlined /> : record.tier === "Silver" ? <StarOutlined /> : record.tier === "Bronze" ? <GiftOutlined /> : <CrownOutlined />}>
          {record.tier}
        </Tag>
      ),
      filters: [
        { text: "Bronze", value: "Bronze" },
        { text: "Silver", value: "Silver" },
        { text: "Gold", value: "Gold" },
        { text: "Platinum", value: "Platinum" },
      ],
      onFilter: (value: string, record: Customer) => record.tier === value,
    },
    {
      title: "برچسب‌ها",
      dataIndex: "tags",
      render: (_: any, record: Customer) => (
        <Space size={[0, 8]} wrap>
          {record.tags && record.tags.length > 0 ? (
            record.tags.map((tag: string, index: number) => (
              <Tag key={index} color={
                tag === "VIP" ? "purple" : 
                tag === "وفادار" ? "green" : 
                tag === "جدید" ? "blue" : 
                tag === "گیاهخوار" ? "orange" : "default"
              }>
                {tag}
              </Tag>
            ))
          ) : (
            <span style={{ color: "#999" }}>-</span>
          )}
        </Space>
      ),
    },
    {
      title: "وضعیت",
      dataIndex: "status",
      render: (_: any, record: Customer) => (
        <Badge status={record.status === "Active" ? "success" : record.status === "Blocked" ? "error" : "default"} text={record.status} />
      ),
      filters: [
        { text: "Active", value: "Active" },
        { text: "Inactive", value: "Inactive" },
        { text: "Blocked", value: "Blocked" },
      ],
      onFilter: (value: string, record: Customer) => record.status === value,
    },
    {
      title: "تعداد سفارشات",
      dataIndex: ["stats", "totalOrders"],
      sorter: (a: Customer, b: Customer) => (a.stats?.totalOrders ?? 0) - (b.stats?.totalOrders ?? 0),
      render: (_: any, record: Customer) => record.stats?.totalOrders ?? 0,
    },
    {
      title: "مجموع خرید",
      dataIndex: ["stats", "totalSpent"],
      sorter: (a: Customer, b: Customer) => (a.stats?.totalSpent ?? 0) - (b.stats?.totalSpent ?? 0),
      render: (_: any, record: Customer) => `${(record.stats?.totalSpent ?? 0).toLocaleString()} تومان`,
    },
    {
      title: "آخرین سفارش",
      dataIndex: ["stats", "lastOrderDate"],
      render: (_: any, record: Customer) => record.stats?.lastOrderDate || "-",
    },
    {
      title: "عملیات",
      valueType: "option",
      render: (_: any, record: Customer) => [
        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => { setEditingCustomer(record); setIsModalVisible(true); }}>ویرایش</Button>,
        <Button key="delete" type="link" danger icon={<DeleteOutlined />} onClick={async () => { 
          Modal.confirm({
            title: 'حذف مشتری',
            content: `آیا از حذف مشتری ${record.name} اطمینان دارید؟`,
            okText: 'حذف',
            cancelText: 'انصراف',
            okType: 'danger',
            onOk: async () => {
              try {
                await deleteCustomer(record.id);
                message.success("مشتری حذف شد");
              } catch (error: any) {
                message.error(error.message || 'خطا در حذف مشتری');
              }
            },
          });
        }}>حذف</Button>,
      ],
    },
  ];

  // Form Submit
  const handleSubmit = async (values: any) => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, values);
        message.success("اطلاعات مشتری ویرایش شد");
      } else {
        await addCustomer(values);
        message.success("مشتری جدید اضافه شد");
      }
      setIsModalVisible(false);
      setEditingCustomer(null);
    } catch (error: any) {
      message.error(error.message || "خطا در ثبت اطلاعات مشتری");
    }
  };

  // Responsive UI & Analytics
  return (
    <div className="customers-management p-6">
      {/* کارت‌های آمار */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="کل مشتریان"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="مشتریان فعال"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="درآمد کل"
              value={stats.totalSpent}
              precision={0}
              formatter={(value) => `${Number(value).toLocaleString()} تومان`}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="میانگین خرید"
              value={stats.averageValue}
              precision={0}
              formatter={(value) => `${Number(value).toLocaleString()} تومان`}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card title="آمار مشتریان" variant="outlined">
            <Statistic title="تعداد کل" value={stats.total} />
            <Statistic title="فعال" value={stats.active} />
            <Statistic title="مجموع خرید" value={stats.totalSpent} suffix="تومان" />
            <Statistic title="ارزش متوسط" value={Math.round(stats.averageValue)} suffix="تومان" />
            <Progress percent={Math.round((stats.active / stats.total) * 100)} status="active" showInfo={true} />
          </Card>
          <Card title="توزیع سطح وفاداری" variant="outlined" style={{ marginTop: 16 }}>
            {Object.entries(stats.byTier).map(([tier, count]) => (
              <div key={tier} style={{ marginBottom: 8 }}>
                <Tag color={tier === "Gold" ? "gold" : tier === "Silver" ? "silver" : tier === "Bronze" ? "blue" : "purple"}>{tier}</Tag>
                <span style={{ marginRight: 8 }}>{count} نفر</span>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={18}>
          <ProTable
            columns={columns}
            dataSource={customers}
            rowKey="id"
            search={false}
            loading={loading}
            pagination={{ defaultPageSize: 10 }}
            headerTitle="مدیریت مشتریان"
            toolBarRender={() => [
              <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCustomer(null); setIsModalVisible(true); }}>افزودن مشتری جدید</Button>,
            ]}
          />
        </Col>
      </Row>

      <Modal
        title={editingCustomer ? "ویرایش مشتری" : "افزودن مشتری جدید"}
        open={isModalVisible}
        onCancel={() => { setIsModalVisible(false); setEditingCustomer(null); }}
        footer={null}
        width={600}
      >
        {isModalVisible && (
          <ProForm
            key={editingCustomer?.id || 'new'} // key برای reset کردن فرم
            initialValues={editingCustomer ? {
              name: editingCustomer.name,
              phone: editingCustomer.phone,
              email: editingCustomer.email || '',
              tier: editingCustomer.tier,
              status: editingCustomer.status,
              gender: editingCustomer.gender || '',
              dateOfBirth: editingCustomer.dateOfBirth || '',
              avatar: editingCustomer.avatar || ''
            } : { 
              tier: "Bronze", 
              status: "Active" 
            }}
            onFinish={handleSubmit}
            layout="vertical"
            submitter={{
              searchConfig: {
                submitText: editingCustomer ? "ویرایش" : "افزودن",
                resetText: "انصراف",
              },
              onReset: () => { setIsModalVisible(false); setEditingCustomer(null); },
            }}
          >
          <ProFormText name="name" label="نام و نام خانوادگی" placeholder="نام کامل مشتری" rules={[{ required: true, message: "نام الزامی است" }]} />
          <ProFormText name="phone" label="شماره تماس" placeholder="09123456789" rules={[{ required: true, message: "شماره تماس الزامی است" }]} />
          <ProFormText name="email" label="ایمیل" placeholder="email@example.com" rules={[{ type: "email", message: "فرمت ایمیل صحیح نیست" }]} />
          <ProFormSelect name="tier" label="سطح وفاداری" options={[{ label: "Bronze", value: "Bronze" }, { label: "Silver", value: "Silver" }, { label: "Gold", value: "Gold" }, { label: "Platinum", value: "Platinum" }]} rules={[{ required: true, message: "سطح وفاداری الزامی است" }]} />
          <ProFormSelect name="status" label="وضعیت" options={[{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }, { label: "Blocked", value: "Blocked" }]} rules={[{ required: true, message: "وضعیت الزامی است" }]} />
          <ProFormTextArea name="notes" label="یادداشت" placeholder="یادداشت‌های مشتری" />
          <ProFormCheckbox.Group name="tags" label="برچسب‌ها" options={[{ label: "VIP", value: "VIP" }, { label: "وفادار", value: "وفادار" }, { label: "جدید", value: "جدید" }, { label: "گیاهخوار", value: "گیاهخوار" }]} />
          </ProForm>
        )}
      </Modal>

      {/* Modal پروفایل تفصیلی مشتری */}
      <Modal
        title={`پروفایل ${selectedCustomer?.name || 'مشتری'}`}
        open={!!selectedCustomer}
        onCancel={() => setSelectedCustomer(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedCustomer(null)}>
            بستن
          </Button>
        ]}
        width={800}
      >
        {selectedCustomer && (
          <div>
            <Row gutter={16}>
              <Col span={8}>
                <Avatar size={80} src={selectedCustomer.avatar} icon={<UserOutlined />} />
              </Col>
              <Col span={16}>
                <Title level={4}>{selectedCustomer.name}</Title>
                <Text type="secondary">{selectedCustomer.phone}</Text>
                <br />
                <Tag color={selectedCustomer.tier === "Gold" ? "gold" : selectedCustomer.tier === "Silver" ? "silver" : selectedCustomer.tier === "Bronze" ? "blue" : "purple"}>
                  {selectedCustomer.tier}
                </Tag>
                <Badge 
                  status={selectedCustomer.status === "Active" ? "success" : selectedCustomer.status === "Blocked" ? "error" : "default"} 
                  text={selectedCustomer.status} 
                />
              </Col>
            </Row>
            
            <Tabs defaultActiveKey="1" style={{ marginTop: 16 }}>
              <Tabs.TabPane tab="اطلاعات کلی" key="1">
                <ProDescriptions column={2} dataSource={selectedCustomer} columns={[
                  { title: "نام", dataIndex: "name" },
                  { title: "تلفن", dataIndex: "phone" },
                  { title: "ایمیل", dataIndex: "email" },
                  { title: "سطح وفاداری", dataIndex: "tier" },
                  { title: "وضعیت", dataIndex: "status" },
                  { title: "تاریخ عضویت", dataIndex: "createdAt", render: (text: string) => new Date(text).toLocaleDateString('fa-IR') },
                ]} />
              </Tabs.TabPane>
              
              <Tabs.TabPane tab="آمار خرید" key="2">
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic title="تعداد سفارشات" value={selectedCustomer.stats?.totalOrders || 0} />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="مجموع خرید" 
                      value={selectedCustomer.stats?.totalSpent || 0} 
                      suffix="تومان"
                      formatter={(value) => Number(value).toLocaleString()}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="میانگین سفارش" 
                      value={selectedCustomer.stats?.averageOrderValue || 0} 
                      suffix="تومان"
                      formatter={(value) => Number(value).toLocaleString()}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic title="امتیاز وفاداری" value={selectedCustomer.stats?.loyaltyPoints || 0} />
                  </Col>
                </Row>
              </Tabs.TabPane>
              
              <Tabs.TabPane tab="آدرس‌ها" key="3">
                {selectedCustomer.addresses?.map((address, index) => (
                  <Card key={address.id} size="small" style={{ marginBottom: 8 }}>
                    <div>
                      <Text strong>{address.title}</Text>
                      {address.isDefault && <Tag color="blue" style={{ marginLeft: 8 }}>پیش‌فرض</Tag>}
                    </div>
                    <Text type="secondary">{address.address}</Text>
                    <br />
                    <Text type="secondary">{address.city} - {address.district}</Text>
                  </Card>
                ))}
              </Tabs.TabPane>
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
}
