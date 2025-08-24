'use client';

import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Upload, 
  Button, 
  Switch,
  Space,
  message,
  Row,
  Col
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { MenuItem, Category } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

interface MenuItemFormProps {
  visible: boolean;
  editingItem?: MenuItem | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({
  visible,
  editingItem,
  categories,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // تابع برای ایجاد فهرست تخت دسته‌بندی‌ها
  const flattenCategories = (cats: Category[]): Array<{id: string, name: string, level: number}> => {
    const result: Array<{id: string, name: string, level: number}> = [];
    
    const addCategory = (cat: Category, level: number) => {
      result.push({ id: cat.id, name: cat.name, level });
      if ((cat as any).children) {
        (cat as any).children.forEach((child: Category) => addCategory(child, level + 1));
      }
    };

    cats.filter(cat => !(cat as any).parentId).forEach(cat => addCategory(cat, 0));
    return result;
  };

  // پاک‌سازی فرم هنگام باز شدن
  useEffect(() => {
    if (visible) {
      if (editingItem) {
        form.setFieldsValue({
          ...editingItem,
          isAvailable: editingItem.isAvailable ?? true,
          isSpecial: editingItem.isSpecial ?? false,
        });
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [visible, editingItem, form]);

  // مدیریت آپلود فایل
  const uploadProps: UploadProps = {
    fileList,
    beforeUpload: (file) => {
      // بررسی نوع فایل
      const isImage = file.type?.startsWith('image/');
      if (!isImage) {
        message.error('فقط فایل‌های تصویری قابل آپلود هستند!');
        return false;
      }

      // بررسی حجم فایل (حداکثر 10MB)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('حجم فایل نباید بیشتر از 10MB باشد!');
        return false;
      }

      return false; // جلوگیری از آپلود خودکار
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
      
      // تبدیل فایل‌ها به base64 برای نمایش فوری
      newFileList.forEach((file) => {
        if (file.originFileObj && !file.url && !file.preview) {
          const reader = new FileReader();
          reader.onload = () => {
            file.preview = reader.result as string;
            setFileList([...newFileList]);
          };
          reader.readAsDataURL(file.originFileObj);
        }
      });
    },
    maxCount: 5,
    multiple: true,
    listType: 'picture-card',
    onPreview: (file) => {
      // نمایش پیش‌نمایش تصویر
      const preview = file.url || file.preview;
      if (preview) {
        const img = new Image();
        img.src = preview;
        const imgWindow = window.open('', '_blank');
        imgWindow?.document.write(img.outerHTML);
      }
    },
  };

  // ارسال فرم
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      let imageUrls: string[] = [];

      // آپلود تصاویر اگر فایل جدید وجود دارد
      if (fileList.length > 0) {
        const formData = new FormData();
        fileList.forEach(file => {
          if (file.originFileObj) {
            formData.append('images', file.originFileObj);
          }
        });

        if (formData.has('images')) {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const uploadResult = await uploadResponse.json();
          if (uploadResult.success) {
            imageUrls = uploadResult.data;
          } else {
            message.error('خطا در آپلود تصاویر: ' + uploadResult.message);
            return;
          }
        }
      }

      // ارسال داده‌های آیتم منو
      const itemData = {
        ...values,
        images: JSON.stringify(imageUrls)
      };

      const url = editingItem 
        ? `/api/menu/items/${editingItem.id}`
        : '/api/menu/items';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      const result = await response.json();

      if (result.success) {
        message.success(editingItem ? 'آیتم منو بروزرسانی شد' : 'آیتم منو ایجاد شد');
        onSuccess();
      } else {
        message.error(result.message || 'خطا در ذخیره آیتم منو');
      }
    } catch (error) {
      message.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingItem ? 'ویرایش آیتم منو' : 'افزودن آیتم جدید'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isAvailable: true,
          isSpecial: false,
          priority: 1,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="نام آیتم"
              rules={[{ required: true, message: 'نام آیتم الزامی است' }]}
            >
              <Input placeholder="نام آیتم را وارد کنید" />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="nameEn"
              label="نام انگلیسی"
            >
              <Input placeholder="نام انگلیسی آیتم" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="price"
              label="قیمت (تومان)"
              rules={[{ required: true, message: 'قیمت الزامی است' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="قیمت را وارد کنید"
                min={0}
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="categoryId"
              label="دسته‌بندی"
              rules={[{ required: true, message: 'دسته‌بندی الزامی است' }]}
            >
              <Select placeholder="دسته‌بندی را انتخاب کنید">
                {flattenCategories(categories).map(category => (
                  <Option key={category.id} value={category.id}>
                    {'└─'.repeat(category.level)} {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="description"
              label="توضیحات"
            >
              <TextArea rows={3} placeholder="توضیحات آیتم را وارد کنید" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="priority"
              label="اولویت نمایش"
            >
              <InputNumber 
                style={{ width: '100%' }}
                min={1}
                max={100}
                placeholder="اولویت"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="isAvailable"
              label="موجودیت"
              valuePropName="checked"
            >
              <Switch checkedChildren="موجود" unCheckedChildren="ناموجود" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="isSpecial"
              label="آیتم ویژه"
              valuePropName="checked"
            >
              <Switch checkedChildren="ویژه" unCheckedChildren="عادی" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="تصاویر آیتم"
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>انتخاب تصویر</Button>
              </Upload>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingItem ? 'بروزرسانی' : 'ایجاد آیتم'}
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

export default MenuItemForm;
