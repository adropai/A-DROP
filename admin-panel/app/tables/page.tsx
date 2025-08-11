'use client'

import { useState, useRef, useEffect } from 'react'
import { ProTable, ProForm, ProFormText, ProFormDigit, ProFormSelect, ProFormSwitch } from '@ant-design/pro-components'
import { Button, Modal, message, Card, Space, Tag, Tooltip, Image, Row, Col, Statistic } from 'antd'
import { PlusOutlined, QrcodeOutlined, EditOutlined, DeleteOutlined, PrinterOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { useTablesStore } from '../../stores/tables-store'
import { Table } from '../../types/tables'
import { ProTableWrapper, AntdHydrationSafe, getConsistentProTableProps } from '@/lib/hydration-fix'
import QRCode from 'qrcode'

export default function TablesPage() {
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [qrModalVisible, setQrModalVisible] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [qrCodeImage, setQrCodeImage] = useState<string>('')
  const actionRef = useRef<ActionType>()
  
  const { tables, loading, addTable, updateTable, deleteTable, fetchTables, generateQRCode, getTableStats } = useTablesStore()

  // آمار میزها
  const stats = getTableStats()

  // دریافت داده‌ها هنگام بارگذاری صفحه
  useEffect(() => {
    fetchTables()
  }, [])

  const columns: ProColumns<Table>[] = [
    {
      title: 'شماره میز',
      dataIndex: 'number',
      width: 100,
      render: (text) => (
        <Tag color="blue" className="font-semibold">
          میز {text}
        </Tag>
      ),
    },
    {
      title: 'ظرفیت',
      dataIndex: 'capacity',
      width: 100,
      render: (capacity) => `${capacity} نفر`,
      search: false,
    },
    {
      title: 'موقعیت',
      dataIndex: 'location',
      ellipsis: true,
    },
    {
      title: 'نوع',
      dataIndex: 'type',
      width: 100,
      valueEnum: {
        indoor: { text: 'داخلی', status: 'Default' },
        outdoor: { text: 'بیرونی', status: 'Warning' },
        vip: { text: 'VIP', status: 'Success' },
      },
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        available: { text: 'آزاد', status: 'Success' },
        occupied: { text: 'اشغال', status: 'Error' },
        reserved: { text: 'رزرو', status: 'Warning' },
        maintenance: { text: 'تعمیرات', status: 'Default' },
      },
    },
    {
      title: 'فعال',
      dataIndex: 'isActive',
      width: 80,
      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'فعال' : 'غیرفعال'}
        </Tag>
      ),
      search: false,
    },
    {
      title: 'عملیات',
      valueType: 'option',
      width: 200,
      render: (_, record) => [
        <Tooltip key="qr" title="QR Code">
          <Button
            type="text"
            icon={<QrcodeOutlined />}
            onClick={() => handleGenerateQRCode(record)}
          />
        </Tooltip>,
        <Tooltip key="edit" title="ویرایش">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Tooltip>,
        <Tooltip key="delete" title="حذف">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Tooltip>,
      ],
    },
  ]

  const handleCreate = async (values: any) => {
    try {
      await addTable(values)
      message.success('میز جدید با موفقیت اضافه شد')
      setCreateModalVisible(false)
      actionRef.current?.reload()
    } catch (error: any) {
      message.error(error.message || 'خطا در ایجاد میز')
    }
  }

  const handleEdit = (table: Table) => {
    setSelectedTable(table)
    setEditModalVisible(true)
  }

  const handleUpdate = async (values: any) => {
    try {
      if (selectedTable) {
        await updateTable(selectedTable.id, values)
        message.success('میز با موفقیت به‌روزرسانی شد')
        setEditModalVisible(false)
        setSelectedTable(null)
        actionRef.current?.reload()
      }
    } catch (error: any) {
      message.error(error.message || 'خطا در به‌روزرسانی میز')
    }
  }

  const handleDelete = async (table: Table) => {
    Modal.confirm({
      title: 'حذف میز',
      content: `آیا از حذف میز شماره ${table.number} اطمینان دارید؟`,
      okText: 'حذف',
      cancelText: 'انصراف',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteTable(table.id)
          message.success('میز با موفقیت حذف شد')
          actionRef.current?.reload()
        } catch (error: any) {
          message.error(error.message || 'خطا در حذف میز')
        }
      },
    })
  }

  const handleGenerateQRCode = async (table: Table) => {
    try {
      generateQRCode(table.id)
      const qrUrl = `${window.location.origin}/customer/order?table=${table.id}`
      const qrImage = await QRCode.toDataURL(qrUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      setQrCodeImage(qrImage)
      setSelectedTable(table)
      setQrModalVisible(true)
    } catch (error) {
      message.error('خطا در تولید QR Code')
    }
  }

  const handleShowQRCode = async (table: Table) => {
    try {
      const qrUrl = `${window.location.origin}/customer/order?table=${table.id}`
      const qrImage = await QRCode.toDataURL(qrUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      setQrCodeImage(qrImage)
      setSelectedTable(table)
      setQrModalVisible(true)
    } catch (error) {
      message.error('خطا در نمایش QR Code')
    }
  }

  const handleDownloadQR = () => {
    if (qrCodeImage && selectedTable) {
      const link = document.createElement('a')
      link.download = `table-${selectedTable.number}-qr.png`
      link.href = qrCodeImage
      link.click()
    }
  }

  const handlePrintQR = () => {
    if (qrCodeImage && selectedTable) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - میز ${selectedTable.number}</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  font-family: Arial, sans-serif;
                }
                .qr-container {
                  text-align: center;
                  page-break-inside: avoid;
                }
                .qr-title {
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 20px;
                  color: #333;
                }
                .qr-image {
                  margin: 20px 0;
                }
                .qr-info {
                  font-size: 16px;
                  color: #666;
                  margin-top: 20px;
                }
                @media print {
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <h1>میز شماره ${selectedTable.number}</h1>
                <div class="qr-image">
                  <img src="${qrCodeImage}" alt="QR Code" />
                </div>
                <div class="qr-info">
                  <p>ظرفیت: ${selectedTable.capacity} نفر</p>
                  <p>موقعیت: ${selectedTable.location}</p>
                  <p>برای سفارش، QR Code را اسکن کنید</p>
                </div>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  return (
    <AntdHydrationSafe>
      <div className="p-6">
      {/* کارت‌های آمار */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="کل میزها"
              value={stats.totalTables}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="آزاد"
              value={stats.availableTables}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="اشغال"
              value={stats.occupiedTables}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="نرخ اشغال"
              value={stats.occupancyRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <ProTableWrapper>
          <ProTable<Table>
            columns={columns}
            actionRef={actionRef}
            dataSource={tables}
            loading={loading}
            rowKey="id"
            {...getConsistentProTableProps()}
            headerTitle="مدیریت میزها"
            toolBarRender={() => [
              <Button
                key="add"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                میز جدید
              </Button>,
            ]}
          />
        </ProTableWrapper>
      </Card>

      {/* Modal ایجاد میز جدید */}
      <Modal
        title="ایجاد میز جدید"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <ProForm
          onFinish={handleCreate}
          submitter={{
            render: (props) => (
              <Space>
                <Button onClick={() => setCreateModalVisible(false)}>
                  انصراف
                </Button>
                <Button type="primary" onClick={() => props.form?.submit()}>
                  ایجاد میز
                </Button>
              </Space>
            ),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormDigit
                name="number"
                label="شماره میز"
                placeholder="شماره میز را وارد کنید"
                min={1}
                max={999}
                rules={[{ required: true, message: 'شماره میز الزامی است' }]}
              />
            </Col>
            <Col span={12}>
              <ProFormDigit
                name="capacity"
                label="ظرفیت"
                placeholder="ظرفیت میز (نفر)"
                min={1}
                max={20}
                rules={[{ required: true, message: 'ظرفیت میز الزامی است' }]}
              />
            </Col>
          </Row>

          <ProFormText
            name="location"
            label="موقعیت"
            placeholder="موقعیت میز (مثلاً: سالن اصلی، تراس، کنار پنجره)"
            rules={[{ required: true, message: 'موقعیت میز الزامی است' }]}
          />

          <ProFormText
            name="description"
            label="توضیحات"
            placeholder="توضیحات اختیاری در مورد میز"
          />

          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="type"
                label="نوع میز"
                options={[
                  { label: 'داخلی', value: 'indoor' },
                  { label: 'بیرونی', value: 'outdoor' },
                  { label: 'VIP', value: 'vip' },
                ]}
                initialValue="indoor"
                rules={[{ required: true, message: 'نوع میز را انتخاب کنید' }]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="status"
                label="وضعیت"
                options={[
                  { label: 'آزاد', value: 'available' },
                  { label: 'اشغال', value: 'occupied' },
                  { label: 'رزرو', value: 'reserved' },
                  { label: 'تعمیرات', value: 'maintenance' },
                ]}
                initialValue="available"
                rules={[{ required: true, message: 'وضعیت میز را انتخاب کنید' }]}
              />
            </Col>
          </Row>

          <ProFormSwitch
            name="isActive"
            label="فعال"
            checkedChildren="فعال"
            unCheckedChildren="غیرفعال"
            initialValue={true}
          />
        </ProForm>
      </Modal>

      {/* Modal ویرایش میز */}
      <Modal
        title="ویرایش میز"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          setSelectedTable(null)
        }}
        footer={null}
        width={600}
      >
        {selectedTable && (
          <ProForm
            initialValues={selectedTable}
            onFinish={handleUpdate}
            submitter={{
              render: (props) => (
                <Space>
                  <Button onClick={() => {
                    setEditModalVisible(false)
                    setSelectedTable(null)
                  }}>
                    انصراف
                  </Button>
                  <Button type="primary" onClick={() => props.form?.submit()}>
                    به‌روزرسانی
                  </Button>
                </Space>
              ),
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <ProFormDigit
                  name="number"
                  label="شماره میز"
                  placeholder="شماره میز را وارد کنید"
                  min={1}
                  max={999}
                  rules={[{ required: true, message: 'شماره میز الزامی است' }]}
                />
              </Col>
              <Col span={12}>
                <ProFormDigit
                  name="capacity"
                  label="ظرفیت"
                  placeholder="ظرفیت میز (نفر)"
                  min={1}
                  max={20}
                  rules={[{ required: true, message: 'ظرفیت میز الزامی است' }]}
                />
              </Col>
            </Row>

            <ProFormText
              name="location"
              label="موقعیت"
              placeholder="موقعیت میز (مثلاً: سالن اصلی، تراس، کنار پنجره)"
              rules={[{ required: true, message: 'موقعیت میز الزامی است' }]}
            />

            <Row gutter={16}>
              <Col span={12}>
                <ProFormSelect
                  name="type"
                  label="نوع میز"
                  options={[
                    { label: 'داخلی', value: 'indoor' },
                    { label: 'بیرونی', value: 'outdoor' },
                    { label: 'VIP', value: 'vip' },
                  ]}
                  rules={[{ required: true, message: 'نوع میز را انتخاب کنید' }]}
                />
              </Col>
              <Col span={12}>
                <ProFormSelect
                  name="status"
                  label="وضعیت"
                  options={[
                    { label: 'آزاد', value: 'available' },
                    { label: 'اشغال', value: 'occupied' },
                    { label: 'رزرو', value: 'reserved' },
                    { label: 'تعمیرات', value: 'maintenance' },
                  ]}
                  rules={[{ required: true, message: 'وضعیت میز را انتخاب کنید' }]}
                />
              </Col>
            </Row>

            <ProFormSwitch
              name="isActive"
              label="فعال"
              checkedChildren="فعال"
              unCheckedChildren="غیرفعال"
            />
          </ProForm>
        )}
      </Modal>

      {/* Modal نمایش QR Code */}
      <Modal
        title={`QR Code میز ${selectedTable?.number}`}
        open={qrModalVisible}
        onCancel={() => {
          setQrModalVisible(false)
          setSelectedTable(null)
          setQrCodeImage('')
        }}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={handleDownloadQR}>
            دانلود
          </Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrintQR}>
            چاپ
          </Button>,
        ]}
        width={400}
      >
        {qrCodeImage && selectedTable && (
          <div className="text-center">
            <div className="mb-4">
              <Image
                src={qrCodeImage}
                alt={`QR Code میز ${selectedTable.number}`}
                width={256}
                height={256}
              />
            </div>
            <div className="text-gray-600">
              <p><strong>میز:</strong> {selectedTable.number}</p>
              <p><strong>ظرفیت:</strong> {selectedTable.capacity} نفر</p>
              <p><strong>موقعیت:</strong> {selectedTable.location}</p>
              <p className="text-sm mt-4">
                مشتریان می‌توانند با اسکن این QR Code مستقیماً سفارش خود را ثبت کنند
              </p>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </AntdHydrationSafe>
  )
}
