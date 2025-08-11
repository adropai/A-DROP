'use client';
import { Card, Row, Col, Button, Table, Tag, Switch, Modal, Form, Input, Select } from 'antd';
import { ApiOutlined, SyncOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import { useState } from 'react';

export default function IntegrationsPage() {
  const [integrations] = useState([
    { id: '1', name: 'درگاه پرداخت', type: 'payment', provider: 'Zarinpal', status: 'active' },
    { id: '2', name: 'سیستم ارسال', type: 'delivery', provider: 'Snap', status: 'active' },
    { id: '3', name: 'حسابداری', type: 'accounting', provider: 'Sepidar', status: 'inactive' }
  ]);

  const [modalVisible, setModalVisible] = useState(false);

  const columns = [
    { title: 'نام', dataIndex: 'name', key: 'name' },
    { title: 'نوع', dataIndex: 'type', key: 'type' },
    { title: 'ارائه‌دهنده', dataIndex: 'provider', key: 'provider' },
    { 
      title: 'وضعیت', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'فعال' : 'غیرفعال'}
        </Tag>
      )
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_, record) => (
        <div>
          <Button size="small" icon={<SyncOutlined />} style={{ marginRight: 8 }}>
            همگام‌سازی
          </Button>
          <Button size="small" icon={<SettingOutlined />}>
            تنظیمات
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <h1><ApiOutlined /> مرکز یکپارچه‌سازی</h1>
        <Button type="primary" onClick={() => setModalVisible(true)}>
          <LinkOutlined /> افزودن یکپارچه‌سازی
        </Button>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3>یکپارچه‌سازی‌های فعال</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {integrations.filter(i => i.status === 'active').length}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3>همگام‌سازی امروز</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                24
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3>خطاهای API</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                2
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="فهرست یکپارچه‌سازی‌ها">
        <Table 
          dataSource={integrations}
          columns={columns}
          pagination={false}
          size="middle"
        />
      </Card>

      <Modal
        title="افزودن یکپارچه‌سازی جدید"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="نام یکپارچه‌سازی">
            <Input placeholder="نام یکپارچه‌سازی را وارد کنید" />
          </Form.Item>
          <Form.Item label="نوع">
            <Select placeholder="نوع را انتخاب کنید">
              <Select.Option value="payment">پرداخت</Select.Option>
              <Select.Option value="delivery">ارسال</Select.Option>
              <Select.Option value="accounting">حسابداری</Select.Option>
              <Select.Option value="marketing">بازاریابی</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="ارائه‌دهنده">
            <Input placeholder="نام ارائه‌دهنده" />
          </Form.Item>
          <Form.Item label="API Key">
            <Input.Password placeholder="کلید API" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              ایجاد یکپارچه‌سازی
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
