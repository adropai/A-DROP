'use client'

import React from 'react'
import { Card, Skeleton, Row, Col, Space } from 'antd'

export const DashboardSkeleton: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      {/* Stats Cards Skeleton */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card>
              <Skeleton.Input active style={{ width: '100%', height: 60 }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Skeleton */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={<Skeleton.Input active style={{ width: 150 }} />}>
            <Skeleton.Input active style={{ width: '100%', height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<Skeleton.Input active style={{ width: 120 }} />}>
            <Skeleton.Input active style={{ width: '100%', height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* Table Skeleton */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={<Skeleton.Input active style={{ width: 100 }} />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton.Input key={i} active style={{ width: '100%', height: 40 }} />
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export const CardSkeleton: React.FC = () => {
  return (
    <Card>
      <Skeleton active paragraph={{ rows: 3 }} />
    </Card>
  )
}

export const TableSkeleton: React.FC = () => {
  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton.Input key={i} active style={{ width: '100%', height: 40 }} />
        ))}
      </Space>
    </Card>
  )
}

export const ChartSkeleton: React.FC = () => {
  return (
    <Card>
      <Skeleton.Input active style={{ width: '100%', height: 300 }} />
    </Card>
  )
}
