'use client';
import { Card, Row, Col, Button, Table, Tag, Progress, Statistic, Tabs, Switch, message, Modal } from 'antd';
import { SecurityScanOutlined, CheckOutlined, BankOutlined, AuditOutlined, SafetyOutlined, MobileOutlined } from '@ant-design/icons';
import { useSecurity } from '../../hooks/useSecurity';
import TwoFactorSetup from '../../components/auth/TwoFactorSetup';
import { useEffect, useState } from 'react';

export default function SecurityPage() {
  const { 
    fetchSecuritySettings, 
    fetchBackupConfigs, 
    fetchIncidents, 
    generateSecurityReport,
    executeBackup 
  } = useSecurity();
  
  const [settings, setSettings] = useState<any>(null);
  const [backups, setBackups] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [settingsData, backupsData, incidentsData, reportData] = await Promise.all([
        fetchSecuritySettings(),
        fetchBackupConfigs(), 
        fetchIncidents(),
        generateSecurityReport()
      ]);
      setSettings(settingsData);
      setBackups(backupsData);
      setIncidents(incidentsData);
      setReport(reportData);
    };
    loadData();
  }, []);

  const stats = [
    { title: 'امنیت کلی', value: 85, suffix: '%', status: 'success' },
    { title: 'حوادث فعال', value: incidents?.filter(i => i.status === 'open').length || 0, status: 'warning' },
    { title: 'پشتیبان‌گیری امروز', value: 3, status: 'success' },
    { title: 'ورود ناموفق', value: 12, status: 'error' }
  ];

  const backupColumns = [
    { title: 'نام', dataIndex: 'name', key: 'name' },
    { title: 'آخرین اجرا', dataIndex: 'lastRun', key: 'lastRun' },
    { title: 'وضعیت', dataIndex: 'status', key: 'status', render: (status) => 
      <Tag color={status === 'completed' ? 'green' : status === 'failed' ? 'red' : 'blue'}>{status}</Tag> },
    { title: 'عملیات', key: 'actions', render: (_, record) => 
      <Button size="small" onClick={() => executeBackup(record.id)}>اجرا</Button> }
  ];

  const incidentColumns = [
    { title: 'نوع', dataIndex: 'type', key: 'type' },
    { title: 'شدت', dataIndex: 'severity', key: 'severity', render: (severity) => 
      <Tag color={severity === 'critical' ? 'red' : severity === 'high' ? 'orange' : 'blue'}>{severity}</Tag> },
    { title: 'زمان', dataIndex: 'timestamp', key: 'timestamp' },
    { title: 'وضعیت', dataIndex: 'status', key: 'status' }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1><SecurityScanOutlined /> امنیت و پشتیبان‌گیری</h1>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic 
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                valueStyle={{ color: stat.status === 'success' ? '#3f8600' : stat.status === 'error' ? '#cf1322' : '#d48806' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs items={[
        {
          key: '1',
          label: <span><CheckOutlined />تنظیمات امنیتی</span>,
          children: (
            <Card>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="سیاست رمز عبور" size="small">
                    <p>حداقل طول: {settings?.passwordPolicy?.minLength || 8} کاراکتر</p>
                    <p>پیچیدگی: متوسط</p>
                    <Progress percent={85} status="active" />
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card 
                    title={
                      <span>
                        <SafetyOutlined /> احراز هویت دو مرحله‌ای
                      </span>
                    } 
                    size="small"
                    extra={
                      <Switch
                        checked={twoFactorEnabled}
                        onChange={(checked) => {
                          if (checked) {
                            setShow2FASetup(true)
                          } else {
                            setTwoFactorEnabled(false)
                            message.success('احراز هویت دو مرحله‌ای غیرفعال شد')
                          }
                        }}
                      />
                    }
                  >
                    <p>وضعیت: {twoFactorEnabled ? 'فعال' : 'غیرفعال'}</p>
                    <p>روش: {twoFactorEnabled ? 'اپلیکیشن احراز هویت' : 'تنظیم نشده'}</p>
                    {!twoFactorEnabled && (
                      <Button 
                        type="primary" 
                        size="small"
                        icon={<MobileOutlined />}
                        onClick={() => setShow2FASetup(true)}
                      >
                        راه‌اندازی 2FA
                      </Button>
                    )}
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="نظارت امنیتی" size="small">
                    <p>ثبت رویدادها: فعال</p>
                    <p>هشدارهای خودکار: فعال</p>
                    <Progress percent={92} status="active" />
                  </Card>
                </Col>
              </Row>
            </Card>
          )
        },
        {
          key: '2', 
          label: <span><BankOutlined />پشتیبان‌گیری</span>,
          children: (
            <Card>
              <Table 
                dataSource={backups}
                columns={backupColumns}
                size="small"
                pagination={false}
              />
            </Card>
          )
        },
        {
          key: '3',
          label: <span><AuditOutlined />حوادث امنیتی</span>,
          children: (
            <Card>
              <Table 
                dataSource={incidents}
                columns={incidentColumns}
                size="small"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          )
        }
      ]} />

      <Modal
        title="راه‌اندازی احراز هویت دو مرحله‌ای"
        open={show2FASetup}
        onCancel={() => setShow2FASetup(false)}
        footer={null}
        width={700}
        centered
      >
        <TwoFactorSetup
          userId="current-user"
          onSetupComplete={(method, data) => {
            console.log('2FA Setup completed:', { method, data })
            setTwoFactorEnabled(true)
            setShow2FASetup(false)
            message.success(`احراز هویت دو مرحله‌ای با روش ${method} فعال شد`)
          }}
          onCancel={() => setShow2FASetup(false)}
        />
      </Modal>
    </div>
  );
}
