'use client'

import React from 'react'
import { Form, Input, InputNumber, Select, Upload, Button, Row, Col } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input

interface MenuItemFormProps {
  onSubmit?: (values: any) => void
  initialValues?: any
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ onSubmit, initialValues }) => {
  const [form] = Form.useForm()

  const handleSubmit = (values: any) => {
    onSubmit?.(values)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues}
    >
      <Row gutter={[16, 16]}>
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
            name="price"
            label="قیمت (تومان)"
            rules={[{ required: true, message: 'قیمت الزامی است' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="قیمت را وارد کنید"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="category"
            label="دسته‌بندی"
            rules={[{ required: true, message: 'دسته‌بندی الزامی است' }]}
          >
            <Select placeholder="دسته‌بندی را انتخاب کنید">
              <Option value="pizza">پیتزا</Option>
              <Option value="burger">برگر</Option>
              <Option value="pasta">پاستا</Option>
              <Option value="salad">سالاد</Option>
              <Option value="dessert">دسر</Option>
              <Option value="drink">نوشیدنی</Option>
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="status"
            label="وضعیت"
            rules={[{ required: true, message: 'وضعیت الزامی است' }]}
          >
            <Select placeholder="وضعیت را انتخاب کنید">
              <Option value="available">موجود</Option>
              <Option value="unavailable">ناموجود</Option>
              <Option value="coming_soon">به زودی</Option>
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={24}>
          <Form.Item
            name="description"
            label="توضیحات"
          >
            <TextArea rows={4} placeholder="توضیحات محصول را وارد کنید" />
          </Form.Item>
        </Col>
        
        <Col span={24}>
          <Form.Item
            name="image"
            label="تصویر محصول"
          >
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>انتخاب تصویر</Button>
            </Upload>
          </Form.Item>
        </Col>
        
        <Col span={24}>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large">
              ذخیره محصول
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

export default MenuItemForm
