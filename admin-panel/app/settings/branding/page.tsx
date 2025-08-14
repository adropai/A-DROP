'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  Upload, 
  ColorPicker, 
  Space, 
  message,
  Divider,
  Typography,
  Alert,
  Tooltip,
  Badge,
  Spin
} from 'antd'
import { 
  ProCard, 
  ProForm, 
  ProFormText, 
  ProFormSelect, 
  ProFormSwitch, 
  ProFormTextArea,
  ProFormColorPicker,
  ProFormUploadButton
} from '@ant-design/pro-components'
import { 
  SettingOutlined, 
  GlobalOutlined, 
  BgColorsOutlined,
  FileImageOutlined,
  LinkOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'

const { TabPane } = Tabs
const { Title, Text } = Typography
const { Option } = Select

interface BrandingSettings {
  restaurantName: string
  restaurantNameEn?: string
  description: string
  descriptionEn?: string
  logo: string
  favicon: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  customCSS?: string
}

interface DomainSettings {
  primaryDomain: string
  subdomain: string
  sslEnabled: boolean
  customDNS: string[]
  redirectOldDomain: boolean
}

interface SocialMediaPlatform {
  id: string
  name: string
  platform: 'instagram' | 'telegram' | 'whatsapp' | 'facebook' | 'twitter' | 'youtube' | 'linkedin' | 'tiktok'
  url: string
  isActive: boolean
  displayOrder: number
  customLabel?: string
  icon: string
}

export default function BrandingPage() {
  const [currentTab, setCurrentTab] = useState('basic')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  
  // State for different settings - با مقادیر پیش‌فرض
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>({
    restaurantName: 'رستوران نمونه',
    description: 'بهترین رستوران شهر',
    logo: '',
    favicon: '',
    primaryColor: '#1890ff',
    secondaryColor: '#52c41a',
    accentColor: '#faad14',
    fontFamily: 'IRANSans'
  })

  const [domainSettings, setDomainSettings] = useState<DomainSettings>({
    primaryDomain: '',
    subdomain: '',
    sslEnabled: true,
    customDNS: [],
    redirectOldDomain: false
  })

  const [socialMediaPlatforms, setSocialMediaPlatforms] = useState<SocialMediaPlatform[]>([
    {
      id: '1',
      name: 'اینستاگرام',
      platform: 'instagram',
      url: '',
      isActive: false,
      displayOrder: 1,
      icon: '📷'
    },
    {
      id: '2', 
      name: 'تلگرام',
      platform: 'telegram',
      url: '',
      isActive: false,
      displayOrder: 2,
      icon: '✈️'
    },
    {
      id: '3',
      name: 'واتساپ',
      platform: 'whatsapp', 
      url: '',
      isActive: false,
      displayOrder: 3,
      icon: '📱'
    },
    {
      id: '4',
      name: 'فیسبوک',
      platform: 'facebook',
      url: '',
      isActive: false,
      displayOrder: 4,
      icon: '👥'
    }
  ])

  // Initialize social media platforms (no longer needed as we init in state)
  /*
  useEffect(() => {
    setSocialMediaPlatforms([
      {
        id: '1',
        name: 'اینستاگرام',
        platform: 'instagram',
        url: '',
        isActive: false,
        displayOrder: 1,
        icon: '📷'
      },
      {
        id: '2', 
        name: 'تلگرام',
        platform: 'telegram',
        url: '',
        isActive: false,
        displayOrder: 2,
        icon: '✈️'
      },
      {
        id: '3',
        name: 'واتساپ',
        platform: 'whatsapp', 
        url: '',
        isActive: false,
        displayOrder: 3,
        icon: '📱'
      },
      {
        id: '4',
        name: 'فیسبوک',
        platform: 'facebook',
        url: '',
        isActive: false,
        displayOrder: 4,
        icon: '👥'
      }
    ])
  }, [])
  */

  // Load settings on component mount
  useEffect(() => {
    setMounted(true)
    loadBrandingSettings()
    loadDomainSettings()
    loadSocialMediaSettings()
  }, [])

  // Don't render until mounted (prevents SSR issues)
  if (!mounted) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  const loadBrandingSettings = async () => {
    try {
      const response = await fetch('/api/settings/branding')
      const data = await response.json()
      if (data.success) {
        setBrandingSettings(data.data)
      }
    } catch (error) {
      console.error('خطا در بارگذاری تنظیمات برندینگ:', error)
    }
  }

  const loadDomainSettings = async () => {
    try {
      const response = await fetch('/api/settings/domain')
      const data = await response.json()
      if (data.success) {
        setDomainSettings(data.data)
      }
    } catch (error) {
      console.error('خطا در بارگذاری تنظیمات دامنه:', error)
    }
  }

  const loadSocialMediaSettings = async () => {
    try {
      const response = await fetch('/api/settings/social-media')
      const data = await response.json()
      if (data.success) {
        setSocialMediaPlatforms(data.data)
      }
    } catch (error) {
      console.error('خطا در بارگذاری شبکه‌های اجتماعی:', error)
    }
  }

  const handleSaveBranding = async (values: any) => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      
      const data = await response.json()
      if (data.success) {
        setBrandingSettings(values)
        message.success('تنظیمات برندینگ ذخیره شد')
      } else {
        message.error(data.error || 'خطا در ذخیره')
      }
    } catch (error) {
      message.error('خطا در ذخیره تنظیمات')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDomain = async (values: any) => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      
      const data = await response.json()
      if (data.success) {
        setDomainSettings(values)
        message.success('تنظیمات دامنه ذخیره شد')
      } else {
        message.error(data.error || 'خطا در ذخیره')
      }
    } catch (error) {
      message.error('خطا در ذخیره تنظیمات')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSocialMedia = async (platforms: SocialMediaPlatform[]) => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/social-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms })
      })
      
      const data = await response.json()
      if (data.success) {
        setSocialMediaPlatforms(platforms)
        message.success('شبکه‌های اجتماعی ذخیره شد')
      } else {
        message.error(data.error || 'خطا در ذخیره')
      }
    } catch (error) {
      message.error('خطا در ذخیره تنظیمات')
    } finally {
      setLoading(false)
    }
  }

  const updateSocialMediaPlatform = (id: string, updates: Partial<SocialMediaPlatform>) => {
    if (!Array.isArray(socialMediaPlatforms) || !socialMediaPlatforms) return
    const updatedPlatforms = socialMediaPlatforms.map(platform =>
      platform.id === id ? { ...platform, ...updates } : platform
    )
    setSocialMediaPlatforms(updatedPlatforms)
  }

  const addCustomSocialPlatform = () => {
    if (!Array.isArray(socialMediaPlatforms)) return
    const newPlatform: SocialMediaPlatform = {
      id: String(Date.now()),
      name: 'پلتفرم سفارشی',
      platform: 'linkedin',
      url: '',
      isActive: false,
      displayOrder: socialMediaPlatforms.length + 1,
      icon: '🔗'
    }
    setSocialMediaPlatforms([...socialMediaPlatforms, newPlatform])
  }

  const removeSocialPlatform = (id: string) => {
    if (!Array.isArray(socialMediaPlatforms)) return
    setSocialMediaPlatforms(socialMediaPlatforms.filter(p => p.id !== id))
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={18}>
          <Title level={2}>
            <BgColorsOutlined style={{ marginRight: '8px' }} />
            برندینگ و شخصی‌سازی
          </Title>
        </Col>
        <Col span={6} style={{ textAlign: 'right' }}>
          <Space>
            <Button 
              type={previewMode ? 'primary' : 'default'}
              icon={<EyeOutlined />}
              onClick={() => setPreviewMode(!previewMode)}
            >
              پیش‌نمایش
            </Button>
            <Badge count={socialMediaPlatforms && Array.isArray(socialMediaPlatforms) ? socialMediaPlatforms.filter(p => p?.isActive).length : 0}>
              <Button icon={<CheckCircleOutlined />}>
                فعال
              </Button>
            </Badge>
          </Space>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={currentTab} onChange={setCurrentTab}>
          
          {/* تنظیمات پایه */}
          <TabPane 
            tab={
              <span>
                <FileImageOutlined />
                اطلاعات پایه
              </span>
            } 
            key="basic"
          >
            <ProForm
              initialValues={brandingSettings}
              onFinish={handleSaveBranding}
              submitter={{
                searchConfig: {
                  resetText: 'بازنشانی',
                  submitText: 'ذخیره تغییرات',
                },
                render: (props, doms) => {
                  return [
                    <Button 
                      type="primary" 
                      key="submit" 
                      loading={loading}
                      icon={<SaveOutlined />}
                      onClick={() => props.form?.submit?.()}
                    >
                      ذخیره تغییرات
                    </Button>
                  ]
                }
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <ProFormText
                    name="restaurantName"
                    label="نام رستوران (فارسی)"
                    rules={[{ required: true, message: 'نام رستوران الزامی است' }]}
                    placeholder="رستوران A-DROP"
                  />
                </Col>
                <Col span={12}>
                  <ProFormText
                    name="restaurantNameEn"
                    label="نام رستوران (انگلیسی)"
                    placeholder="A-DROP Restaurant"
                  />
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <ProFormTextArea
                    name="description"
                    label="توضیحات (فارسی)"
                    placeholder="بهترین رستوران شهر با غذاهای اصیل و طعم بی‌نظیر"
                    fieldProps={{ rows: 3 }}
                  />
                </Col>
                <Col span={12}>
                  <ProFormTextArea
                    name="descriptionEn"
                    label="توضیحات (انگلیسی)"
                    placeholder="The best restaurant in the city with authentic and delicious food"
                    fieldProps={{ rows: 3 }}
                  />
                </Col>
              </Row>

              <Divider>تصاویر برند</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <ProFormUploadButton
                    name="logo"
                    label="لوگو رستوران"
                    max={1}
                    fieldProps={{
                      name: 'logo',
                      listType: 'picture-card',
                    }}
                    action="/api/upload/image"
                    extra="فرمت PNG/JPG، حداکثر 2MB"
                  />
                </Col>
                <Col span={12}>
                  <ProFormUploadButton
                    name="favicon"
                    label="Favicon"
                    max={1}
                    fieldProps={{
                      name: 'favicon',
                      listType: 'picture-card',
                    }}
                    action="/api/upload/image"
                    extra="سایز 32x32 پیکسل، فرمت ICO/PNG"
                  />
                </Col>
              </Row>

              <Divider>رنگ‌های برند</Divider>

              <Row gutter={16}>
                <Col span={8}>
                  <ProFormColorPicker
                    name="primaryColor"
                    label="رنگ اصلی"
                  />
                </Col>
                <Col span={8}>
                  <ProFormColorPicker
                    name="secondaryColor"
                    label="رنگ ثانویه"
                  />
                </Col>
                <Col span={8}>
                  <ProFormColorPicker
                    name="accentColor"
                    label="رنگ تاکیدی"
                  />
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <ProFormSelect
                    name="fontFamily"
                    label="فونت اصلی"
                    options={[
                      { label: 'IRANSans', value: 'IRANSans' },
                      { label: 'Vazir', value: 'Vazir' },
                      { label: 'Shabnam', value: 'Shabnam' },
                      { label: 'Yekan', value: 'Yekan' },
                      { label: 'سفارشی', value: 'custom' },
                    ]}
                  />
                </Col>
                <Col span={12}>
                  <ProFormTextArea
                    name="customCSS"
                    label="CSS سفارشی"
                    placeholder="/* استایل‌های سفارشی شما */"
                    fieldProps={{ rows: 3 }}
                  />
                </Col>
              </Row>
            </ProForm>
          </TabPane>

          {/* شبکه‌های اجتماعی */}
          <TabPane 
            tab={
              <span>
                <LinkOutlined />
                شبکه‌های اجتماعی
              </span>
            } 
            key="social"
          >
            <div style={{ marginBottom: '16px' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={4}>مدیریت شبکه‌های اجتماعی</Title>
                  <Text type="secondary">
                    شبکه‌های اجتماعی خود را تنظیم کنید تا مشتریان بتوانند با شما در ارتباط باشند
                  </Text>
                </Col>
                <Col>
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />}
                    onClick={addCustomSocialPlatform}
                  >
                    افزودن پلتفرم سفارشی
                  </Button>
                </Col>
              </Row>
            </div>

            <Row gutter={16}>
              {socialMediaPlatforms && Array.isArray(socialMediaPlatforms) && socialMediaPlatforms.length > 0 ? socialMediaPlatforms.map((platform) => (
                <Col span={12} key={platform.id} style={{ marginBottom: '16px' }}>
                  <Card 
                    size="small"
                    title={
                      <Space>
                        <span>{platform.icon}</span>
                        <span>{platform.name}</span>
                        <Switch
                          checked={platform.isActive}
                          onChange={(checked) => 
                            updateSocialMediaPlatform(platform.id, { isActive: checked })
                          }
                          size="small"
                        />
                      </Space>
                    }
                    extra={
                      <Space>
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<EditOutlined />}
                          onClick={() => {
                            // Open edit modal
                          }}
                        />
                        <Button 
                          type="text" 
                          size="small" 
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeSocialPlatform(platform.id)}
                        />
                      </Space>
                    }
                  >
                    <Form layout="vertical" size="small">
                      <Form.Item label="آدرس لینک">
                        <Input
                          value={platform.url}
                          onChange={(e) => 
                            updateSocialMediaPlatform(platform.id, { url: e.target.value })
                          }
                          placeholder={`https://${platform.platform}.com/your-account`}
                          prefix={<LinkOutlined />}
                        />
                      </Form.Item>
                      <Form.Item label="برچسب سفارشی">
                        <Input
                          value={platform.customLabel || platform.name}
                          onChange={(e) => 
                            updateSocialMediaPlatform(platform.id, { customLabel: e.target.value })
                          }
                          placeholder="نام نمایشی"
                        />
                      </Form.Item>
                      <Form.Item label="ترتیب نمایش">
                        <Select
                          value={platform.displayOrder}
                          onChange={(value) => 
                            updateSocialMediaPlatform(platform.id, { displayOrder: value })
                          }
                          style={{ width: '100%' }}
                        >
                          {[1,2,3,4,5,6,7,8].map(num => (
                            <Option key={num} value={num}>{num}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>
              )) : (
                <Col span={24}>
                  <Alert message="در حال بارگذاری..." type="info" />
                </Col>
              )}
            </Row>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                loading={loading}
                onClick={() => handleSaveSocialMedia(socialMediaPlatforms)}
                size="large"
              >
                ذخیره تنظیمات شبکه‌های اجتماعی
              </Button>
            </div>
          </TabPane>

          {/* تنظیمات دامنه */}
          <TabPane 
            tab={
              <span>
                <GlobalOutlined />
                مدیریت دامنه
              </span>
            } 
            key="domain"
          >
            <Alert
              message="تنظیمات دامنه"
              description="برای تنظیم دامنه سفارشی، ابتدا DNS رکوردهای مورد نیاز را در پنل دامنه خود تنظیم کنید."
              type="info"
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <ProForm
              initialValues={domainSettings}
              onFinish={handleSaveDomain}
              submitter={{
                searchConfig: {
                  resetText: 'بازنشانی',
                  submitText: 'ذخیره تنظیمات',
                },
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <ProFormText
                    name="primaryDomain"
                    label="دامنه اصلی"
                    placeholder="myrestaurant.com"
                    rules={[
                      { required: true, message: 'دامنه اصلی الزامی است' },
                      { pattern: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, message: 'فرمت دامنه صحیح نیست' }
                    ]}
                  />
                </Col>
                <Col span={12}>
                  <ProFormText
                    name="subdomain"
                    label="ساب‌دامنه سفارشات"
                    placeholder="order"
                    extra="آدرس نهایی: order.myrestaurant.com"
                  />
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <ProFormSwitch
                    name="sslEnabled"
                    label="SSL فعال"
                    extra="گواهی SSL خودکار از Let's Encrypt"
                  />
                </Col>
                <Col span={12}>
                  <ProFormSwitch
                    name="redirectOldDomain"
                    label="تغییر مسیر از دامنه قدیمی"
                    extra="به طور خودکار به دامنه جدید هدایت شود"
                  />
                </Col>
              </Row>

              <ProFormTextArea
                name="customDNS"
                label="DNS رکوردهای سفارشی"
                placeholder={`A record: @ -> IP_ADDRESS\nCNAME: order -> target.domain.com\nTXT: _verification -> token123`}
                fieldProps={{ rows: 4 }}
                extra="هر رکورد در خط جداگانه"
              />
            </ProForm>
          </TabPane>
        </Tabs>
      </Card>

      {/* Preview Panel */}
      {previewMode && (
        <Card 
          title="پیش‌نمایش ظاهر مشتری" 
          style={{ marginTop: '16px' }}
          extra={
            <Button onClick={() => setPreviewMode(false)}>
              بستن پیش‌نمایش
            </Button>
          }
        >
          <div 
            style={{
              padding: '20px',
              backgroundColor: brandingSettings.primaryColor,
              color: 'white',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <Title level={3} style={{ color: 'white', margin: '0 0 8px 0' }}>
              {brandingSettings.restaurantName || 'نام رستوران'}
            </Title>
            <Text style={{ color: 'white' }}>
              {brandingSettings.description || 'توضیحات رستوران'}
            </Text>
            
            <div style={{ marginTop: '16px' }}>
              <Space>
                {socialMediaPlatforms && Array.isArray(socialMediaPlatforms) && socialMediaPlatforms.length > 0 ? 
                  socialMediaPlatforms.filter(p => p?.isActive && p?.url).map(platform => (
                  <Button 
                    key={platform.id}
                    style={{ 
                      backgroundColor: brandingSettings.secondaryColor,
                      borderColor: brandingSettings.secondaryColor,
                      color: 'white'
                    }}
                    size="small"
                  >
                    {platform.icon} {platform.customLabel || platform.name}
                  </Button>
                )) : null}
              </Space>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
