'use client'

import { useState } from 'react'
import { Form, Input, Button, Card, message, Steps } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, SafetyOutlined } from '@ant-design/icons'
import Link from 'next/link'

const { Step } = Steps

export default function RegisterPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const handleRegister = async (values: any) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Registration data:', values)
      
      message.success('ثبت‌نام با موفقیت انجام شد!')
      // Redirect to login
      window.location.href = '/auth/login'
    } catch (error) {
      message.error('خطا در ثبت‌نام')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(['username', 'email', 'phone'])
      } else if (currentStep === 1) {
        await form.validateFields(['password', 'confirmPassword'])
      }
      setCurrentStep(currentStep + 1)
    } catch (error) {
      console.log('Validation failed:', error)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Form.Item
              name="username"
              rules={[
                { required: true, message: 'لطفا نام کاربری را وارد کنید!' },
                { min: 3, message: 'نام کاربری باید حداقل 3 کاراکتر باشد' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: 'نام کاربری فقط شامل حروف، اعداد و _ باشد' }
              ]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="نام کاربری"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'لطفا ایمیل را وارد کنید!' },
                { type: 'email', message: 'فرمت ایمیل صحیح نیست!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="ایمیل"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: 'لطفا شماره موبایل را وارد کنید!' },
                { pattern: /^09[0-9]{9}$/, message: 'شماره موبایل صحیح نیست' }
              ]}
            >
              <Input 
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder="شماره موبایل (09123456789)"
                className="rounded-lg"
                maxLength={11}
              />
            </Form.Item>
          </>
        )

      case 1:
        return (
          <>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'لطفا رمز عبور را وارد کنید!' },
                { min: 6, message: 'رمز عبور باید حداقل 6 کاراکتر باشد' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                  message: 'رمز عبور باید شامل حروف کوچک، بزرگ و عدد باشد'
                }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="رمز عبور"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'لطفا تکرار رمز عبور را وارد کنید!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('رمز عبور و تکرار آن یکسان نیستند!'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="تکرار رمز عبور"
                className="rounded-lg"
              />
            </Form.Item>
          </>
        )

      case 2:
        return (
          <>
            <Form.Item
              name="verificationCode"
              rules={[
                { required: true, message: 'لطفا کد تایید را وارد کنید!' },
                { len: 6, message: 'کد تایید باید 6 رقم باشد' }
              ]}
            >
              <Input
                prefix={<SafetyOutlined className="text-gray-400" />}
                placeholder="کد تایید 6 رقمی"
                className="rounded-lg"
                maxLength={6}
              />
            </Form.Item>

            <div className="text-center text-sm text-gray-600 mb-4">
              کد تایید به شماره موبایل شما ارسال شد
            </div>

            <Button 
              type="link" 
              size="small"
              onClick={() => message.success('کد مجدداً ارسال شد')}
            >
              ارسال مجدد کد
            </Button>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card 
        className="w-full max-w-md shadow-2xl"
        style={{ borderRadius: '12px' }}
      >
        <div className="text-center mb-8">
          <div className="mb-4">
            <UserOutlined style={{ fontSize: '48px', color: '#10b981' }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ثبت‌نام در سیستم
          </h1>
          <p className="text-gray-600">
            رستوران A-DROP
          </p>
        </div>

        <Steps current={currentStep} className="mb-8">
          <Step title="اطلاعات کاربری" />
          <Step title="رمز عبور" />
          <Step title="تایید" />
        </Steps>

        <Form
          form={form}
          name="register"
          onFinish={handleRegister}
          layout="vertical"
          size="large"
          autoComplete="off"
        >
          {renderStepContent()}

          <Form.Item className="mb-0">
            <div className="flex justify-between gap-4">
              {currentStep > 0 && (
                <Button
                  onClick={prevStep}
                  className="rounded-lg"
                  style={{ flex: 1 }}
                >
                  قبلی
                </Button>
              )}
              
              {currentStep < 2 ? (
                <Button
                  type="primary"
                  onClick={nextStep}
                  className="rounded-lg"
                  style={{ flex: 1 }}
                >
                  بعدی
                </Button>
              ) : (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="rounded-lg"
                  style={{ flex: 1 }}
                >
                  تکمیل ثبت‌نام
                </Button>
              )}
            </div>
          </Form.Item>
        </Form>

        <div className="text-center mt-6">
          <div className="text-sm text-gray-500">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link href="/auth/login" className="text-green-600 hover:text-green-800">
              وارد شوید
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
