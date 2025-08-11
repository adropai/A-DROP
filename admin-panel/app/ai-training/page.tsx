'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Tabs, 
  Upload, 
  Button, 
  Progress, 
  Select, 
  Form, 
  Input, 
  Switch, 
  Slider, 
  Divider,
  Table,
  Space,
  Tag,
  Modal,
  message,
  Statistic,
  List,
  Badge,
  Tooltip
} from 'antd'
import { 
  ProCard, 
  ProForm, 
  ProFormText, 
  ProFormSelect, 
  ProFormTextArea, 
  ProFormSwitch, 
  ProFormSlider,
  ProTable,
  StatisticCard
} from '@ant-design/pro-components'
import { 
  InboxOutlined, 
  CloudUploadOutlined, 
  RobotOutlined, 
  BarChartOutlined, 
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { useAITrainingStore } from '@/stores/ai-training-store'
import { TrainingDataset, SystemPrompt, AIModel, ConversationLog } from '@/types/ai-training'
import type { UploadProps, UploadChangeParam } from 'antd/es/upload'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { useRef } from 'react'

const { TabPane } = Tabs

export default function AITrainingPage() {
  const [currentTab, setCurrentTab] = useState('datasets')
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [isTraining, setIsTraining] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isPromptModalVisible, setIsPromptModalVisible] = useState(false)
  const [editingDataset, setEditingDataset] = useState<TrainingDataset | null>(null)
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null)
  const [form] = ProForm.useForm()
  const [promptForm] = ProForm.useForm()
  const actionRef = useRef<ActionType>()

  const {
    models,
    datasets,
    prompts,
    conversations,
    stats,
    loading,
    error,
    fetchModels,
    fetchDatasets,
    fetchPrompts,
    fetchConversations,
    fetchStats,
    addDataset,
    updateDataset,
    deleteDataset,
    addPrompt,
    updatePrompt,
    deletePrompt
  } = useAITrainingStore()

  useEffect(() => {
    fetchModels()
    fetchDatasets()
    fetchPrompts()
    fetchConversations()
    fetchStats()
  }, [])

  // Dataset Table Columns
  const datasetColumns: ProColumns<TrainingDataset>[] = [
    {
      title: 'نام دیتاست',
      dataIndex: 'name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 'bold' }}>{record.name}</span>
          <span style={{ color: '#666', fontSize: '12px' }}>{record.description}</span>
        </Space>
      ),
    },
    {
      title: 'نوع',
      dataIndex: 'type',
      valueEnum: {
        conversation: { text: 'مکالمه', status: 'Processing' },
        menu: { text: 'منو', status: 'Success' },
        orders: { text: 'سفارشات', status: 'Warning' },
        support: { text: 'پشتیبانی', status: 'Default' },
      },
    },
    {
      title: 'حجم',
      dataIndex: 'size',
      render: (_, record) => `${record.size.toLocaleString('fa-IR')} رکورد`,
      search: false,
    },
    {
      title: 'فرمت',
      dataIndex: 'format',
      valueEnum: {
        json: { text: 'JSON', status: 'Success' },
        csv: { text: 'CSV', status: 'Processing' },
        txt: { text: 'TXT', status: 'Default' },
      },
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      valueEnum: {
        uploaded: { text: 'آپلود شده', status: 'Default' },
        processing: { text: 'در حال پردازش', status: 'Processing' },
        ready: { text: 'آماده', status: 'Success' },
        error: { text: 'خطا', status: 'Error' },
      },
    },
    {
      title: 'تاریخ آپلود',
      dataIndex: 'uploadDate',
      valueType: 'date',
      search: false,
    },
    {
      title: 'عملیات',
      valueType: 'option',
      render: (_, record) => [
        <Tooltip title="مشاهده" key="view">
          <Button type="link" size="small" icon={<EyeOutlined />} />
        </Tooltip>,
        <Tooltip title="ویرایش" key="edit">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditDataset(record)}
          />
        </Tooltip>,
        <Tooltip title="حذف" key="delete">
          <Button 
            type="link" 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteDataset(record.id)}
          />
        </Tooltip>,
      ],
    },
  ]

  // Prompt Table Columns
  const promptColumns: ProColumns<SystemPrompt>[] = [
    {
      title: 'نام',
      dataIndex: 'name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 'bold' }}>{record.name}</span>
          <span style={{ color: '#666', fontSize: '12px' }}>{record.content.substring(0, 50)}...</span>
        </Space>
      ),
    },
    {
      title: 'دسته‌بندی',
      dataIndex: 'category',
      valueEnum: {
        customer_service: { text: 'خدمات مشتری', status: 'Processing' },
        order_taking: { text: 'دریافت سفارش', status: 'Success' },
        menu_recommendation: { text: 'توصیه منو', status: 'Warning' },
        general: { text: 'عمومی', status: 'Default' },
      },
    },
    {
      title: 'وضعیت',
      dataIndex: 'isActive',
      valueType: 'switch',
      render: (_, record) => (
        <Badge 
          status={record.isActive ? 'success' : 'default'} 
          text={record.isActive ? 'فعال' : 'غیرفعال'} 
        />
      ),
    },
    {
      title: 'تاریخ ایجاد',
      dataIndex: 'createdAt',
      valueType: 'date',
      search: false,
    },
    {
      title: 'عملیات',
      valueType: 'option',
      render: (_, record) => [
        <Tooltip title="ویرایش" key="edit">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditPrompt(record)}
          />
        </Tooltip>,
        <Tooltip title="حذف" key="delete">
          <Button 
            type="link" 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePrompt(record.id)}
          />
        </Tooltip>,
      ],
    },
  ]

  // Upload properties for data training
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    action: '/api/ai-training/upload',
    accept: '.csv,.json,.xlsx,.txt',
    onChange(info: UploadChangeParam) {
      const { status } = info.file
      if (status === 'done') {
        message.success(`${info.file.name} فایل با موفقیت آپلود شد.`)
        fetchDatasets() // Refresh datasets after upload
      } else if (status === 'error') {
        message.error(`${info.file.name} آپلود فایل با خطا مواجه شد.`)
      }
    },
    onDrop(e: React.DragEvent<HTMLDivElement>) {
      console.log('Dropped files', e.dataTransfer.files)
    },
  }

  const handleAddDataset = () => {
    setEditingDataset(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditDataset = (dataset: TrainingDataset) => {
    setEditingDataset(dataset)
    form.setFieldsValue(dataset)
    setIsModalVisible(true)
  }

  const handleDeleteDataset = async (id: string) => {
    Modal.confirm({
      title: 'آیا از حذف این دیتاست اطمینان دارید؟',
      content: 'این عملیات قابل بازگشت نیست.',
      okText: 'بله',
      cancelText: 'لغو',
      onOk: async () => {
        await deleteDataset(id)
        message.success('دیتاست با موفقیت حذف شد')
      },
    })
  }

  const handleAddPrompt = () => {
    setEditingPrompt(null)
    promptForm.resetFields()
    setIsPromptModalVisible(true)
  }

  const handleEditPrompt = (prompt: SystemPrompt) => {
    setEditingPrompt(prompt)
    promptForm.setFieldsValue(prompt)
    setIsPromptModalVisible(true)
  }

  const handleDeletePrompt = async (id: string) => {
    Modal.confirm({
      title: 'آیا از حذف این prompt اطمینان دارید؟',
      onOk: async () => {
        await deletePrompt(id)
        message.success('Prompt با موفقیت حذف شد')
      },
    })
  }

  const handleSubmitDataset = async (values: any) => {
    try {
      if (editingDataset) {
        await updateDataset(editingDataset.id, values)
        message.success('دیتاست با موفقیت ویرایش شد')
      } else {
        await addDataset(values)
        message.success('دیتاست با موفقیت اضافه شد')
      }
      setIsModalVisible(false)
      actionRef.current?.reload()
    } catch (error) {
      message.error('خطایی رخ داد')
    }
  }

  const handleSubmitPrompt = async (values: any) => {
    try {
      if (editingPrompt) {
        await updatePrompt(editingPrompt.id, values)
        message.success('Prompt با موفقیت ویرایش شد')
      } else {
        await addPrompt(values)
        message.success('Prompt با موفقیت اضافه شد')
      }
      setIsPromptModalVisible(false)
    } catch (error) {
      message.error('خطایی رخ داد')
    }
  }

  const handleTraining = (values: any) => {
    setIsTraining(true)
    setTrainingProgress(0)

    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress((prev: number) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsTraining(false)
          message.success('آموزش مدل با موفقیت کامل شد!')
          return 100
        }
        return prev + 10
      })
    }, 1000)

    console.log('Training started with:', values)
  }

  const handlePrediction = (values: any) => {
    message.info('درخواست پیش‌بینی ارسال شد')
    console.log('Making prediction with:', values)
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="کل مکالمات"
              value={stats?.totalConversations || 0}
              prefix={<RobotOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="زمان پاسخ متوسط"
              value={stats?.averageResponseTime || 0}
              suffix="ms"
              prefix={<BarChartOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="رضایت متوسط"
              value={stats?.averageSatisfaction || 0}
              suffix="/5"
              prefix={<CheckCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="دیتاست‌های آماده"
              value={datasets.filter(d => d.status === 'ready').length}
              prefix={<CloudUploadOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </ProCard>
        </Col>
      </Row>

      <ProCard title="مدیریت هوش مصنوعی" headerBordered>
        <Tabs activeKey={currentTab} onChange={setCurrentTab}>
          
          {/* مدیریت دیتاست‌ها */}
          <TabPane tab={<span><CloudUploadOutlined />مدیریت دیتاست‌ها</span>} key="datasets">
            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              <Col xs={24} lg={16}>
                <ProCard title="آپلود فایل‌های آموزشی" headerBordered>
                  <Upload.Dragger {...uploadProps} style={{ padding: '40px 20px' }}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text">
                      فایل‌های داده را اینجا بکشید یا کلیک کنید
                    </p>
                    <p className="ant-upload-hint">
                      فرمت‌های پشتیبانی شده: CSV, JSON, Excel, TXT
                    </p>
                  </Upload.Dragger>
                </ProCard>
              </Col>
              
              <Col xs={24} lg={8}>
                <ProCard title="آمار دیتاست‌ها" headerBordered>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Badge status="success" text={`آماده: ${datasets.filter(d => d.status === 'ready').length}`} />
                    </div>
                    <div>
                      <Badge status="processing" text={`در حال پردازش: ${datasets.filter(d => d.status === 'processing').length}`} />
                    </div>
                    <div>
                      <Badge status="error" text={`خطا: ${datasets.filter(d => d.status === 'error').length}`} />
                    </div>
                    <div>
                      <Badge status="default" text={`کل رکوردها: ${datasets.reduce((sum, d) => sum + d.size, 0).toLocaleString('fa-IR')}`} />
                    </div>
                  </Space>
                </ProCard>
              </Col>
            </Row>

            <ProTable<TrainingDataset>
              actionRef={actionRef}
              columns={datasetColumns}
              dataSource={datasets}
              loading={loading}
              rowKey="id"
              search={{
                labelWidth: 'auto',
              }}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
              }}
              toolBarRender={() => [
                <Button
                  key="add"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddDataset}
                >
                  افزودن دیتاست دستی
                </Button>,
              ]}
              options={{
                setting: true,
                fullScreen: true,
                reload: () => fetchDatasets(),
              }}
            />
          </TabPane>

          {/* مدیریت Prompt ها */}
          <TabPane tab={<span><EditOutlined />مدیریت Prompt ها</span>} key="prompts">
            <ProTable<SystemPrompt>
              columns={promptColumns}
              dataSource={prompts}
              loading={loading}
              rowKey="id"
              search={{
                labelWidth: 'auto',
              }}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
              }}
              toolBarRender={() => [
                <Button
                  key="add-prompt"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddPrompt}
                >
                  افزودن Prompt جدید
                </Button>,
              ]}
              options={{
                setting: true,
                fullScreen: true,
                reload: () => fetchPrompts(),
              }}
            />
          </TabPane>
          {/* آموزش مدل */}
          <TabPane tab={<span><RobotOutlined />آموزش مدل</span>} key="training">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <ProCard title="تنظیمات آموزش مدل" headerBordered>
                  <ProForm
                    onFinish={handleTraining}
                    submitter={{
                      searchConfig: {
                        submitText: isTraining ? 'در حال آموزش...' : 'شروع آموزش',
                      },
                      submitButtonProps: {
                        loading: isTraining,
                        disabled: isTraining,
                      },
                    }}
                  >
                    <ProFormSelect
                      name="modelType"
                      label="نوع مدل"
                      placeholder="انتخاب کنید"
                      options={[
                        { label: 'پیش‌بینی فروش', value: 'sales_prediction' },
                        { label: 'توصیه محصول', value: 'product_recommendation' },
                        { label: 'تحلیل احساسات', value: 'sentiment_analysis' },
                        { label: 'پیش‌بینی تقاضا', value: 'demand_forecasting' },
                      ]}
                      rules={[{ required: true }]}
                    />
                    
                    <ProFormSelect
                      name="algorithm"
                      label="الگوریتم"
                      placeholder="انتخاب کنید"
                      options={[
                        { label: 'Random Forest', value: 'random_forest' },
                        { label: 'Neural Network', value: 'neural_network' },
                        { label: 'XGBoost', value: 'xgboost' },
                        { label: 'Linear Regression', value: 'linear_regression' },
                      ]}
                      rules={[{ required: true }]}
                    />
                    
                    <ProFormSlider
                      name="trainTestSplit"
                      label="نسبت تقسیم داده (آموزش/تست)"
                      min={60}
                      max={90}
                      step={5}
                      marks={{
                        60: '60%',
                        70: '70%',
                        80: '80%',
                        90: '90%',
                      }}
                      initialValue={80}
                    />
                    
                    <ProFormSlider
                      name="epochs"
                      label="تعداد دوره آموزش"
                      min={10}
                      max={1000}
                      step={10}
                      marks={{
                        10: '10',
                        100: '100',
                        500: '500',
                        1000: '1000',
                      }}
                      initialValue={100}
                    />
                    
                    <ProFormSwitch
                      name="crossValidation"
                      label="اعتبارسنجی متقابل"
                      tooltip="استفاده از روش K-Fold برای اعتبارسنجی"
                    />
                    
                    <ProFormSwitch
                      name="saveModel"
                      label="ذخیره مدل آموزش دیده"
                      initialValue={true}
                    />
                  </ProForm>
                </ProCard>
              </Col>
              
              <Col xs={24} lg={8}>
                <ProCard title="وضعیت آموزش" headerBordered>
                  {isTraining && (
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <Progress
                        type="circle"
                        percent={trainingProgress}
                        status={trainingProgress === 100 ? 'success' : 'active'}
                      />
                      <p style={{ marginTop: '8px' }}>
                        {trainingProgress === 100 ? 'آموزش کامل شد!' : 'در حال آموزش...'}
                      </p>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <strong>مدل‌های آماده:</strong>
                      <List
                        size="small"
                        dataSource={models.filter(m => m.status === 'active')}
                        renderItem={model => (
                          <List.Item>
                            <Space>
                              <Badge status="success" />
                              <span>{model.name} (v{model.version})</span>
                              <Tag color="blue">{(model.accuracy * 100).toFixed(1)}%</Tag>
                            </Space>
                          </List.Item>
                        )}
                      />
                    </div>
                  </div>
                </ProCard>
              </Col>
            </Row>
          </TabPane>

          {/* پیش‌بینی و تحلیل */}
          <TabPane tab={<span><BarChartOutlined />پیش‌بینی</span>} key="prediction">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <ProCard title="درخواست پیش‌بینی" headerBordered>
                  <ProForm
                    onFinish={handlePrediction}
                    submitter={{
                      searchConfig: {
                        submitText: 'اجرای پیش‌بینی',
                      },
                    }}
                  >
                    <ProFormSelect
                      name="predictionType"
                      label="نوع پیش‌بینی"
                      placeholder="انتخاب کنید"
                      options={[
                        { label: 'فروش روزانه', value: 'daily_sales' },
                        { label: 'محبوبیت محصول', value: 'product_popularity' },
                        { label: 'رفتار مشتری', value: 'customer_behavior' },
                        { label: 'تقاضای فصلی', value: 'seasonal_demand' },
                      ]}
                      rules={[{ required: true }]}
                    />
                    
                    <ProFormSelect
                      name="timeHorizon"
                      label="بازه زمانی پیش‌بینی"
                      placeholder="انتخاب کنید"
                      options={[
                        { label: '1 روز', value: '1_day' },
                        { label: '1 هفته', value: '1_week' },
                        { label: '1 ماه', value: '1_month' },
                        { label: '3 ماه', value: '3_months' },
                      ]}
                      rules={[{ required: true }]}
                    />
                    
                    <ProFormTextArea
                      name="parameters"
                      label="پارامترهای اضافی"
                      placeholder="JSON format پارامترهای خاص (اختیاری)"
                      fieldProps={{
                        rows: 4,
                      }}
                    />
                    
                    <ProFormSwitch
                      name="includeConfidence"
                      label="نمایش فاصله اطمینان"
                      tooltip="آیا فاصله اطمینان پیش‌بینی نمایش داده شود؟"
                      initialValue={true}
                    />
                  </ProForm>
                </ProCard>
              </Col>
              
              <Col xs={24} lg={12}>
                <ProCard title="نتایج پیش‌بینی" headerBordered>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                      <h4 style={{ color: '#1e40af' }}>پیش‌بینی فروش فردا</h4>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>2,450,000 تومان</p>
                      <p style={{ fontSize: '14px', color: '#2563eb' }}>
                        فاصله اطمینان: 2,200,000 - 2,700,000 تومان
                      </p>
                      <p style={{ fontSize: '14px', color: '#2563eb' }}>دقت مدل: 94.2%</p>
                    </div>
                    
                    <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                      <h4 style={{ color: '#166534' }}>محبوب‌ترین محصول هفته</h4>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#14532d' }}>چلو کباب کوبیده</p>
                      <p style={{ fontSize: '14px', color: '#16a34a' }}>
                        پیش‌بینی فروش: 145 پرس
                      </p>
                      <p style={{ fontSize: '14px', color: '#16a34a' }}>اطمینان: 91.7%</p>
                    </div>
                    
                    <div style={{ padding: '16px', backgroundColor: '#fff7ed', borderRadius: '8px' }}>
                      <h4 style={{ color: '#9a3412' }}>توصیه بهینه‌سازی</h4>
                      <ul style={{ fontSize: '14px', color: '#ea580c', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <li>• افزایش 15% موجودی برنج</li>
                        <li>• کاهش 8% تهیه آش رشته</li>
                        <li>• تمرکز بر تبلیغات نوشیدنی‌ها</li>
                      </ul>
                    </div>
                  </div>
                </ProCard>
              </Col>
            </Row>
          </TabPane>

          {/* تنظیمات AI */}
          <TabPane tab={<span><SettingOutlined />تنظیمات</span>} key="settings">
            <ProCard title="تنظیمات عمومی هوش مصنوعی" headerBordered>
              <ProForm
                initialValues={{
                  autoRetrain: true,
                  confidenceThreshold: 85,
                  maxModelAge: 30,
                  enableRealTimePrediction: true,
                }}
                onFinish={async (values: any) => {
                  console.log('AI Settings updated:', values)
                  message.success('تنظیمات با موفقیت ذخیره شد')
                  return true
                }}
                submitter={{
                  searchConfig: {
                    submitText: 'ذخیره تنظیمات',
                  },
                }}
              >
                <ProFormSwitch
                  name="autoRetrain"
                  label="بازآموزی خودکار"
                  tooltip="آیا مدل‌ها به طور خودکار بازآموزی شوند؟"
                />
                
                <ProFormSlider
                  name="confidenceThreshold"
                  label="حد آستانه اطمینان (%)"
                  min={70}
                  max={99}
                  step={1}
                  marks={{
                    70: '70%',
                    80: '80%',
                    90: '90%',
                    99: '99%',
                  }}
                />
                
                <ProFormSlider
                  name="maxModelAge"
                  label="حداکثر عمر مدل (روز)"
                  min={7}
                  max={90}
                  step={1}
                  marks={{
                    7: '1 هفته',
                    30: '1 ماه',
                    60: '2 ماه',
                    90: '3 ماه',
                  }}
                />
                
                <ProFormSwitch
                  name="enableRealTimePrediction"
                  label="پیش‌بینی بلادرنگ"
                  tooltip="فعال‌سازی پیش‌بینی‌های لحظه‌ای"
                />
                
                <ProFormSelect
                  name="notificationLevel"
                  label="سطح اطلاع‌رسانی"
                  options={[
                    { label: 'خاموش', value: 'off' },
                    { label: 'خطاها فقط', value: 'errors' },
                    { label: 'هشدارها', value: 'warnings' },
                    { label: 'تمام رویدادها', value: 'all' },
                  ]}
                />
                
                <ProFormTextArea
                  name="apiEndpoints"
                  label="نقاط انتهایی API خارجی"
                  placeholder="JSON format برای API های مربوط به AI"
                  fieldProps={{
                    rows: 4,
                  }}
                />
              </ProForm>
            </ProCard>
          </TabPane>
        </Tabs>
      </ProCard>

      {/* Add/Edit Dataset Modal */}
      <Modal
        title={editingDataset ? 'ویرایش دیتاست' : 'افزودن دیتاست جدید'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <ProForm
          form={form}
          onFinish={handleSubmitDataset}
          layout="vertical"
          submitter={{
            searchConfig: {
              submitText: editingDataset ? 'ویرایش' : 'افزودن',
              resetText: 'لغو',
            },
            onReset: () => setIsModalVisible(false),
          }}
        >
          <ProFormText
            name="name"
            label="نام دیتاست"
            rules={[{ required: true, message: 'نام دیتاست الزامی است' }]}
          />

          <ProFormTextArea
            name="description"
            label="توضیحات"
            rules={[{ required: true, message: 'توضیحات الزامی است' }]}
          />

          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="type"
                label="نوع دیتاست"
                rules={[{ required: true, message: 'نوع دیتاست الزامی است' }]}
                options={[
                  { label: 'مکالمه', value: 'conversation' },
                  { label: 'منو', value: 'menu' },
                  { label: 'سفارشات', value: 'orders' },
                  { label: 'پشتیبانی', value: 'support' },
                ]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="format"
                label="فرمت فایل"
                rules={[{ required: true, message: 'فرمت فایل الزامی است' }]}
                options={[
                  { label: 'JSON', value: 'json' },
                  { label: 'CSV', value: 'csv' },
                  { label: 'TXT', value: 'txt' },
                ]}
              />
            </Col>
          </Row>
        </ProForm>
      </Modal>

      {/* Add/Edit Prompt Modal */}
      <Modal
        title={editingPrompt ? 'ویرایش Prompt' : 'افزودن Prompt جدید'}
        open={isPromptModalVisible}
        onCancel={() => setIsPromptModalVisible(false)}
        footer={null}
        width={800}
      >
        <ProForm
          form={promptForm}
          onFinish={handleSubmitPrompt}
          layout="vertical"
          submitter={{
            searchConfig: {
              submitText: editingPrompt ? 'ویرایش' : 'افزودن',
              resetText: 'لغو',
            },
            onReset: () => setIsPromptModalVisible(false),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="name"
                label="نام Prompt"
                rules={[{ required: true, message: 'نام Prompt الزامی است' }]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="category"
                label="دسته‌بندی"
                rules={[{ required: true, message: 'دسته‌بندی الزامی است' }]}
                options={[
                  { label: 'خدمات مشتری', value: 'customer_service' },
                  { label: 'دریافت سفارش', value: 'order_taking' },
                  { label: 'توصیه منو', value: 'menu_recommendation' },
                  { label: 'عمومی', value: 'general' },
                ]}
              />
            </Col>
          </Row>

          <ProFormTextArea
            name="content"
            label="محتوای Prompt"
            rules={[{ required: true, message: 'محتوای Prompt الزامی است' }]}
            fieldProps={{
              rows: 8,
              placeholder: 'شما یک دستیار هوشمند رستوران هستید که به مشتریان کمک می‌کنید...'
            }}
          />

          <ProFormSwitch
            name="isActive"
            label="فعال"
            tooltip="آیا این Prompt فعال باشد؟"
          />
        </ProForm>
      </Modal>
    </div>
  )
}
