'use client'

import React from 'react'
import { Form, Input, Button, Row, Col, ColorPicker } from 'antd'

const { TextArea } = Input

interface CategoryFormProps {
  onSubmit?: (values: any) => void
  initialValues?: any
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit, initialValues }) => {
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
            <ColorPicker />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="order"
            label="ترتیب نمایش"
          >
            <Input type="number" placeholder="ترتیب نمایش" />
          </Form.Item>
        </Col>
        
        <Col span={24}>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large">
              ذخیره دسته‌بندی
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

export default CategoryForm
