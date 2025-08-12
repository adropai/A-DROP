'use client';

import React, { useState, useRef } from 'react';
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
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { MenuItem, Category, ApiResponse } from '../../types/index';
import MenuItemForm from '../../components/menu/MenuItemForm';
import CategoryForm from '../../components/menu/CategoryForm';

const MenuPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [itemFormVisible, setItemFormVisible] = useState(false);
  const [categoryFormVisible, setCategoryFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const actionRef = useRef<ActionType>();

  // تابع پاک‌سازی URL تصاویر
  const cleanImageUrl = (imageString: string): string[] => {
    if (!imageString || imageString.trim() === '' || imageString === '[]') {
      return [];
    }
    
    try {
      // حذف escape characters اضافی
      let cleanedString = imageString;
      
      // اگر با quote شروع می‌شود، آن را حذف کنیم
      if (cleanedString.startsWith('"') && cleanedString.endsWith('"')) {
        cleanedString = cleanedString.slice(1, -1);
      }
      
      // حذف escape characters
      cleanedString = cleanedString.replace(/\\"/g, '"').replace(/\\\//g, '/');
      
      // اگر JSON array است
      if (cleanedString.startsWith('[') && cleanedString.endsWith(']')) {
        const parsed = JSON.parse(cleanedString);
        if (Array.isArray(parsed)) {
          return parsed.filter(url => 
            typeof url === 'string' && 
            url.trim() !== '' && 
            url.startsWith('/uploads/') // فقط فایل‌های آپلود شده
          );
        }
      }
      
      // اگر یک URL ساده است و معتبر است
      if (cleanedString.startsWith('/uploads/')) {
        return [cleanedString];
      }
      
      return [];
    } catch (error) {
      console.warn('Image URL parse error:', error);
      return [];
    }
  };

  // دریافت آمار کلی منو
  const [menuStats, setMenuStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    availableItems: 0,
    specialItems: 0
  });

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
    }
  };

  // دریافت لیست دسته‌بندی‌ها برای فیلتر
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/menu/categories?limit=100');
      const result = await response.json();
      console.log('📂 Categories response:', result);
      
      if (result.success && result.categories) {
        setCategories(result.categories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Categories fetch error:', error);
      message.error('خطا در دریافت دسته‌بندی‌ها');
      setCategories([]);
    }
  };

  // دریافت آیتم‌های منو
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
      const result: ApiResponse<MenuItem[]> = await response.json();
      
      if (result.success) {
        return {
          data: result.data,
          success: true,
          total: (result as any).pagination?.total || 0
        };
      } else {
        message.error(result.message || 'خطا در دریافت آیتم‌های منو');
        return { data: [], success: false, total: 0 };
      }
    } catch (error) {
      message.error('خطا در ارتباط با سرور');
      return { data: [], success: false, total: 0 };
    } finally {
      setLoading(false);
    }
  };

  // حذف آیتم منو
  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/menu/items/${id}`, {
        method: 'DELETE'
      });
      const result: ApiResponse = await response.json();

      if (result.success) {
        message.success('آیتم منو با موفقیت حذف شد');
        refreshData(); // بروزرسانی داده‌ها و آمار
      } else {
        message.error(result.message || 'خطا در حذف آیتم منو');
      }
    } catch (error) {
      message.error('خطا در حذف آیتم منو');
    }
  };

  // حذف دسته‌بندی
  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/menu/categories/${id}`, {
        method: 'DELETE'
      });
      const result: ApiResponse = await response.json();

      if (result.success) {
        message.success('دسته‌بندی با موفقیت حذف شد');
        refreshData(); // بروزرسانی داده‌ها و آمار
      } else {
        message.error(result.message || 'خطا در حذف دسته‌بندی');
      }
    } catch (error) {
      message.error('خطا در حذف دسته‌بندی');
    }
  };

  // تعریف ستون‌های جدول آیتم‌های منو
  const menuItemColumns: ProColumns<MenuItem>[] = [
    {
      title: 'تصویر',
      dataIndex: 'images',
      key: 'images',
      width: 120,
      render: (dom: any, record: MenuItem) => {
        const images = cleanImageUrl(record.images || '');
        const imageUrl = images.length > 0 ? images[0] : '/placeholder-food.svg';
        
        return (
          <Image
            width={80}
            height={60}
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
      render: (dom: any, record: MenuItem) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          {record.nameEn && (
            <div style={{ fontSize: '12px', color: '#666' }}>{record.nameEn}</div>
          )}
        </div>
      )
    },
    {
      title: 'دسته‌بندی',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (dom: any, record: MenuItem) => (
        <Tag color="blue">{record.category?.name}</Tag>
      ),
      search: false
    },
    {
      title: 'قیمت',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (dom: any, record: MenuItem) => (
        <div>
          <div style={{ 
            textDecoration: record.discountPrice ? 'line-through' : 'none',
            color: record.discountPrice ? '#999' : '#000'
          }}>
            {record.price?.toLocaleString()} تومان
          </div>
          {record.discountPrice && (
            <div style={{ color: '#f5222d', fontWeight: 'bold' }}>
              {record.discountPrice.toLocaleString()} تومان
            </div>
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
          <ClockCircleOutlined />
          {record.preparationTime} دقیقه
        </Space>
      ),
      search: false
    },
    {
      title: 'مواد اولیه',
      dataIndex: 'ingredients',
      key: 'ingredients',
      width: 200,
      render: (dom: any, record: MenuItem) => {
        try {
          const ingredients = JSON.parse(record.ingredients || '[]');
          if (!Array.isArray(ingredients) || ingredients.length === 0) {
            return <span style={{ color: '#999' }}>-</span>;
          }
          
          // Filter out invalid ingredients
          const validIngredients = ingredients.filter((ingredient: any) => 
            ingredient && typeof ingredient === 'string' && ingredient.trim().length > 0
          );
          
          if (validIngredients.length === 0) {
            return <span style={{ color: '#999' }}>-</span>;
          }
          
          return (
            <div style={{ maxWidth: 180 }}>
              {validIngredients.slice(0, 3).map((ingredient: string, index: number) => {
                const ingredientStr = String(ingredient || '').trim();
                if (!ingredientStr) return null;
                
                return (
                  <Tag key={`ingredient-${index}-${ingredientStr}`} color="green" style={{ marginBottom: 2 }}>
                    {ingredientStr}
                  </Tag>
                );
              }).filter(Boolean)}
              {validIngredients.length > 3 && (
                <Tooltip title={validIngredients.slice(3).map(String).join(', ')}>
                  <Tag color="default">+{validIngredients.length - 3}</Tag>
                </Tooltip>
              )}
            </div>
          );
        } catch (error) {
          return <span style={{ color: '#999' }}>-</span>;
        }
      },
      search: false
    },
    {
      title: 'برچسب‌ها',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (dom: any, record: MenuItem) => {
        try {
          const tags = JSON.parse(record.tags || '[]');
          if (!Array.isArray(tags) || tags.length === 0) {
            return <span style={{ color: '#999' }}>-</span>;
          }
          
          // Filter out invalid tags
          const validTags = tags.filter((tag: any) => 
            tag && typeof tag === 'string' && tag.trim().length > 0
          );
          
          if (validTags.length === 0) {
            return <span style={{ color: '#999' }}>-</span>;
          }
          
          return (
            <div style={{ maxWidth: 180 }}>
              {validTags.slice(0, 3).map((tag: string, index: number) => {
                const tagStr = String(tag || '').trim();
                if (!tagStr) return null;
                
                return (
                  <Tag key={`tag-${index}-${tagStr}`} color="purple" style={{ marginBottom: 2 }}>
                    {tagStr}
                  </Tag>
                );
              }).filter(Boolean)}
              {validTags.length > 3 && (
                <Tooltip title={validTags.slice(3).map(String).join(', ')}>
                  <Tag color="default">+{validTags.length - 3}</Tag>
                </Tooltip>
              )}
            </div>
          );
        } catch (error) {
          return <span style={{ color: '#999' }}>-</span>;
        }
      },
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
      width: 120,
      render: (_, record: MenuItem) => (
        <Space direction="vertical" size={2}>
          <div style={{ fontSize: '12px' }}>
            <StarOutlined style={{ color: '#faad14' }} /> {record.rating || 0}
          </div>
          <div style={{ fontSize: '12px' }}>
            <ShoppingCartOutlined style={{ color: '#52c41a' }} /> {record.soldCount || 0}
          </div>
        </Space>
      ),
      search: false
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 150,
      render: (_, record: MenuItem) => (
        <Space>
          <Tooltip title="مشاهده">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                // باز کردن مودال مشاهده جزئیات
              }}
            />
          </Tooltip>
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

  React.useEffect(() => {
    fetchCategories();
    fetchMenuStats(); // بارگیری آمار منو
  }, []);

  // بروزرسانی آمار بعد از تغییرات
  const refreshData = () => {
    actionRef.current?.reload();
    fetchCategories();
    fetchMenuStats();
  };

  return (
    <PageContainer
      title="مدیریت منو"
      subTitle="مدیریت آیتم‌های منو و دسته‌بندی‌ها"
      extra={[
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
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="کل آیتم‌ها"
              value={menuStats.totalItems}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="دسته‌بندی‌ها"
              value={menuStats.totalCategories}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="آیتم‌های موجود"
              value={menuStats.availableItems}
              suffix={`از ${menuStats.totalItems}`}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="آیتم‌های ویژه"
              value={menuStats.specialItems}
              suffix={`از ${menuStats.totalItems}`}
              valueStyle={{ color: '#cf1322' }}
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* مدیریت دسته‌بندی‌ها */}
      <Card title="مدیریت دسته‌بندی‌ها" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          {categories && categories.length > 0 ? categories.map(category => (
            <Col span={6} key={category.id}>
              <Card
                size="small"
                title={category.name}
                extra={
                  <Space>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryFormVisible(true);
                      }}
                    />
                    <Popconfirm
                      title="حذف دسته‌بندی"
                      description="آیا از حذف این دسته‌بندی اطمینان دارید؟"
                      onConfirm={() => handleDeleteCategory(category.id)}
                      okText="بله"
                      cancelText="خیر"
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  </Space>
                }
              >
                <p>{category.description || 'بدون توضیح'}</p>
              </Card>
            </Col>
          )) : (
            <Col span={24}>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>هیچ دسته‌بندی‌ای موجود نیست</p>
              </div>
            </Col>
          )}
        </Row>
      </Card>

      {/* فیلترهای اضافی */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Select
              placeholder="انتخاب دسته‌بندی"
              style={{ width: '100%' }}
              allowClear
              value={selectedCategory || undefined}
              onChange={(value) => {
                setSelectedCategory(value || '');
                actionRef.current?.reload();
              }}
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
          resetText: 'پاک کردن',
          span: 6  // تنظیم span برای حل مشکل className mismatch
        }}
        toolBarRender={() => [
          <Button
            key="refresh"
            onClick={refreshData} // استفاده از تابع جدید
          >
            بروزرسانی
          </Button>
        ]}
        loading={loading}
        locale={{
          emptyText: 'آیتم منویی یافت نشد'
        }}
        options={{
          reload: false, // غیرفعال کردن دکمه reload اضافی
        }}
      />

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
          refreshData(); // بروزرسانی آمار بعد از افزودن/ویرایش آیتم
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
          refreshData(); // بروزرسانی آمار بعد از افزودن/ویرایش دسته‌بندی
        }}
      />
    </PageContainer>
  );
};

export default MenuPage;
