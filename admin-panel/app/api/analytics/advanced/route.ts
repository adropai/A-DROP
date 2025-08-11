// Advanced Analytics API
import { NextRequest, NextResponse } from 'next/server';
import { AdvancedAnalyticsEngine, ReportConfig, DateRange } from '../../../../lib/advanced-analytics';

const analyticsEngine = new AdvancedAnalyticsEngine();

// GET - دریافت گزارشات یا متریک‌ها
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const reportId = searchParams.get('reportId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const branchId = searchParams.get('branchId');

    // تعریف محدوده زمانی
    const dateRange: DateRange = {
      from: dateFrom ? new Date(dateFrom) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: dateTo ? new Date(dateTo) : new Date()
    };

    switch (type) {
      case 'reports':
        const reports = analyticsEngine.getAllReports();
        return NextResponse.json(reports);

      case 'report':
        if (!reportId) {
          return NextResponse.json({ error: 'شناسه گزارش الزامی است' }, { status: 400 });
        }
        const reportData = await analyticsEngine.generateReport(reportId);
        return NextResponse.json(reportData);

      case 'sales-metrics':
        const salesMetrics = await analyticsEngine.getSalesMetrics(dateRange, branchId || undefined);
        return NextResponse.json(salesMetrics);

      case 'customer-metrics':
        const customerMetrics = await analyticsEngine.getCustomerMetrics(dateRange);
        return NextResponse.json(customerMetrics);

      case 'forecast':
        const metric = searchParams.get('metric') || 'sales';
        const periods = parseInt(searchParams.get('periods') || '30');
        const forecast = await analyticsEngine.generateForecast(metric, periods);
        return NextResponse.json(forecast);

      case 'comparison':
        const comparisonMetric = searchParams.get('metric') || 'sales';
        const periodsArray = searchParams.get('periods')?.split(',') || ['current', 'previous'];
        const comparison = await analyticsEngine.compareMetrics(comparisonMetric, periodsArray);
        return NextResponse.json(comparison);

      case 'insights':
        const insights = await analyticsEngine.getRealTimeInsights();
        return NextResponse.json(insights);

      case 'dashboard':
        const dashboardId = searchParams.get('dashboardId');
        if (!dashboardId) {
          return NextResponse.json({ error: 'شناسه داشبورد الزامی است' }, { status: 400 });
        }
        const dashboardData = await analyticsEngine.getDashboardData(dashboardId);
        return NextResponse.json(dashboardData);

      default:
        return NextResponse.json({ error: 'نوع درخواست نامعتبر است' }, { status: 400 });
    }
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ 
      error: 'خطا در دریافت اطلاعات تحلیلی' 
    }, { status: 500 });
  }
}

// POST - ایجاد گزارش جدید
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    switch (type) {
      case 'report':
        const { name, description, reportType, dataSource, filters, groupBy, sortBy, chartType, dateRange, isScheduled, scheduleConfig } = body;
        
        if (!name || !reportType || !dataSource) {
          return NextResponse.json({ 
            error: 'اطلاعات گزارش ناقص است' 
          }, { status: 400 });
        }

        const reportConfig: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt'> = {
          name,
          description: description || '',
          type: reportType,
          dataSource: Array.isArray(dataSource) ? dataSource : [dataSource],
          filters: filters || [],
          groupBy: groupBy || [],
          sortBy: sortBy || [],
          chartType,
          dateRange: {
            from: new Date(dateRange.from),
            to: new Date(dateRange.to),
            preset: dateRange.preset
          },
          refreshInterval: body.refreshInterval || 15,
          isScheduled: isScheduled || false,
          scheduleConfig,
          createdBy: body.createdBy || 'system'
        };

        const reportId = analyticsEngine.createReport(reportConfig);
        const newReport = analyticsEngine.getReport(reportId);

        return NextResponse.json({ 
          success: true, 
          reportId, 
          report: newReport 
        }, { status: 201 });

      case 'dashboard':
        const { widgets } = body;
        if (!widgets || !Array.isArray(widgets)) {
          return NextResponse.json({ 
            error: 'ویجت‌های داشبورد الزامی است' 
          }, { status: 400 });
        }

        const dashboardId = await analyticsEngine.createDashboard(widgets);
        return NextResponse.json({ 
          success: true, 
          dashboardId 
        }, { status: 201 });

      default:
        return NextResponse.json({ 
          error: 'نوع عملیات نامعتبر است' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ 
      error: 'خطا در ایجاد گزارش' 
    }, { status: 500 });
  }
}

// PUT - بروزرسانی گزارش
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, updates } = body;

    if (!reportId) {
      return NextResponse.json({ 
        error: 'شناسه گزارش الزامی است' 
      }, { status: 400 });
    }

    const success = analyticsEngine.updateReport(reportId, updates);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'گزارش یافت نشد' 
      }, { status: 404 });
    }

    const updatedReport = analyticsEngine.getReport(reportId);
    return NextResponse.json({ 
      success: true, 
      report: updatedReport 
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ 
      error: 'خطا در بروزرسانی گزارش' 
    }, { status: 500 });
  }
}

// DELETE - حذف گزارش
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return NextResponse.json({ 
        error: 'شناسه گزارش الزامی است' 
      }, { status: 400 });
    }

    const success = analyticsEngine.deleteReport(reportId);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'گزارش یافت نشد' 
      }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ 
      error: 'خطا در حذف گزارش' 
    }, { status: 500 });
  }
}
