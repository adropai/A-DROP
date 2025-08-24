'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PageContainer, ProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { 
  Button, 
  Space, 
  Tag, 
  Image, 
  Tooltip, 
  message, 
  Popconfirm, 
  Select,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Divider,
  Alert,
  Badge,
  Tabs
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { MenuItem, Category, ApiResponse } from '../../types/index';
import MenuItemForm from '../../components/menu/MenuItemForm';
import CategoryForm from '../../components/menu/CategoryForm';

const { Text, Title } = Typography;

const MenuPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [itemFormVisible, setItemFormVisible] = useState(false);
  const [categoryFormVisible, setCategoryFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState('items');
  const actionRef = useRef<ActionType>();

  // آمار کلی منو
  const [menuStats, setMenuStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    availableItems: 0,
    specialItems: 0
  });

  // تابع پاک‌سازی URL تصاویر
  const cleanImageUrl = (imageString: string): string[] => {
    if (!imageString || imageString.trim() === '' || imageString === '[]') {
      return [];
    }
    
    try {
      let cleanedString = imageString;
      
      if (cleanedString.startsWith('"') && cleanedString.endsWith('"')) {
        cleanedString = cleanedString.slice(1, -1);
      }
      
      cleanedString = cleanedString.replace(/\\"/g, '"').replace(/\\\//g, '/');
      
      if (cleanedString.startsWith('[') && cleanedString.endsWith(']')) {
        const parsed = JSON.parse(cleanedString);
        if (Array.isArray(parsed)) {
          return parsed.filter(url => 
            typeof url === 'string' && 
            url.trim() !== '' && 
            url.startsWith('/uploads/')
          );
        }
      }
      
      if (cleanedString.startsWith('/uploads/')) {
        return [cleanedString];
      }
      
      return [];
    } catch (error) {
      console.warn('Image URL parse error:', error);
      return [];
    }
  };

  // دریافت آیتم‌های منو از API
  const fetchMenuItems = async (params: any) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: params.current?.toString() || '1',
        limit: params.pageSize?.toString() || '10',
        ...(params.search && { search: params.search }),
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(params.isAvailable !== undefined && { isAvailable: params.isAvailable }),
        ...(params.isSpecial !== undefined && { isSpecial: params.isSpecial }),
        sortBy: params.sortField || 'priority',
        sortOrder: params.sortOrder === 'descend' ? 'desc' : 'asc'
      });

      const response = await fetch(`/api/menu/items?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        return {
          data: result.data || result.items || [],
          success: true,
          total: result.pagination?.total || result.total || 0
        };
      } else {
        message.error(result.message || 'خطا در دریافت آیتم‌های منو');
        return { data: [], success: false, total: 0 };
      }
    } catch (error) {
      message.error('خطا در ارتباط با سرور');
      console.error('Menu items fetch error:', error);
      return { data: [], success: false, total: 0 };
    } finally {
      setLoading(false);
    }
  };

  // دریافت آمار منو از API
  const fetchMenuStats = async () => {
    try {
      const response = await fetch('/api/menu/stats');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setMenuStats(result.data);
      } else {
        message.error('خطا در دریافت آمار منو: ' + result.message);
      }
    } catch (error) {
      message.error('خطا در دریافت آمار منو');
      console.error('Menu stats fetch error:', error);
    }
  };

  // دریافت لیست دسته‌بندی‌ها
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('/api/menu/categories?limit=100');
      const result = await response.json();
      
      if (result.success && result.categories) {
        setCategories(result.categories);
      } else {
        setCategories([]);
        console.log('No categories found:', result);
      }
    } catch (error) {
      console.error('Categories fetch error:', error);
      message.error('خطا در دریافت دسته‌بندی‌ها');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // تابع برای ایجاد ساختار درختی دسته‌بندی‌ها
  const buildCategoryTree = (categories: Category[]): Category[] => {
    const rootCategories = categories.filter(cat => !cat.parentId);
    
    const buildChildren = (parentId: string): Category[] => {
      return categories
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat,
          children: buildChildren(cat.id)
        }));
    };

    return rootCategories.map(cat => ({
      ...cat,
      children: buildChildren(cat.id)
    }));
  };

  // حذف آیتم منو
  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/menu/items/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        message.success('آیتم منو با موفقیت حذف شد');
        refreshData();
      } else {
        message.error(result.message || 'خطا در حذف آیتم منو');
      }
    } catch (error) {
      message.error('خطا در حذف آیتم منو');
      console.error('Delete item error:', error);
    }
  };

  // حذف دسته‌بندی
  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/menu/categories/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        message.success('دسته‌بندی با موفقیت حذف شد');
        refreshData();
      } else {
        message.error(result.message || 'خطا در حذف دسته‌بندی');
      }
    } catch (error) {
      message.error('خطا در حذف دسته‌بندی');
      console.error('Delete category error:', error);
    }
  };

  // بروزرسانی داده‌ها
  const refreshData = () => {
    actionRef.current?.reload();
    fetchCategories();
    fetchMenuStats();
  };

  // تعریف ستون‌های جدول آیتم‌های منو
  const menuItemColumns: ProColumns<MenuItem>[] = [
    {
      title: 'تصویر',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (dom: any, record: MenuItem) => {
        const images = cleanImageUrl(record.images || '');
        const imageUrl = images.length > 0 ? images[0] : '/placeholder-food.svg';
        
        return (
          <Image
            width={70}
            height={50}
            src={imageUrl}
            alt={record.name || "تصویر آیتم"}
            style={{ borderRadius: 6, objectFit: 'cover' }}
            fallback="/placeholder-food.svg"
          />
        );
      },
      search: false
    },
    {
      title: 'نام آیتم',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (dom: any, record: MenuItem) => (
        <div>
          <Text strong style={{ display: 'block' }}>{record.name}</Text>
          {record.nameEn && (
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.nameEn}</Text>
          )}
        </div>
      )
    },
    {
      title: 'دسته‌بندی',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 120,
      render: (dom: any, record: MenuItem) => (
        <Tag color="blue">{record.category?.name || 'نامشخص'}</Tag>
      ),
      search: false
    },
    {
      title: 'قیمت',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      render: (dom: any, record: MenuItem) => (
        <div>
          <Text style={{ 
            textDecoration: record.discountPrice ? 'line-through' : 'none',
            color: record.discountPrice ? '#999' : '#000',
            display: 'block'
          }}>
            {record.price?.toLocaleString()} تومان
          </Text>
          {record.discountPrice && (
            <Text style={{ color: '#f5222d', fontWeight: 'bold' }}>
              {record.discountPrice.toLocaleString()} تومان
            </Text>
          )}
        </div>
      ),
      search: false,
      sorter: true
    },
    {
      title: 'زمان آماده‌سازی',
      dataIndex: 'preparationTime',
      key: 'preparationTime',
      width: 120,
      render: (dom: any, record: MenuItem) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#1890ff' }} />
          <Text>{record.preparationTime} دقیقه</Text>
        </Space>
      ),
      search: false
    },
    {
      title: 'وضعیت',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      width: 100,
      render: (dom: any, record: MenuItem) => (
        <Space direction="vertical" size={2}>
          <Tag color={record.isAvailable ? 'green' : 'red'}>
            {record.isAvailable ? 'موجود' : 'ناموجود'}
          </Tag>
          {record.isSpecial && (
            <Tag color="gold" icon={<StarOutlined />}>
              ویژه
            </Tag>
          )}
        </Space>
      ),
      valueType: 'select',
      valueEnum: {
        true: { text: 'موجود', status: 'Success' },
        false: { text: 'ناموجود', status: 'Error' }
      }
    },
    {
      title: 'آمار',
      key: 'stats',
      width: 100,
      render: (_, record: MenuItem) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: '12px' }}>
            <StarOutlined style={{ color: '#faad14' }} /> {record.rating || 0}
          </Text>
          <Text style={{ fontSize: '12px' }}>
            <ShoppingCartOutlined style={{ color: '#52c41a' }} /> {record.soldCount || 0}
          </Text>
        </Space>
      ),
      search: false
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 120,
      render: (_, record: MenuItem) => (
        <Space>
          <Tooltip title="ویرایش">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingItem(record);
                setItemFormVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="حذف آیتم منو"
            description="آیا از حذف این آیتم اطمینان دارید؟"
            onConfirm={() => handleDeleteItem(record.id)}
            okText="بله"
            cancelText="خیر"
            okType="danger"
          >
            <Tooltip title="حذف">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
      search: false
    }
  ];

  // useEffect برای بارگیری اولیه داده‌ها
  useEffect(() => {
    fetchMenuStats();
    fetchCategories();
  }, []);

  return (
    <PageContainer
      title="مدیریت منو"
      subTitle="مدیریت آیتم‌های منو و دسته‌بندی‌ها"
      extra={[
        <Button
          key="refresh"
          icon={<ReloadOutlined />}
          onClick={refreshData}
          loading={loading || categoriesLoading}
        >
          بروزرسانی
        </Button>,
        <Button
          key="add-category"
          onClick={() => {
            setEditingCategory(null);
            setCategoryFormVisible(true);
          }}
        >
          افزودن دسته‌بندی
        </Button>,
        <Button
          key="add-item"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            setItemFormVisible(true);
          }}
        >
          افزودن آیتم جدید
        </Button>
      ]}
    >
      {/* آمار کلی منو */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کل آیتم‌ها"
              value={menuStats.totalItems}
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="دسته‌بندی‌ها"
              value={menuStats.totalCategories}
              prefix={<AppstoreOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="آیتم‌های موجود"
              value={menuStats.availableItems}
              suffix={`از ${menuStats.totalItems}`}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ShoppingCartOutlined style={{ color: '#3f8600' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="آیتم‌های ویژه"
              value={menuStats.specialItems}
              suffix={`از ${menuStats.totalItems}`}
              valueStyle={{ color: '#cf1322' }}
              prefix={<StarOutlined style={{ color: '#cf1322' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* تب‌های اصلی */}
      <Card style={{ marginBottom: 16 }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          size="large"
          items={[
            {
              key: 'items',
              label: (
                <span>
                  <UnorderedListOutlined />
                  آیتم‌های منو
                </span>
              ),
              children: (
                <>
                  {/* فیلترهای آیتم‌های منو */}
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                      <Col xs={24} sm={12} md={8}>
                        <Select
                          placeholder="انتخاب دسته‌بندی"
                          style={{ width: '100%' }}
                          allowClear
                          value={selectedCategory || undefined}
                          onChange={(value) => {
                            setSelectedCategory(value || '');
                            actionRef.current?.reload();
                          }}
                          showSearch
                          filterOption={(input, option) =>
                            String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                        >
                          {categories.map(category => (
                            <Select.Option key={category.id} value={category.id}>
                              {category.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Col>
                    </Row>
                  </Card>

                  {/* جدول آیتم‌های منو */}
                  <ProTable<MenuItem>
                    actionRef={actionRef}
                    columns={menuItemColumns}
                    request={fetchMenuItems}
                    rowKey="id"
                    pagination={{
                      defaultPageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} از ${total} آیتم`
                    }}
                    search={{
                      labelWidth: 'auto',
                      searchText: 'جستجو',
                      resetText: 'پاک کردن'
                    }}
                    loading={loading}
                    locale={{
                      emptyText: 'آیتم منویی یافت نشد'
                    }}
                    options={{
                      reload: false
                    }}
                    scroll={{ x: 'max-content' }}
                  />
                </>
              )
            },
            {
              key: 'categories',
              label: (
                <span>
                  <AppstoreOutlined />
                  دسته‌بندی‌ها
                  <Badge count={categories.length} style={{ marginLeft: 8 }} />
                </span>
              ),
              children: (
                <div style={{ padding: '16px 0' }}>
                  {categories && categories.length > 0 ? (
                    <div>
                      <Alert
                        message="راهنما"
                        description="دسته‌بندی‌های شما به صورت کارت نمایش داده می‌شوند."
                        type="info"
                        showIcon
                        style={{ marginBottom: 24 }}
                      />
                      <Row gutter={[16, 16]}>
                        {buildCategoryTree(categories).map((category) => (
                          <Col xs={24} sm={12} lg={8} xl={6} key={category.id}>
                            <Card
                              hoverable
                              loading={categoriesLoading}
                              style={{
                                border: '2px solid #1890ff20',
                                backgroundColor: '#1890ff05',
                                minHeight: '200px',
                                borderRadius: '12px'
                              }}
                              actions={[
                                <Button
                                  key="edit"
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => {
                                    setEditingCategory(category);
                                    setCategoryFormVisible(true);
                                  }}
                                >
                                  ویرایش
                                </Button>,
                                <Popconfirm
                                  key="delete"
                                  title="آیا از حذف این دسته‌بندی اطمینان دارید؟"
                                  onConfirm={() => handleDeleteCategory(category.id)}
                                  okText="بله"
                                  cancelText="خیر"
                                >
                                  <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                  >
                                    حذف
                                  </Button>
                                </Popconfirm>
                              ]}
                            >
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                                  🍽️
                                </div>
                                <Title level={5} style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
                                  {category.name}
                                </Title>
                                {category.nameEn && (
                                  <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '12px' }}>
                                    {category.nameEn}
                                  </Text>
                                )}
                                
                                <Space size="small" style={{ marginBottom: '12px' }}>
                                  <Tag color="blue">{category.children?.length || 0} زیرمجموعه</Tag>
                                  <Tag color="green">{(category as any)._count?.menuItems || 0} آیتم</Tag>
                                </Space>

                                {category.description && (
                                  <Text type="secondary" style={{ 
                                    fontSize: '12px', 
                                    display: 'block',
                                    marginTop: '8px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {category.description}
                                  </Text>
                                )}
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
                      <Title level={4} type="secondary">هیچ دسته‌بندی‌ای موجود نیست</Title>
                      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
                        برای شروع، اولین دسته‌بندی خود را ایجاد کنید
                      </Text>
                      <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setEditingCategory(null);
                          setCategoryFormVisible(true);
                        }}
                      >
                        ایجاد اولین دسته‌بندی
                      </Button>
                    </div>
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* فرم‌های منو */}
      <MenuItemForm
        visible={itemFormVisible}
        editingItem={editingItem}
        categories={categories}
        onClose={() => {
          setItemFormVisible(false);
          setEditingItem(null);
        }}
        onSuccess={() => {
          setItemFormVisible(false);
          setEditingItem(null);
          refreshData();
        }}
      />

      <CategoryForm
        visible={categoryFormVisible}
        editingCategory={editingCategory}
        categories={categories}
        onClose={() => {
          setCategoryFormVisible(false);
          setEditingCategory(null);
        }}
        onSuccess={() => {
          setCategoryFormVisible(false);
          setEditingCategory(null);
          refreshData();
        }}
      />
    </PageContainer>
  );
};

export default MenuPage;
