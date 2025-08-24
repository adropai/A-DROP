'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  Row,
  Col,
  Space,
  Tag,
  Checkbox,
  InputNumber,
  Divider,
  Card,
  Typography,
  Avatar,
  Tabs,
  Switch,
  App
} from 'antd';
import momentJalaali from 'moment-jalaali';
import {
  UserOutlined,
  PlusOutlined,
  UploadOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import PersianCalendar from '@/components/common/AdvancedPersianCalendar';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface CreateCustomerFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editingCustomer?: any;
}

const CreateCustomerForm: React.FC<CreateCustomerFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  editingCustomer
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // پیش‌تنظیم برچسب‌ها
  const predefinedTags = [
    { label: '🏆 VIP', value: 'vip', color: 'gold' },
    { label: '🆕 جدید', value: 'new', color: 'green' },
    { label: '💔 ناراضی', value: 'dissatisfied', color: 'red' },
    { label: '😊 راضی', value: 'satisfied', color: 'blue' },
    { label: '🔁 مکرر', value: 'frequent', color: 'purple' },
    { label: '🎂 تولدی', value: 'birthday', color: 'pink' },
    { label: '📞 تماس‌گیر', value: 'caller', color: 'orange' },
    { label: '🍕 عاشق پیتزا', value: 'pizza-lover', color: 'volcano' }
  ];

  // تنظیم مقادیر اولیه هنگام ویرایش
  useEffect(() => {
    if (visible && editingCustomer) {
      form.setFieldsValue({
        name: editingCustomer.name,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        gender: editingCustomer.gender,
        tier: editingCustomer.tier,
        status: editingCustomer.status
      });
      
      setAvatar(editingCustomer.avatar || '');
      setSelectedTags(editingCustomer.tags || []);

      // تنظیم تاریخ تولد
      if (editingCustomer.dateOfBirth) {
        try {
          const birthDate = momentJalaali(editingCustomer.dateOfBirth);
          if (birthDate.isValid()) {
            form.setFieldsValue({ dateOfBirth: birthDate });
          }
        } catch (error) {
          console.error('خطا در تنظیم تاریخ تولد:', error);
        }
      }
    } else if (visible) {
      // پاک کردن فرم برای مشتری جدید
      form.resetFields();
      setAvatar('');
      setSelectedTags([]);
    }
  }, [visible, editingCustomer, form]);

  // آپلود تصویر آواتار
  const handleAvatarUpload = (file: any) => {
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
    return false;
  };

  // بررسی نوع فایل
  const beforeUpload = (file: any) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('فقط فایل‌های JPG/PNG مجاز هستند!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('حجم فایل باید کمتر از 2MB باشد!');
      return false;
    }
    return false; // جلوگیری از آپلود خودکار
  };

  // ارسال فرم
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // تبدیل تاریخ تولد
      let dateOfBirth: string | null = null;
      if (values.dateOfBirth) {
        try {
          if (momentJalaali.isMoment(values.dateOfBirth)) {
            dateOfBirth = values.dateOfBirth.format('YYYY-MM-DD');
          } else if (typeof values.dateOfBirth === 'string') {
            // تبدیل رشته تاریخ فارسی به میلادی
            const parsed = momentJalaali(values.dateOfBirth, 'YYYY/MM/DD');
            dateOfBirth = parsed.format('YYYY-MM-DD');
          }
        } catch (error) {
          console.error('خطا در تبدیل تاریخ:', error);
        }
      }

      const customerData = {
        ...values,
        dateOfBirth,
        avatar,
        tags: selectedTags
      };

      const url = editingCustomer 
        ? `/api/customers/${editingCustomer.id}`
        : '/api/customers';
      
      const method = editingCustomer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (response.ok) {
        message.success(editingCustomer ? 'مشتری بروزرسانی شد' : 'مشتری جدید اضافه شد');
        form.resetFields();
        setAvatar('');
        setSelectedTags([]);
        onSuccess();
        onCancel();
      } else {
        const errorData = await response.json().catch(() => ({}));
        message.error(errorData.error || 'خطا در ثبت اطلاعات');
      }
    } catch (error) {
      console.error('خطا در ارسال:', error);
      message.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  // آیتم‌های تب با format جدید
  const tabItems = [
    {
      key: 'basic',
      label: '🔖 اطلاعات پایه',
      children: (
        <Card>
          <Row gutter={16}>
            <Col span={24} style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  customRequest={({ file, onSuccess }) => {
                    handleAvatarUpload(file);
                    onSuccess?.('ok');
                  }}
                >
                  {avatar ? (
                    <Avatar size={100} src={avatar} />
                  ) : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>آپلود عکس</div>
                    </div>
                  )}
                </Upload>
                <Text type="secondary" style={{ marginTop: '8px' }}>
                  عکس پروفایل مشتری
                </Text>
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="نام و نام خانوادگی"
                rules={[{ required: true, message: 'نام الزامی است' }]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  placeholder="نام کامل مشتری" 
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="شماره تلفن"
                rules={[
                  { required: true, message: 'شماره تلفن الزامی است' },
                  { pattern: /^09\d{9}$/, message: 'شماره تلفن معتبر وارد کنید' }
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />}
                  placeholder="09123456789" 
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="آدرس ایمیل">
                <Input 
                  prefix={<MailOutlined />}
                  placeholder="example@email.com" 
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dateOfBirth" label="تاریخ تولد (شمسی)">
                <PersianCalendar 
                  className="w-full"
                  onChange={(date: string) => {
                    // Handle date change
                    console.log('Birth date selected:', date);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gender" label="جنسیت">
                <Select placeholder="انتخاب کنید" size="large">
                  <Option value="male">👨 آقا</Option>
                  <Option value="female">👩 خانم</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="tier" label="سطح مشتری">
                <Select placeholder="انتخاب کنید" size="large" defaultValue="Bronze">
                  <Option value="Bronze">🥉 برنز</Option>
                  <Option value="Silver">🥈 نقره</Option>
                  <Option value="Gold">🥇 طلا</Option>
                  <Option value="Platinum">💎 پلاتین</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="وضعیت">
                <Select placeholder="انتخاب کنید" size="large" defaultValue="Active">
                  <Option value="Active">✅ فعال</Option>
                  <Option value="Inactive">❌ غیرفعال</Option>
                  <Option value="Blocked">🚫 مسدود</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      )
    },
    {
      key: 'tags',
      label: '🏷️ برچسب‌ها و یادداشت',
      children: (
        <Card>
          <Form.Item label="برچسب‌های مشتری">
            <div>
              <Text type="secondary">برچسب‌های موجود:</Text>
              <div style={{ marginTop: '8px' }}>
                {predefinedTags.map(tag => (
                  <Tag
                    key={tag.value}
                    color={selectedTags.includes(tag.value) ? tag.color : 'default'}
                    style={{ cursor: 'pointer', margin: '4px' }}
                    onClick={() => {
                      if (selectedTags.includes(tag.value)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag.value));
                      } else {
                        setSelectedTags([...selectedTags, tag.value]);
                      }
                    }}
                  >
                    {tag.label}
                  </Tag>
                ))}
              </div>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary">برچسب‌های انتخاب شده:</Text>
              <div style={{ marginTop: '8px' }}>
                {selectedTags.map(tagValue => {
                  const tag = predefinedTags.find(t => t.value === tagValue);
                  return tag ? (
                    <Tag key={tagValue} color={tag.color} closable onClose={() => {
                      setSelectedTags(selectedTags.filter(t => t !== tagValue));
                    }}>
                      {tag.label}
                    </Tag>
                  ) : null;
                })}
              </div>
            </div>
          </Form.Item>

          <Form.Item name="notes" label="یادداشت‌های مشتری">
            <TextArea
              placeholder="یادداشت‌های خصوصی درباره مشتری..."
              rows={4}
              showCount
            />
          </Form.Item>
        </Card>
      )
    }
  ];

  return (
    <Modal
      title={editingCustomer ? "ویرایش اطلاعات مشتری" : "اضافه کردن مشتری جدید"}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Tabs 
          defaultActiveKey="basic" 
          type="card"
          items={tabItems}
        />

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Space>
            <Button onClick={onCancel} size="large">
              انصراف
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
            >
              {editingCustomer ? 'بروزرسانی' : 'ثبت مشتری'}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateCustomerForm;
