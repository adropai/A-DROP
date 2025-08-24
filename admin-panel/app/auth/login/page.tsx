'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Form, Input, Checkbox, Card, App, Space, Divider, Typography } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '@/components/providers/AuthProvider';

export default function LoginPage() {
  return (
    <App>
      <LoginPageContent />
    </App>
  );
}

function LoginPageContent() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'code'>('email');
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (values: any) => {
    setLoading(true);
    console.log('🔍 Starting login process...', values);
    
    try {
      console.log('📡 Sending login request...');
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // مهم: برای ست شدن کوکی httpOnly
            body: JSON.stringify({
              email: values.email,
              password: values.password,
              remember: values.remember,
            }),
          });

      console.log('📊 Response status:', response.status);
      const data = await response.json();
      console.log('📋 Response data:', data);

      if (response.ok) {
        console.log('✅ Login successful!');
        
        // Use AuthProvider's login method
        login(data.token, data.user);
        message.success(data.message);
      } else {
        console.log('❌ Login failed:', data.message);
        message.error(data.message);
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      message.error('خطا در ارتباط با سرور');
    } finally {
      console.log('🏁 Login process finished');
      setLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          department: values.department,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success(data.message);
        setIsRegisterMode(false);
        form.resetFields();
      } else {
        message.error(data.message);
      }
    } catch (error) {
      message.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values: any) => {
    setLoading(true);
    try {
      if (resetStep === 'email') {
        // Request reset code
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'request',
            email: values.email,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          message.success(data.message);
          // در محیط توسعه، کد را نمایش می‌دهیم
          if (data.resetCode) {
            message.info(`کد تایید: ${data.resetCode}`);
          }
          setResetStep('code');
        } else {
          message.error(data.message);
        }
      } else {
        // Reset password with code
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'reset',
            email: values.email,
            resetCode: values.resetCode,
            newPassword: values.newPassword,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          message.success(data.message);
          setIsResetMode(false);
          setResetStep('email');
          form.resetFields();
        } else {
          message.error(data.message);
        }
      }
    } catch (error) {
      message.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const resetToLogin = () => {
    setIsRegisterMode(false);
    setIsResetMode(false);
    setResetStep('email');
    form.resetFields();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{ 
          width: '100%', 
          maxWidth: '400px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            color: '#667eea', 
            fontSize: '24px', 
            marginBottom: '8px',
            fontWeight: 'bold'
          }}>
            🍕 A-DROP
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            {isRegisterMode ? 'ثبت نام در سیستم' : 
             isResetMode ? 'بازیابی رمز عبور' : 
             'ورود به پنل مدیریت'}
          </p>
        </div>

        {!isRegisterMode && !isResetMode && (
          <Card 
            size="small" 
            style={{ 
              marginBottom: '24px', 
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f'
            }}
            styles={{ 
              body: { padding: '12px 16px' }
            }}
          >
            <Typography.Text strong style={{ color: '#52c41a', fontSize: '12px' }}>
              🔑 حساب تست:
            </Typography.Text>
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              <div>مدیر سیستم: <code>admin@adrop.com</code> / <code>admin123</code></div>
            </div>
          </Card>
        )}

        <Form
          form={form}
          name="auth"
          onFinish={isRegisterMode ? handleRegister : 
                    isResetMode ? handleResetPassword : 
                    handleLogin}
          autoComplete="off"
          size="large"
        >
          {isRegisterMode && (
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'نام را وارد کنید!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="نام و نام خانوادگی"
              />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'ایمیل را وارد کنید!' },
              { type: 'email', message: 'ایمیل معتبر وارد کنید!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="ایمیل"
            />
          </Form.Item>

          {isResetMode && resetStep === 'code' && (
            <>
              <Form.Item
                name="resetCode"
                rules={[{ required: true, message: 'کد تایید را وارد کنید!' }]}
              >
                <Input
                  placeholder="کد تایید ۶ رقمی"
                  maxLength={6}
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                rules={[
                  { required: true, message: 'رمز عبور جدید را وارد کنید!' },
                  { min: 6, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="رمز عبور جدید"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'تکرار رمز عبور را وارد کنید!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('رمز عبور و تکرار آن یکسان نیست!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="تکرار رمز عبور جدید"
                />
              </Form.Item>
            </>
          )}

          {!isResetMode && (
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'رمز عبور را وارد کنید!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="رمز عبور"
              />
            </Form.Item>
          )}

          {isRegisterMode && (
            <>
              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'تکرار رمز عبور را وارد کنید!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('رمز عبور و تکرار آن یکسان نیست!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="تکرار رمز عبور"
                />
              </Form.Item>

              <Form.Item
                name="department"
              >
                <Input
                  placeholder="بخش/واحد (اختیاری)"
                />
              </Form.Item>
            </>
          )}

          {!isRegisterMode && !isResetMode && (
            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>مرا به خاطر بسپار</Checkbox>
              </Form.Item>

              <Button
                type="link"
                style={{ float: 'left', padding: 0 }}
                onClick={() => setIsResetMode(true)}
              >
                فراموشی رمز عبور
              </Button>
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ 
                width: '100%',
                height: '45px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
              icon={<LoginOutlined />}
            >
              {isRegisterMode ? 'ثبت نام' : 
               isResetMode ? (resetStep === 'email' ? 'ارسال کد' : 'تغییر رمز عبور') : 
               'ورود'}
            </Button>
          </Form.Item>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ textAlign: 'center' }}>
            {!isResetMode && (
              <Space direction="vertical" size="small">
                <Button
                  type="link"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  style={{ padding: 0 }}
                >
                  {isRegisterMode ? 'قبلاً ثبت نام کرده‌اید؟ ورود' : 'حساب کاربری ندارید؟ ثبت نام'}
                </Button>
              </Space>
            )}

            {(isResetMode || isRegisterMode) && (
              <Button
                type="link"
                onClick={resetToLogin}
                style={{ padding: 0 }}
              >
                بازگشت به صفحه ورود
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
}
