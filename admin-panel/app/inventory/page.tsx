'use client'

import React, { useEffect, useState, useMemo } from "react";
import { 
  ProTable, 
  ProForm, 
  ProFormText, 
  ProFormDigit, 
  ProFormSelect,
  ProCard,
  Statistic
} from "@ant-design/pro-components";
import { 
  Button, 
  Tag, 
  Space, 
  Tooltip, 
  Alert, 
  Modal, 
  Typography, 
  Form, 
  Tabs, 
  Badge,
  Row,
  Col,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Card,
  Divider,
  App
} from "antd";
const { Option } = Select;
import { 
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  ShopOutlined,
  BarChartOutlined,
  FileExcelOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  MinusOutlined
} from "@ant-design/icons";
import { useInventoryStore } from "@/stores/inventory-store";
import { 
  InventoryItem, 
  InventoryCategory, 
  StockMovement, 
  InventoryStatus, 
  MovementType 
} from "@/types/inventory";
import PersianCalendar from "@/components/common/AdvancedPersianCalendar";
import moment from 'moment-jalaali';

const { Text, Title } = Typography;
const { Search } = Input;

// تنظیم moment-jalaali
moment.loadPersian({ dialect: 'persian-modern' });

const InventoryPage: React.FC = () => {
  const { message, modal } = App.useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<InventoryStatus | ''>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
  const [movementModalVisible, setMovementModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [movementForm] = Form.useForm();

  const {
    items,
    categories,
    movements,
    stats,
    loading,
    error,
    fetchItems,
    fetchCategories,
    fetchMovements,
    fetchStats,
    createItem,
    updateItem,
    deleteItem,
    createMovement,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useInventoryStore();

  // محاسبه دسته‌بندی آیتم‌ها
  const categorizeItems = useMemo(() => {
    const today = moment(); // امروز
    
    const expired = items.filter(item => {
      if (!item.expiryDate) return false;
      // تبدیل تاریخ انقضا از format میلادی به شمسی برای مقایسه
      const expiryDate = moment(item.expiryDate);
      return expiryDate.isBefore(today, 'day');
    });

    const expiringSoon = items.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = moment(item.expiryDate);
      const daysUntilExpiry = expiryDate.diff(today, 'days');
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 15;
    });

    const lowStock = items.filter(item => {
      return item.currentStock <= item.minStock;
    });

    return {
      all: items,
      expired,
      expiringSoon,
      lowStock
    };
  }, [items]);

  // فیلتر آیتم‌ها بر اساس جستجو و فیلترها
  const filteredItems = useMemo(() => {
    if (activeTab === 'movements') return [];
    
    let currentItems = categorizeItems[activeTab as keyof typeof categorizeItems] || [];

    // فیلتر بر اساس متن جستجو
    if (searchText) {
      currentItems = currentItems.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // فیلتر بر اساس دسته‌بندی
    if (selectedCategory) {
      currentItems = currentItems.filter(item => item.categoryId === selectedCategory);
    }

    // فیلتر بر اساس وضعیت
    if (selectedStatus) {
      currentItems = currentItems.filter(item => item.status === selectedStatus);
    }

    return currentItems;
  }, [categorizeItems, activeTab, searchText, selectedCategory, selectedStatus]);

  // فیلتر حرکات انبار
  const filteredMovements = useMemo(() => {
    if (activeTab !== 'movements') return [];
    
    let currentMovements = movements;

    // فیلتر بر اساس متن جستجو
    if (searchText) {
      currentMovements = currentMovements.filter(movement =>
        movement.item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        movement.item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
        movement.reason?.toLowerCase().includes(searchText.toLowerCase()) ||
        movement.user.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return currentMovements.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [movements, activeTab, searchText]);

  // بارگذاری داده‌ها
  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchMovements();
    fetchStats();
  }, [fetchItems, fetchCategories, fetchMovements, fetchStats]);

  // نمایش وضعیت آیتم با انقضا
  const renderStatusWithExpiry = (item: InventoryItem) => {
    const today = moment();
    
    if (item.expiryDate) {
      const expiryDate = moment(item.expiryDate);
      const daysUntilExpiry = expiryDate.diff(today, 'days');
      
      if (daysUntilExpiry < 0) {
        return <Tag icon={<ExclamationCircleOutlined />} color="red">منقضی شده</Tag>;
      } else if (daysUntilExpiry <= 15) {
        return <Tag icon={<WarningOutlined />} color="orange">{daysUntilExpiry} روز تا انقضا</Tag>;
      }
    }
    
    if (item.currentStock <= item.minStock) {
      return <Tag icon={<AlertOutlined />} color="yellow">کمبود موجودی</Tag>;
    }
    
    return <Tag color="green">موجود</Tag>;
  };

  // ستون‌های جدول
  const columns = [
    {
      title: 'کد',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      fixed: 'left' as const,
      render: (text: string) => <Text code>{text}</Text>
    },
    {
      title: 'نام محصول',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left' as const,
      render: (text: string, record: InventoryItem) => (
        <div>
          <Text strong>{text}</Text>
          {record.description && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.description}
              </Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'دسته‌بندی',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 150,
      render: (text: string) => <Tag>{text}</Tag>
    },
    {
      title: 'موجودی فعلی',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 120,
      align: 'center' as const,
      render: (value: number, record: InventoryItem) => (
        <div>
          <Text 
            strong 
            type={value <= record.minStock ? 'danger' : 'success'}
          >
            {value.toLocaleString()}
          </Text>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.unit}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'حداقل موجودی',
      dataIndex: 'minStock',
      key: 'minStock',
      width: 120,
      align: 'center' as const,
      render: (value: number, record: InventoryItem) => (
        <Text type="secondary">
          {value.toLocaleString()} {record.unit}
        </Text>
      )
    },
    {
      title: 'قیمت واحد',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right' as const,
      render: (value: number) => (
        <Text>{value.toLocaleString()} تومان</Text>
      )
    },
    {
      title: 'تاریخ انقضا',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date: string) => {
        if (!date) return <Text type="secondary">-</Text>;
        const expiryDate = moment(date);
        const today = moment();
        const daysUntilExpiry = expiryDate.diff(today, 'days');
        
        return (
          <Tooltip title={`${daysUntilExpiry} روز مانده`}>
            <Text type={daysUntilExpiry <= 15 ? 'danger' : 'secondary'}>
              {expiryDate.format('jYYYY/jMM/jDD')}
            </Text>
          </Tooltip>
        );
      }
    },
    {
      title: 'وضعیت',
      key: 'status',
      width: 150,
      render: (_: any, record: InventoryItem) => renderStatusWithExpiry(record)
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: InventoryItem) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(record)}
          >
            ویرایش
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
          >
            حذف
          </Button>
        </Space>
      )
    }
  ];

  // ستون‌های جدول گردش انبار
  const movementColumns = [
    {
      title: 'تاریخ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <Text>{moment(date).format('jYYYY/jMM/jDD HH:mm')}</Text>
      )
    },
    {
      title: 'محصول',
      dataIndex: ['item', 'name'],
      key: 'itemName',
      width: 200,
      render: (text: string, record: StockMovement) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {record.item.sku}
          </Text>
        </div>
      )
    },
    {
      title: 'نوع حرکت',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: MovementType) => {
        const typeMap = {
          'IN': { text: 'ورود', color: 'green' },
          'OUT': { text: 'خروج', color: 'red' },
          'ADJUSTMENT': { text: 'تعدیل', color: 'orange' },
          'TRANSFER': { text: 'انتقال', color: 'blue' },
          'RETURN': { text: 'برگشت', color: 'purple' },
          'WASTE': { text: 'ضایعات', color: 'volcano' },
          'EXPIRED': { text: 'منقضی', color: 'magenta' }
        };
        const config = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'مقدار',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center' as const,
      render: (quantity: number, record: StockMovement) => (
        <Text strong style={{ 
          color: record.type === 'IN' ? '#52c41a' : record.type === 'OUT' ? '#ff4d4f' : '#1890ff' 
        }}>
          {record.type === 'OUT' ? '-' : '+'}{quantity.toLocaleString()}
        </Text>
      )
    },
    {
      title: 'موجودی قبل',
      dataIndex: 'previousStock',
      key: 'previousStock',
      width: 110,
      align: 'center' as const,
      render: (value: number) => <Text>{value.toLocaleString()}</Text>
    },
    {
      title: 'موجودی جدید',
      dataIndex: 'newStock',
      key: 'newStock',
      width: 110,
      align: 'center' as const,
      render: (value: number) => <Text strong>{value.toLocaleString()}</Text>
    },
    {
      title: 'علت',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      render: (reason: string) => (
        <Text type="secondary">{reason || '-'}</Text>
      )
    },
    {
      title: 'کاربر',
      dataIndex: 'user',
      key: 'user',
      width: 120,
      render: (user: string) => <Text>{user}</Text>
    }
  ];

  // مدیریت فرم‌ها
  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      ...item,
      categoryId: item.categoryId,
      expiryDate: item.expiryDate ? moment(item.expiryDate).format('YYYY/MM/DD') : null
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    modal.confirm({
      title: 'آیا از حذف این آیتم مطمئن هستید؟',
      icon: <ExclamationCircleOutlined />,
      content: 'این عمل قابل بازگشت نیست.',
      okText: 'بله، حذف کن',
      cancelText: 'انصراف',
      onOk: async () => {
        try {
          await deleteItem(id);
          message.success('آیتم با موفقیت حذف شد');
        } catch (error) {
          message.error('خطا در حذف آیتم');
        }
      }
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      console.log('🚀 Form submission started');
      console.log('📝 Form values:', values);
      
      const formData = {
        ...values,
        expiryDate: values.expiryDate ? 
          (typeof values.expiryDate === 'string' ? values.expiryDate : values.expiryDate.format('YYYY/MM/DD')) 
          : null
      };
      console.log('📦 Processed form data:', formData);

      if (editingItem) {
        console.log('✏️ Updating item:', editingItem.id);
        const result = await updateItem(editingItem.id, formData);
        if (result) {
          message.success('آیتم با موفقیت به‌روزرسانی شد');
        } else {
          throw new Error('Failed to update item');
        }
      } else {
        console.log('➕ Creating new item...');
        const result = await createItem(formData);
        console.log('📦 Create result:', result);
        
        if (result) {
          message.success('آیتم جدید با موفقیت ایجاد شد');
        } else {
          throw new Error('Failed to create item');
        }
      }
      
      setModalVisible(false);
      setEditingItem(null);
      form.resetFields();
      console.log('✅ Form submission completed');
    } catch (error) {
      console.error('❌ Error saving item:', error);
      message.error(`خطا در ذخیره آیتم: ${error.message || error}`);
    }
  };

  const handleAddCategory = async (values: any) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
        message.success('دسته‌بندی با موفقیت بروزرسانی شد');
      } else {
        await createCategory(values);
        message.success('دسته‌بندی جدید ایجاد شد');
      }
      setCategoryModalVisible(false);
      setEditingCategory(null);
      categoryForm.resetFields();
      fetchItems(); // تازه‌سازی لیست items و categories
    } catch (error) {
      message.error(editingCategory ? 'خطا در بروزرسانی دسته‌بندی' : 'خطا در ایجاد دسته‌بندی');
    }
  };

  // ویرایش دسته‌بندی
  const handleEditCategory = (category: InventoryCategory) => {
    categoryForm.setFieldsValue({
      name: category.name,
      description: category.description
    });
    setEditingCategory(category);
    setCategoryModalVisible(true);
  };

  // حذف دسته‌بندی
  const handleDeleteCategory = (categoryId: string) => {
    modal.confirm({
      title: 'حذف دسته‌بندی',
      content: 'آیا از حذف این دسته‌بندی اطمینان دارید؟',
      okText: 'حذف',
      cancelText: 'انصراف',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteCategory(categoryId);
          message.success('دسته‌بندی با موفقیت حذف شد');
          fetchItems();
        } catch (error) {
          message.error('خطا در حذف دسته‌بندی');
        }
      }
    });
  };

  // پاک کردن فیلترها
  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedStatus('');
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* هدر آمار */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="کل آیتم‌ها"
              value={categorizeItems.all.length}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="آیتم‌های منقضی شده"
              value={categorizeItems.expired.length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="در حال انقضا"
              value={categorizeItems.expiringSoon.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="کمبود موجودی"
              value={categorizeItems.lowStock.length}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* هشدارها */}
      {(categorizeItems.expired.length > 0 || categorizeItems.lowStock.length > 0) && (
        <Alert
          message="هشدار انبار"
          description={
            <div>
              {categorizeItems.expired.length > 0 && (
                <div>🔴 {categorizeItems.expired.length} آیتم منقضی شده دارید</div>
              )}
              {categorizeItems.lowStock.length > 0 && (
                <div>🟡 {categorizeItems.lowStock.length} آیتم کمبود موجودی دارند</div>
              )}
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Card>
        {/* بخش جستجو و فیلتر */}
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Search
                placeholder="جستجوی آیتم..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
                allowClear
              />
            </Col>
            <Col xs={12} md={4}>
              <Select
                placeholder="دسته‌بندی"
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%' }}
                allowClear
              >
                {categories.map(cat => (
                  <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} md={4}>
              <Select
                placeholder="وضعیت"
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="IN_STOCK">موجود</Option>
                <Option value="LOW_STOCK">کمبود موجودی</Option>
                <Option value="OUT_OF_STOCK">تمام شده</Option>
                <Option value="EXPIRED">منقضی شده</Option>
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={clearFilters}
                  size="small"
                >
                  پاک کردن فیلتر
                </Button>
                {activeTab === 'movements' ? (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setMovementModalVisible(true);
                      movementForm.resetFields();
                    }}
                    size="small"
                  >
                    حرکت جدید
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingItem(null);
                      setModalVisible(true);
                      setTimeout(() => form.resetFields(), 100); // Reset after modal opens
                    }}
                    size="small"
                  >
                    آیتم جدید
                  </Button>
                )}
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => setCategoryModalVisible(true)}
                  size="small"
                >
                  انبار جدید
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    fetchItems();
                    fetchCategories();
                    fetchStats();
                  }}
                  size="small"
                >
                  بروزرسانی
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* تب‌های دسته‌بندی */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: '16px' }}
          items={[
            {
              key: 'all',
              label: (
                <Badge count={categorizeItems.all.length} overflowCount={999}>
                  <span>همه آیتم‌ها</span>
                </Badge>
              )
            },
            {
              key: 'categories',
              label: (
                <Badge count={categories.length} overflowCount={999}>
                  <span>دسته‌بندی‌ها</span>
                </Badge>
              )
            },
            {
              key: 'expired',
              label: (
                <Badge count={categorizeItems.expired.length} overflowCount={999}>
                  <span style={{ color: categorizeItems.expired.length > 0 ? '#ff4d4f' : undefined }}>
                    منقضی شده
                  </span>
                </Badge>
              )
            },
            {
              key: 'expiringSoon',
              label: (
                <Badge count={categorizeItems.expiringSoon.length} overflowCount={999}>
                  <span style={{ color: categorizeItems.expiringSoon.length > 0 ? '#fa8c16' : undefined }}>
                    در حال انقضا
                  </span>
                </Badge>
              )
            },
            {
              key: 'lowStock',
              label: (
                <Badge count={categorizeItems.lowStock.length} overflowCount={999}>
                  <span style={{ color: categorizeItems.lowStock.length > 0 ? '#faad14' : undefined }}>
                    کمبود موجودی
                  </span>
                </Badge>
              )
            },
            {
              key: 'movements',
              label: (
                <Badge count={movements.length} overflowCount={999}>
                  <span>گردش انبار</span>
                </Badge>
              )
            }
          ]}
        />

        {/* محتوای تب‌ها */}
        {activeTab === 'movements' ? (
          // نمایش گردش انبار
          <ProTable
            columns={movementColumns}
            dataSource={filteredMovements}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `نمایش ${range[0]} تا ${range[1]} از ${total} حرکت`,
              pageSizeOptions: ['10', '15', '20', '50']
            }}
            scroll={{ x: 1000, y: 350 }}
            size="small"
            search={false}
            toolBarRender={false}
            rowClassName="compact-row"
            style={{ 
              fontSize: '12px',
              lineHeight: '1.2'
            }}
          />
        ) : activeTab === 'categories' ? (
          // نمایش دسته‌بندی‌ها
          <div>
            <Row gutter={[16, 16]}>
              {categories.map(category => (
                <Col key={category.id} xs={24} sm={12} md={8} lg={6}>
                  <Card 
                    size="small"
                    style={{ 
                      borderLeft: `4px solid #1890ff`,
                      height: '120px'
                    }}
                    actions={[
                      <EditOutlined 
                        key="edit" 
                        onClick={() => handleEditCategory(category)}
                        style={{ color: '#1890ff' }}
                      />,
                      <DeleteOutlined 
                        key="delete" 
                        onClick={() => handleDeleteCategory(category.id)}
                        style={{ color: '#ff4d4f' }}
                      />
                    ]}
                  >
                    <div style={{ height: '60px', overflow: 'hidden' }}>
                      <Title level={5} style={{ margin: 0, fontSize: '14px' }}>
                        {category.name}
                      </Title>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {category.description}
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  size="small"
                  style={{ 
                    height: '120px',
                    border: '2px dashed #d9d9d9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  styles={{ 
                    body: {
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%'
                    }
                  }}
                  onClick={() => setCategoryModalVisible(true)}
                >
                  <div style={{ textAlign: 'center' }}>
                    <PlusOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                    <div style={{ marginTop: '8px', color: '#1890ff' }}>
                      دسته‌بندی جدید
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        ) : (
          // نمایش آیتم‌ها
          <ProTable
            columns={columns}
            dataSource={filteredItems}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `نمایش ${range[0]} تا ${range[1]} از ${total} آیتم`,
              pageSizeOptions: ['10', '15', '20', '50']
            }}
            scroll={{ x: 1200, y: 350 }}
            size="small"
            search={false}
            toolBarRender={false}
            rowClassName="compact-row"
            style={{ 
              fontSize: '12px',
              lineHeight: '1.2'
            }}
            components={{
              table: (props: any) => (
                <table {...props} style={{ ...props.style, borderSpacing: 0 }} />
              )
            }}
          />
        )}
      </Card>

      {/* مودال افزودن/ویرایش آیتم */}
      <Modal
        title={editingItem ? 'ویرایش آیتم' : 'افزودن آیتم جدید'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingItem(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '16px' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="نام محصول"
                rules={[{ required: true, message: 'نام محصول الزامی است' }]}
              >
                <Input placeholder="نام محصول را وارد کنید" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sku"
                label="کد محصول (SKU)"
                rules={[{ required: true, message: 'کد محصول الزامی است' }]}
              >
                <Input placeholder="کد محصول را وارد کنید" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="دسته‌بندی"
                rules={[{ required: true, message: 'دسته‌بندی الزامی است' }]}
              >
                <Select placeholder="دسته‌بندی را انتخاب کنید">
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="واحد"
                rules={[{ required: true, message: 'واحد الزامی است' }]}
              >
                <Select placeholder="واحد را انتخاب کنید">
                  <Option value="kg">کیلوگرم</Option>
                  <Option value="g">گرم</Option>
                  <Option value="l">لیتر</Option>
                  <Option value="ml">میلی‌لیتر</Option>
                  <Option value="piece">عدد</Option>
                  <Option value="box">جعبه</Option>
                  <Option value="pack">بسته</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="currentStock"
                label="موجودی فعلی"
                rules={[{ required: true, message: 'موجودی فعلی الزامی است' }]}
              >
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="minStock"
                label="حداقل موجودی"
                rules={[{ required: true, message: 'حداقل موجودی الزامی است' }]}
              >
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="قیمت واحد (تومان)"
              >
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="supplier"
                label="تامین‌کننده"
              >
                <Input placeholder="نام تامین‌کننده" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="تاریخ انقضا"
              >
                <PersianCalendar
                  className="w-full"
                  showAsInput={true}
                  value={form.getFieldValue('expiryDate')}
                  onChange={(date: string) => {
                    console.log('Expiry date selected:', date);
                    if (date && date !== 'Invalid date') {
                      form.setFieldsValue({ expiryDate: date });
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="توضیحات"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="توضیحات اضافی در مورد محصول" 
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button 
                onClick={() => {
                  setModalVisible(false);
                  setEditingItem(null);
                  form.resetFields();
                }}
              >
                انصراف
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingItem ? 'به‌روزرسانی' : 'ایجاد'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* مودال افزودن دسته‌بندی */}
      <Modal
        title={editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
        open={categoryModalVisible}
        onCancel={() => {
          setCategoryModalVisible(false);
          setEditingCategory(null);
          categoryForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleAddCategory}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="name"
            label="نام دسته‌بندی"
            rules={[{ required: true, message: 'نام دسته‌بندی الزامی است' }]}
          >
            <Input placeholder="نام دسته‌بندی را وارد کنید" />
          </Form.Item>

          <Form.Item
            name="description"
            label="توضیحات"
          >
            <Input.TextArea rows={3} placeholder="توضیحات دسته‌بندی" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button 
                onClick={() => {
                  setCategoryModalVisible(false);
                  categoryForm.resetFields();
                }}
              >
                انصراف
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                ایجاد دسته‌بندی
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* مودال افزودن حرکت انبار */}
      <Modal
        title="افزودن حرکت جدید انبار"
        open={movementModalVisible}
        onCancel={() => {
          setMovementModalVisible(false);
          movementForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={movementForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              console.log('🚀 Movement form submission:', values);
              
              const movementData = {
                itemId: values.itemId,
                type: values.type,
                quantity: Number(values.quantity),
                reason: values.reason || '',
                reference: values.reference || '',
                batchNumber: values.batchNumber || '',
                expiryDate: values.expiryDate ? values.expiryDate.format('YYYY/MM/DD') : undefined,
                supplier: values.supplier || '',
                notes: values.notes || ''
              };

              await createMovement(movementData);
              message.success('حرکت انبار با موفقیت ثبت شد');
              setMovementModalVisible(false);
              movementForm.resetFields();
              fetchItems(); // بروزرسانی موجودی
            } catch (error) {
              console.error('❌ Movement creation error:', error);
              message.error('خطا در ثبت حرکت انبار');
            }
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="itemId"
                label="محصول"
                rules={[{ required: true, message: 'انتخاب محصول الزامی است' }]}
              >
                <Select
                  placeholder="انتخاب محصول"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {items.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.name} ({item.sku}) - موجودی: {item.currentStock.toLocaleString()}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="نوع حرکت"
                rules={[{ required: true, message: 'انتخاب نوع حرکت الزامی است' }]}
              >
                <Select placeholder="انتخاب نوع حرکت">
                  <Option value="IN">ورود</Option>
                  <Option value="OUT">خروج</Option>
                  <Option value="ADJUSTMENT">تعدیل</Option>
                  <Option value="TRANSFER">انتقال</Option>
                  <Option value="RETURN">برگشت</Option>
                  <Option value="WASTE">ضایعات</Option>
                  <Option value="EXPIRED">منقضی</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="مقدار"
                rules={[
                  { required: true, message: 'مقدار الزامی است' },
                  { type: 'number', min: 0.01, message: 'مقدار باید مثبت باشد' }
                ]}
              >
                <InputNumber
                  placeholder="مقدار"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reason"
                label="علت"
              >
                <Input placeholder="علت حرکت" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reference"
                label="مرجع"
              >
                <Input placeholder="شماره فاکتور، سفارش و..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="batchNumber"
                label="شماره بچ"
              >
                <Input placeholder="شماره بچ/سری" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="تاریخ انقضا"
              >
                <PersianCalendar
                  placeholder="انتخاب تاریخ انقضا"
                  showAsInput
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supplier"
                label="تامین کننده"
              >
                <Input placeholder="نام تامین کننده" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="یادداشت"
          >
            <Input.TextArea 
              placeholder="یادداشت اضافی..."
              rows={3}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button 
                onClick={() => {
                  setMovementModalVisible(false);
                  movementForm.resetFields();
                }}
              >
                انصراف
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
              >
                ثبت حرکت
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
