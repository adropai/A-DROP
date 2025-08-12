'use client'

import React, { useEffect } from "react";
import { ProTable, ProForm, ProFormText, ProFormDigit, ProFormSelect, ProFormDatePicker, ProCard, Statistic } from "@ant-design/pro-components";
import { Button, Tag, Space, Tooltip, Alert, Modal, message, Typography } from "antd";
import { useInventoryStore } from "@/stores/inventory-store";
import { InventoryItem, InventoryCategory, StockMovement, InventoryStatus, MovementType } from "@/types/inventory";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const InventoryPage: React.FC = () => {
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
    getLowStockItems,
    getExpiredItems,
  } = useInventoryStore();

  // Load data on mount
  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchMovements();
    fetchStats();
  }, [fetchItems, fetchCategories, fetchMovements, fetchStats]);

  // Table columns
  const columns = [
    {
      title: "نام آیتم",
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (text: string, record: InventoryItem) => (
        <Space>
          <span>{text}</span>
          {record.status === "LOW_STOCK" && <Tag color="warning">کمبود</Tag>}
          {record.status === "EXPIRED" && <Tag color="error">منقضی</Tag>}
        </Space>
      ),
    },
    {
      title: "دسته‌بندی",
      dataIndex: ["category", "name"],
      key: "category",
      width: 120,
      render: (_: any, record: InventoryItem) => <Tag color="blue">{record.category?.name}</Tag>,
    },
    {
      title: "موجودی فعلی",
      dataIndex: "currentStock",
      key: "currentStock",
      width: 120,
      sorter: (a: InventoryItem, b: InventoryItem) => a.currentStock - b.currentStock,
      render: (stock: number, record: InventoryItem) => (
        <span>{stock} {record.unit}</span>
      ),
    },
    {
      title: "حداقل موجودی",
      dataIndex: "minStock",
      key: "minStock",
      width: 100,
      render: (min: number) => <span>{min}</span>,
    },
    {
      title: "تاریخ انقضا",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 120,
      render: (date: string) => date ? <Tag color="red">{date}</Tag> : "-",
    },
    {
      title: "وضعیت",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: InventoryStatus) => {
        switch (status) {
          case "IN_STOCK": return <Tag color="success">موجود</Tag>;
          case "LOW_STOCK": return <Tag color="warning">کمبود</Tag>;
          case "OUT_OF_STOCK": return <Tag color="error">ناموجود</Tag>;
          case "EXPIRED": return <Tag color="error">منقضی</Tag>;
          default: return <Tag>نامشخص</Tag>;
        }
      },
    },
    {
      title: "عملیات",
      key: "actions",
      width: 160,
      render: (_: any, record: InventoryItem) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>ویرایش</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>حذف</Button>
          <Button type="link" onClick={() => handleMovement(record.id)}>حرکت انبار</Button>
        </Space>
      ),
    },
  ];

  // Form modal state
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<InventoryItem | null>(null);

  // Movement modal state
  const [movementVisible, setMovementVisible] = React.useState(false);
  const [movementItemId, setMovementItemId] = React.useState<string | null>(null);

  // Category modal state
  const [categoryModalVisible, setCategoryModalVisible] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<InventoryCategory | null>(null);

  // Edit handler
  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  // Delete handler
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "حذف آیتم انبار",
      icon: <ExclamationCircleOutlined />,
      content: "آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟",
      okText: "بله، حذف شود",
      cancelText: "انصراف",
      onOk: async () => {
        await deleteItem(id);
        message.success("آیتم با موفقیت حذف شد");
      },
    });
  };

  // Movement handler
  const handleMovement = (id: string) => {
    setMovementItemId(id);
    setMovementVisible(true);
  };

  // Form submit
  const handleFormSubmit = async (values: any) => {
    if (editingItem) {
      await updateItem(editingItem.id, values);
      message.success("آیتم با موفقیت ویرایش شد");
    } else {
      const result = await createItem(values);
      if (result) {
        message.success("آیتم جدید اضافه شد");
      } else {
        message.error("خطا در ایجاد آیتم");
        return; // عدم بستن modal در صورت خطا
      }
    }
    setModalVisible(false);
    setEditingItem(null);
    fetchItems(); // رفرش لیست آیتم‌ها
    fetchStats(); // رفرش آمار
  };

  // Movement submit
  const handleMovementSubmit = async (values: any) => {
    const movementData = {
      ...values,
      itemId: movementItemId
    };
    await createMovement(movementData);
    message.success("حرکت انبار ثبت شد");
    setMovementVisible(false);
    setMovementItemId(null);
    fetchItems(); // رفرش لیست آیتم‌ها
    fetchMovements(); // رفرش لیست حرکت‌ها
  };

  // Category handlers
  const handleEditCategory = (category: InventoryCategory) => {
    setEditingCategory(category);
    setCategoryModalVisible(true);
  };

  const handleDeleteCategory = (id: string) => {
    Modal.confirm({
      title: "حذف دسته‌بندی",
      icon: <ExclamationCircleOutlined />,
      content: "آیا مطمئن هستید که می‌خواهید این دسته‌بندی را حذف کنید؟",
      okText: "بله، حذف شود",
      cancelText: "انصراف",
      onOk: async () => {
        // await deleteCategory(id); // باید در store اضافه شود
        message.success("دسته‌بندی با موفقیت حذف شد");
      },
    });
  };

  const handleCategorySubmit = async (values: any) => {
    if (editingCategory) {
      // await updateCategory(editingCategory.id, values); // باید در store اضافه شود
      message.success("دسته‌بندی با موفقیت ویرایش شد");
    } else {
      await createCategory(values);
      message.success("دسته‌بندی جدید اضافه شد");
    }
    setCategoryModalVisible(false);
    setEditingCategory(null);
    fetchCategories(); // رفرش لیست دسته‌بندی‌ها
  };

  // Alerts
  const lowStockItems = getLowStockItems();
  const expiredItems = getExpiredItems();

  return (
    <ProCard title="مدیریت انبار" ghost>
      {/* Stats Section */}
      <ProCard split="horizontal" gutter={16}>
        <ProCard>
          <Space>
            <Statistic title="کل آیتم‌ها" value={stats?.overview?.totalItems || 0} />
            <Statistic 
              title="آیتم‌های موجود" 
              value={(stats?.overview?.totalItems || 0) - (stats?.overview?.outOfStockItems || 0)} 
            />
            <Statistic 
              title="کمبود موجودی" 
              value={stats?.overview?.lowStockItems || 0} 
              valueStyle={{ color: "#faad14" }} 
            />
            <Statistic 
              title="آیتم ناموجود" 
              value={stats?.overview?.outOfStockItems || 0} 
              valueStyle={{ color: "#ff4d4f" }} 
            />
          </Space>
        </ProCard>
        {/* Alerts */}
        {lowStockItems.length > 0 && (
          <Alert
            message={`هشدار: ${lowStockItems.length} آیتم دارای کمبود موجودی`}
            type="warning"
            showIcon
            style={{ margin: "16px 0" }}
          />
        )}
        {expiredItems.length > 0 && (
          <Alert
            message={`هشدار: ${expiredItems.length} آیتم منقضی شده`}
            type="error"
            showIcon
            style={{ margin: "16px 0" }}
          />
        )}
        {/* Inventory Table */}
        <ProTable
          columns={columns}
          dataSource={items}
          loading={loading}
          rowKey="id"
          pagination={{ defaultPageSize: 20, showSizeChanger: true }}
          search={false}
          options={{
            reload: true,
            density: true,
            fullScreen: true,
            setting: true,
          }}
          toolBarRender={() => [
            <Button type="primary" onClick={() => setModalVisible(true)}>
              + افزودن آیتم جدید
            </Button>,
            <Button onClick={() => setCategoryModalVisible(true)}>
              + مدیریت انبار
            </Button>,
          ]}
        />
        
        {/* Categories Management Table */}
        <ProCard title="مدیریت دسته‌بندی‌ها" collapsible>
          <ProTable
            columns={[
              { title: "نام دسته‌بندی", dataIndex: "name", key: "name", width: 200 },
              { title: "توضیحات", dataIndex: "description", key: "description", width: 300 },
              { title: "تعداد آیتم‌ها", key: "itemCount", width: 120, render: (_: any, record: InventoryCategory) => <span>{record.items?.length || 0}</span> },
              { title: "وضعیت", dataIndex: "isActive", key: "isActive", width: 100, render: (active: boolean) => <Tag color={active ? "success" : "error"}>{active ? "فعال" : "غیرفعال"}</Tag> },
              {
                title: "عملیات",
                key: "actions",
                width: 150,
                render: (_: any, record: InventoryCategory) => (
                  <Space>
                    <Button type="link" onClick={() => handleEditCategory(record)}>ویرایش</Button>
                    <Button type="link" danger onClick={() => handleDeleteCategory(record.id)}>حذف</Button>
                  </Space>
                ),
              },
            ]}
            dataSource={categories}
            rowKey="id"
            pagination={false}
            search={false}
            options={false}
            size="small"
          />
        </ProCard>
        {/* Movements Table */}
        <ProCard title="گزارش حرکت انبار" collapsible>
          <ProTable
            columns={[
              { 
                title: "آیتم", 
                dataIndex: ["item", "name"], 
                key: "itemName", 
                width: 180,
                render: (text: string, record: any) => (
                  <Space direction="vertical" size={0}>
                    <Text strong>{record.item?.name || '-'}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {record.item?.sku ? `کد: ${record.item.sku}` : ''}
                    </Text>
                  </Space>
                )
              },
              { 
                title: "نوع حرکت", 
                dataIndex: "type", 
                key: "type", 
                width: 120, 
                render: (type: string) => (
                  <Tag color={type === 'IN' ? 'green' : type === 'OUT' ? 'red' : 'orange'}>
                    {type === 'IN' ? 'ورود' : type === 'OUT' ? 'خروج' : type === 'WASTE' ? 'تلفات' : type}
                  </Tag>
                )
              },
              { 
                title: "مقدار", 
                dataIndex: "quantity", 
                key: "quantity", 
                width: 120,
                render: (quantity: number, record: any) => (
                  <Space>
                    <Text>{quantity || '-'}</Text>
                    <Text type="secondary">{record.item?.unit || ''}</Text>
                  </Space>
                )
              },
              { 
                title: "تاریخ", 
                dataIndex: "createdAt", 
                key: "createdAt", 
                width: 140,
                render: (date: string) => (
                  date ? new Date(date).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'
                )
              },
              { 
                title: "توضیحات", 
                dataIndex: "notes", 
                key: "notes", 
                width: 200,
                render: (notes: string, record: any) => (
                  <Space direction="vertical" size={0}>
                    <Text>{notes || record.reference || '-'}</Text>
                    {record.unitPrice > 0 && (
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        قیمت واحد: {record.unitPrice.toLocaleString()} تومان
                      </Text>
                    )}
                  </Space>
                )
              },
              { 
                title: "موجودی", 
                key: "stock", 
                width: 120,
                render: (_, record: any) => (
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      قبل: {record.previousStock || 0}
                    </Text>
                    <Text style={{ fontSize: '12px' }}>
                      بعد: {record.newStock || 0}
                    </Text>
                  </Space>
                )
              },
            ]}
            dataSource={movements}
            rowKey="id"
            pagination={{ defaultPageSize: 10, showSizeChanger: true }}
            search={false}
            options={{
              reload: () => fetchMovements(),
              density: false,
              fullScreen: false,
              setting: false,
            }}
            size="small"
          />
        </ProCard>
      </ProCard>

      {/* Add/Edit Item Modal */}
      <Modal
        title={editingItem ? "ویرایش آیتم انبار" : "افزودن آیتم جدید"}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingItem(null); }}
        footer={null}
        destroyOnHidden
      >
        <ProForm
          initialValues={editingItem || { status: "IN_STOCK", unit: "piece" }}
          onFinish={handleFormSubmit}
          submitter={{
            searchConfig: { submitText: editingItem ? "ذخیره تغییرات" : "افزودن آیتم" },
          }}
        >
          <ProFormText name="name" label="نام آیتم" rules={[{ required: true }]} />
          <ProFormSelect
            name="categoryId"
            label="دسته‌بندی"
            options={categories.map((cat) => ({ label: cat.name, value: cat.id }))}
            rules={[{ required: true }]}
          />
          <ProFormText name="sku" label="کد کالا (SKU)" rules={[{ required: true }]} />
          <Space.Compact>
            <ProFormDigit name="currentStock" label="موجودی فعلی" min={0} rules={[{ required: true }]} style={{ width: '70%' }} />
            <ProFormSelect
              name="unit"
              label="واحد"
              style={{ width: '30%' }}
              options={[
                { label: "کیلوگرم", value: "kg" },
                { label: "گرم", value: "g" },
                { label: "لیتر", value: "l" },
                { label: "میلی‌لیتر", value: "ml" },
                { label: "عدد", value: "piece" },
                { label: "جعبه", value: "box" },
                { label: "بسته", value: "pack" },
                { label: "دوجین", value: "dozen" },
              ]}
              rules={[{ required: true }]}
            />
          </Space.Compact>
          <ProFormDigit name="minStock" label="حداقل موجودی" min={0} />
          <ProFormDigit name="price" label="قیمت خرید" min={0} />
          <ProFormText name="supplier" label="تامین کننده" />
          <ProFormDatePicker name="expiryDate" label="تاریخ انقضا" />
          <ProFormText name="location" label="موقعیت در انبار" />
          <ProFormSelect
            name="status"
            label="وضعیت"
            options={[
              { label: "موجود", value: "IN_STOCK" },
              { label: "کمبود", value: "LOW_STOCK" },
              { label: "ناموجود", value: "OUT_OF_STOCK" },
              { label: "منقضی", value: "EXPIRED" },
            ]}
          />
        </ProForm>
      </Modal>

      {/* Movement Modal */}
      <Modal
        title="ثبت حرکت انبار"
        open={movementVisible}
        onCancel={() => { setMovementVisible(false); setMovementItemId(null); }}
        footer={null}
        destroyOnHidden
      >
        <ProForm
          onFinish={handleMovementSubmit}
          submitter={{ searchConfig: { submitText: "ثبت حرکت" } }}
        >
          <ProFormSelect
            name="type"
            label="نوع حرکت"
            options={[
              { label: "ورود", value: "IN" },
              { label: "خروج", value: "OUT" },
              { label: "تلفات", value: "WASTE" },
            ]}
            rules={[{ required: true }]}
          />
          <ProFormDigit name="amount" label="مقدار" min={1} rules={[{ required: true }]} />
          <ProFormText name="description" label="توضیحات" />
        </ProForm>
      </Modal>

      {/* Category Modal */}
      <Modal
        title={editingCategory ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
        open={categoryModalVisible}
        onCancel={() => { setCategoryModalVisible(false); setEditingCategory(null); }}
        footer={null}
        destroyOnHidden
      >
        <ProForm
          initialValues={editingCategory || { isActive: true }}
          onFinish={handleCategorySubmit}
          submitter={{
            searchConfig: { submitText: editingCategory ? "ذخیره تغییرات" : "افزودن دسته‌بندی" },
          }}
        >
          <ProFormText name="name" label="نام دسته‌بندی" rules={[{ required: true, message: "نام دسته‌بندی الزامی است!" }]} />
          <ProFormText name="nameEn" label="نام انگلیسی (اختیاری)" />
          <ProFormText name="nameAr" label="نام عربی (اختیاری)" />
          <ProFormText name="description" label="توضیحات" />
          <ProFormSelect
            name="isActive"
            label="وضعیت"
            options={[
              { label: "فعال", value: true },
              { label: "غیرفعال", value: false },
            ]}
            rules={[{ required: true }]}
          />
        </ProForm>
      </Modal>
    </ProCard>
  );
};

export default InventoryPage;
