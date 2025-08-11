'use client'

import React from 'react'
import { Skeleton, Card, Row, Col } from 'antd'

export const DashboardSkeleton: React.FC = () => {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5' }}>
      {/* Header Skeleton */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Skeleton.Input style={{ width: 200, height: 32 }} active />
          </Col>
          <Col>
            <Skeleton.Input style={{ width: 300, height: 32 }} active />
          </Col>
        </Row>
      </div>

      {/* Stats Cards Skeleton */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[1, 2, 3, 4].map(item => (
          <Col xs={12} sm={12} md={6} lg={6} xl={6} key={item}>
            <Card>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions and Notifications Skeleton */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={24} md={16} lg={16} xl={16}>
          <Card title={<Skeleton.Input style={{ width: 100 }} active />}>
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4, 5, 6].map(item => (
                <Col xs={12} sm={8} md={8} lg={8} xl={4} key={item}>
                  <Skeleton.Button style={{ width: '100%', height: 80 }} active />
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card title={<Skeleton.Input style={{ width: 80 }} active />}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </Card>
        </Col>
      </Row>

      {/* Charts Skeleton */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card title={<Skeleton.Input style={{ width: 150 }} active />}>
            <Skeleton.Button style={{ width: '100%', height: 300 }} active />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card title={<Skeleton.Input style={{ width: 120 }} active />}>
            <Skeleton.Button style={{ width: '100%', height: 300 }} active />
          </Card>
        </Col>
      </Row>

      {/* Second Row Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card title={<Skeleton.Input style={{ width: 140 }} active />}>
            <Skeleton.Button style={{ width: '100%', height: 300 }} active />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card title={<Skeleton.Input style={{ width: 100 }} active />}>
            <Skeleton.Button style={{ width: '100%', height: 300 }} active />
          </Card>
        </Col>
      </Row>

      {/* Orders Table Skeleton */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title={<Skeleton.Input style={{ width: 120 }} active />}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => (
  <div style={{ width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Skeleton.Button active style={{ width: '100%', height: '100%' }} />
  </div>
)

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div>
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 0]} align="middle">
          <Col span={3}>
            <Skeleton.Avatar active />
          </Col>
          <Col span={4}>
            <Skeleton.Input style={{ width: '100%' }} active />
          </Col>
          <Col span={6}>
            <Skeleton.Input style={{ width: '100%' }} active />
          </Col>
          <Col span={3}>
            <Skeleton.Input style={{ width: '100%' }} active />
          </Col>
          <Col span={2}>
            <Skeleton.Button style={{ width: '100%' }} active />
          </Col>
          <Col span={3}>
            <Skeleton.Button style={{ width: '100%' }} active />
          </Col>
          <Col span={3}>
            <Skeleton.Button style={{ width: '100%' }} active />
          </Col>
        </Row>
      </div>
    ))}
  </div>
)

export const StatCardSkeleton: React.FC = () => (
  <Card>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <Skeleton.Input style={{ width: 80, height: 16, marginBottom: 8 }} active />
        <Skeleton.Input style={{ width: 120, height: 24 }} active />
      </div>
      <Skeleton.Avatar shape="square" size={40} active />
    </div>
  </Card>
)
