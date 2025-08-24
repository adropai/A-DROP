'use client';

import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  Switch,
  Space,
  message,
  Row,
  Col,
  ColorPicker,
  InputNumber,
  Select
} from 'antd';
import type { Category } from '../../types';

const { TextArea } = Input;

interface CategoryFormProps {
  visible: boolean;
  editingCategory?: Category | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  visible,
  editingCategory,
  categories,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // پاک‌سازی فرم هنگام باز شدن
  useEffect(() => {
    if (visible) {
      if (editingCategory) {
        // تنظیم مقادیر برای ویرایش
        form.setFieldsValue({
          ...editingCategory,
          isActive: editingCategory.isActive ?? true,
        });
      } else {
        // پاک‌سازی فرم برای دسته‌بندی جدید
        form.resetFields();
      }
    }
  }, [visible, editingCategory, form]);

  // ارسال فرم
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // تعیین URL و method
      const url = editingCategory 
        ? `/api/menu/categories/${editingCategory.id}`
        : '/api/menu/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        message.success(editingCategory ? 'دسته‌بندی با موفقیت بروزرسانی شد' : 'دسته‌بندی با موفقیت ایجاد شد');
        onSuccess();
      } else {
        message.error(result.message || 'خطا در ذخیره دسته‌بندی');
      }
    } catch (error) {
      message.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isActive: true,
          order: 1,
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="نام دسته‌بندی"
              rules={[{ required: true, message: 'نام دسته‌بندی الزامی است' }]}
            >
              <Input placeholder="نام دسته‌بندی را وارد کنید" />
            </Form.Item>
          </Col>
          
          <Col span={24}>
            <Form.Item
              name="nameEn"
              label="نام انگلیسی"
            >
              <Input placeholder="نام انگلیسی دسته‌بندی" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="parentId"
              label="دسته‌بندی والد"
            >
              <Select
                placeholder="انتخاب دسته‌بندی والد (اختیاری)"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (String(option?.label || '')).toLowerCase().includes(input.toLowerCase())
                }
              >
                {categories
                  .filter(cat => cat.id !== editingCategory?.id) // جلوگیری از انتخاب خود دسته‌بندی
                  .map(category => (
                    <Select.Option key={category.id} value={category.id} label={category.name}>
                      {category.name}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="description"
              label="توضیحات"
            >
              <TextArea rows={3} placeholder="توضیحات دسته‌بندی را وارد کنید" />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="color"
              label="رنگ دسته‌بندی"
            >
              <ColorPicker showText />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="order"
              label="ترتیب نمایش"
            >
              <InputNumber 
                style={{ width: '100%' }}
                min={1}
                placeholder="ترتیب نمایش"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="isActive"
              label="وضعیت"
              valuePropName="checked"
            >
              <Switch checkedChildren="فعال" unCheckedChildren="غیرفعال" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingCategory ? 'بروزرسانی' : 'ایجاد دسته‌بندی'}
                </Button>
                <Button onClick={onClose}>
                  انصراف
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CategoryForm;
