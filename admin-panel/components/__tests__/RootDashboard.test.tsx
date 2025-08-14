import { render, screen } from '@testing-library/react'
import { ConfigProvider } from 'antd'
import RootDashboard from '../RootDashboard'

// Mock the dashboard data hook
jest.mock('../../hooks/useDashboardDataOptimized', () => ({
  __esModule: true,
  default: () => ({
    dashboardData: {
      stats: {
        totalRevenue: 125000,
        totalOrders: 1250,
        activeCustomers: 890,
        averageOrderValue: 100
      }
    },
    loading: false,
    error: null,
    refetch: jest.fn()
  })
}))

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ConfigProvider direction="rtl">
      {ui}
    </ConfigProvider>
  )
}

describe('RootDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders layout without crashing', () => {
    const { container } = renderWithProviders(<RootDashboard><div>Test Content</div></RootDashboard>)
    
    // Check if component renders without errors
    expect(container).toBeInTheDocument()
  })

  it('displays brand name', () => {
    renderWithProviders(<RootDashboard><div>Test Content</div></RootDashboard>)
    
    // Check for brand name
    expect(screen.getByText('A-DROP')).toBeInTheDocument()
  })

  it('shows navigation menu items', () => {
    renderWithProviders(<RootDashboard><div>Test Content</div></RootDashboard>)
    
    // Check for main navigation items
    expect(screen.getByText('داشبرد')).toBeInTheDocument()
    expect(screen.getByText('سفارشات')).toBeInTheDocument()
    expect(screen.getByText('منو')).toBeInTheDocument()
  })

  it('has proper layout structure', () => {
    const { container } = renderWithProviders(<RootDashboard><div>Test Content</div></RootDashboard>)
    
    // Check Ant Design layout classes
    expect(container.querySelector('.ant-layout')).toBeInTheDocument()
    expect(container.querySelector('.ant-layout-sider')).toBeInTheDocument()
  })
})
