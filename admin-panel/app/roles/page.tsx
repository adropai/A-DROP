'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Tag, 
  message, 
  Popconfirm, 
  Tooltip,
  Row,
  Col,
  Statistic,
  Switch,
  Divider,
  Checkbox,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  SafetyOutlined,
  TeamOutlined,
  KeyOutlined,
  SettingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { UserRole, Permission, DEFAULT_ROLES, DEFAULT_PERMISSIONS } from '@/types/auth';

const { Option } = Select;
const { TextArea } = Input;

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<UserRole[]>(DEFAULT_ROLES);
  const [permissions, setPermissions] = useState<Permission[]>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [form] = Form.useForm();

  // Load roles from API
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      // در پروداکشن از API واقعی استفاده کنید
      // const response = await fetch('/api/roles');
      // const data = await response.json();
      // setRoles(data.roles);
      
      // Mock data for development
      setRoles(DEFAULT_ROLES);
    } catch (error) {
      message.error('خطا در بارگذاری نقش‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditRole = (role: UserRole) => {
    setEditingRole(role);
    form.setFieldsValue({
      ...role,
      permissions: role.permissions?.map(p => p.id) || [],
    });
    setModalVisible(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      // در پروداکشن از API واقعی استفاده کنید
      // await fetch(`/api/roles/${roleId}`, { method: 'DELETE' });
      
      setRoles(roles.filter(role => role.id !== roleId));
      message.success('نقش با موفقیت حذف شد');
    } catch (error) {
      message.error('خطا در حذف نقش');
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const selectedPermissions = permissions.filter(p => 
        values.permissions?.includes(p.id)
      );

      const roleData = {
        ...values,
        permissions: selectedPermissions,
        id: editingRole?.id || String(roles.length + 1),
        createdAt: editingRole?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (editingRole) {
        // Update existing role
        setRoles(roles.map(role => 
          role.id === editingRole.id ? roleData : role
        ));
        message.success('نقش با موفقیت به‌روزرسانی شد');
      } else {
        // Create new role
        setRoles([...roles, roleData]);
        message.success('نقش جدید با موفقیت ایجاد شد');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('خطا در ذخیره نقش');
    } finally {
      setLoading(false);
    }
  };

  const toggleRoleStatus = async (roleId: string) => {
    try {
      setRoles(roles.map(role => 
        role.id === roleId 
          ? { ...role, isActive: !role.isActive }
          : role
      ));
      message.success('وضعیت نقش تغییر یافت');
    } catch (error) {
      message.error('خطا در تغییر وضعیت نقش');
    }
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      'order_management': 'مدیریت سفارشات',
      'menu_management': 'مدیریت منو',
      'customer_management': 'مدیریت مشتریان',
      'staff_management': 'مدیریت پرسنل',
      'inventory_management': 'مدیریت انبار',
      'financial_management': 'مدیریت مالی',
      'system_admin': 'مدیریت سیستم',
      'analytics_reports': 'گزارشات و تحلیل',
    };
    return categoryNames[category] || category;
  };

  const columns = [
    {
      title: 'نام نقش',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text: string, record: UserRole) => (
        <Space>
          <SafetyOutlined />
          <strong>{text}</strong>
          {record.level === 1 && <Tag color="gold">سوپر ادمین</Tag>}
          {record.level === 2 && <Tag color="blue">ادمین</Tag>}
          {record.level >= 3 && <Tag color="green">کاربر</Tag>}
        </Space>
      ),
    },
    {
      title: 'شناسه سیستمی',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: 'سطح دسترسی',
      dataIndex: 'level',
      key: 'level',
      align: 'center' as const,
      render: (level: number) => (
        <Tag color={level === 1 ? 'red' : level === 2 ? 'orange' : 'blue'}>
          سطح {level}
        </Tag>
      ),
    },
    {
      title: 'تعداد مجوزها',
      dataIndex: 'permissions',
      key: 'permissions',
      align: 'center' as const,
      render: (permissions: Permission[]) => (
        <Tag color="cyan">{permissions?.length || 0} مجوز</Tag>
      ),
    },
    {
      title: 'وضعیت',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center' as const,
      render: (isActive: boolean, record: UserRole) => (
        <Switch
          checked={isActive}
          onChange={() => toggleRoleStatus(record.id)}
          checkedChildren="فعال"
          unCheckedChildren="غیرفعال"
        />
      ),
    },
    {
      title: 'عملیات',
      key: 'actions',
      align: 'center' as const,
      render: (_, record: UserRole) => (
        <Space>
          <Tooltip title="ویرایش نقش">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditRole(record)}
            />
          </Tooltip>
          <Popconfirm
            title="آیا از حذف این نقش مطمئن هستید؟"
            onConfirm={() => handleDeleteRole(record.id)}
            okText="بله"
            cancelText="خیر"
          >
            <Tooltip title="حذف نقش">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={record.level === 1} // Prevent deleting super admin
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const permissionCategories = getPermissionsByCategory();

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h1 style={{ margin: 0, fontSize: '24px' }}>
              <TeamOutlined style={{ marginLeft: '8px' }} />
              مدیریت نقش‌ها و مجوزها
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              تعریف و مدیریت نقش‌های کاربری و سطوح دسترسی
            </p>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateRole}
              size="large"
            >
              نقش جدید
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="کل نقش‌ها"
              value={roles.length}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="نقش‌های فعال"
              value={roles.filter(r => r.isActive).length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="کل مجوزها"
              value={permissions.length}
              prefix={<KeyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="دسته‌بندی‌ها"
              value={Object.keys(permissionCategories).length}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Roles Table */}
      <Card title="لیست نقش‌ها" style={{ marginBottom: '24px' }}>
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `مجموع ${total} نقش`,
          }}
        />
      </Card>

      {/* Permissions Overview */}
      <Card title="نمای کلی مجوزها">
        <Alert
          message="راهنمای مجوزها"
          description="در زیر تمام مجوزهای سیستم بر اساس دسته‌بندی نمایش داده شده است. هنگام ایجاد یا ویرایش نقش، می‌توانید مجوزهای مورد نیاز را انتخاب کنید."
          type="info"
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: '16px' }}
        />
        
        {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
          <div key={category} style={{ marginBottom: '16px' }}>
            <h3>{getCategoryDisplayName(category)}</h3>
            <Row gutter={[8, 8]}>
              {categoryPermissions.map(permission => (
                <Col key={permission.name}>
                  <Tag color="blue">
                    {permission.description}
                  </Tag>
                </Col>
              ))}
            </Row>
            <Divider />
          </div>
        ))}
      </Card>

      {/* Create/Edit Role Modal */}
      <Modal
        title={editingRole ? 'ویرایش نقش' : 'ایجاد نقش جدید'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="displayName"
                label="نام نمایشی نقش"
                rules={[{ required: true, message: 'نام نمایشی الزامی است' }]}
              >
                <Input placeholder="مثال: مدیر فروش" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="شناسه سیستمی"
                rules={[
                  { required: true, message: 'شناسه سیستمی الزامی است' },
                  { pattern: /^[a-z_]+$/, message: 'فقط حروف کوچک انگلیسی و _ مجاز است' }
                ]}
              >
                <Input placeholder="مثال: sales_manager" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="level"
                label="سطح دسترسی"
                rules={[{ required: true, message: 'سطح دسترسی الزامی است' }]}
              >
                <Select placeholder="انتخاب سطح دسترسی">
                  <Option value={1}>سطح 1 - سوپر ادمین</Option>
                  <Option value={2}>سطح 2 - ادمین</Option>
                  <Option value={3}>سطح 3 - سرپرست</Option>
                  <Option value={4}>سطح 4 - کاربر</Option>
                  <Option value={5}>سطح 5 - مهمان</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="وضعیت"
                valuePropName="checked"
              >
                <Switch checkedChildren="فعال" unCheckedChildren="غیرفعال" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="توضیحات"
          >
            <TextArea rows={3} placeholder="توضیحات مختصر درباره این نقش..." />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="مجوزها"
            rules={[{ required: true, message: 'حداقل یک مجوز انتخاب کنید' }]}
          >
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #d9d9d9', padding: '12px', borderRadius: '6px' }}>
              {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
                <div key={category} style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: '#1890ff', marginBottom: '8px' }}>
                    {getCategoryDisplayName(category)}
                  </h4>
                  <Checkbox.Group>
                    <Row>
                      {categoryPermissions.map(permission => (
                        <Col span={24} key={permission.name} style={{ marginBottom: '4px' }}>
                          <Checkbox value={permission.id || permission.name}>
                            {permission.description}
                            {permission.description && (
                              <span style={{ color: '#666', fontSize: '12px' }}>
                                {' '}({permission.name})
                              </span>
                            )}
                          </Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                  <Divider style={{ margin: '12px 0' }} />
                </div>
              ))}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
