// Data Export API
import { NextRequest, NextResponse } from 'next/server';
import { AdvancedAnalyticsEngine } from '../../../../lib/advanced-analytics';

const analyticsEngine = new AdvancedAnalyticsEngine();

// GET - دانلود فایل صادرات
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('reportId');
    const format = searchParams.get('format') as 'excel' | 'pdf' | 'csv';

    if (!reportId || !format) {
      return NextResponse.json({ 
        error: 'شناسه گزارش و فرمت الزامی است' 
      }, { status: 400 });
    }

    if (!['excel', 'pdf', 'csv'].includes(format)) {
      return NextResponse.json({ 
        error: 'فرمت نامعتبر است' 
      }, { status: 400 });
    }

    const filePath = await analyticsEngine.exportData(reportId, format);
    
    return NextResponse.json({ 
      success: true, 
      downloadUrl: filePath,
      message: `فایل ${format.toUpperCase()} آماده دانلود است`
    });
  } catch (error) {
    console.error('Export API Error:', error);
    return NextResponse.json({ 
      error: 'خطا در صادرات داده‌ها' 
    }, { status: 500 });
  }
}

// POST - درخواست صادرات با تنظیمات سفارشی
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, format, customFilters, dateRange, columns } = body;

    if (!reportId || !format) {
      return NextResponse.json({ 
        error: 'شناسه گزارش و فرمت الزامی است' 
      }, { status: 400 });
    }

    // If custom filters are provided, create a temporary report
    let finalReportId = reportId;
    
    if (customFilters || dateRange || columns) {
      const report = analyticsEngine.getReport(reportId);
      if (!report) {
        return NextResponse.json({ 
          error: 'گزارش یافت نشد' 
        }, { status: 404 });
      }

      // Create temporary report with custom settings
      const tempReportConfig = {
        ...report,
        name: `${report.name}_custom_export`,
        filters: customFilters || report.filters,
        dateRange: dateRange || report.dateRange,
        // Add column selection logic here
      };

      finalReportId = analyticsEngine.createReport(tempReportConfig);
    }

    const filePath = await analyticsEngine.exportData(finalReportId, format);
    
    // Clean up temporary report if created
    if (finalReportId !== reportId) {
      analyticsEngine.deleteReport(finalReportId);
    }

    return NextResponse.json({ 
      success: true, 
      downloadUrl: filePath,
      message: `فایل ${format.toUpperCase()} با تنظیمات سفارشی آماده دانلود است`
    });
  } catch (error) {
    console.error('Export API Error:', error);
    return NextResponse.json({ 
      error: 'خطا در صادرات سفارشی' 
    }, { status: 500 });
  }
}
