// React Hook for Advanced Analytics
import { useState, useEffect } from 'react';
import { AnalyticsMetric, ReportConfig, DateRange, ForecastData, ComparisonData } from '../lib/advanced-analytics';

export function useAdvancedAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generic fetch function
  async function fetchAnalytics(endpoint: string, params: Record<string, any> = {}) {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/analytics/advanced?${searchParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در دریافت اطلاعات');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطای ناشناخته';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Get sales metrics
  async function getSalesMetrics(dateRange: DateRange, branchId?: string): Promise<AnalyticsMetric[]> {
    return await fetchAnalytics('', {
      type: 'sales-metrics',
      dateFrom: dateRange.from.toISOString(),
      dateTo: dateRange.to.toISOString(),
      branchId
    });
  }

  // Get customer metrics
  async function getCustomerMetrics(dateRange: DateRange): Promise<AnalyticsMetric[]> {
    return await fetchAnalytics('', {
      type: 'customer-metrics',
      dateFrom: dateRange.from.toISOString(),
      dateTo: dateRange.to.toISOString()
    });
  }

  // Get forecast data
  async function getForecast(metric: string, periods: number = 30): Promise<ForecastData[]> {
    return await fetchAnalytics('', {
      type: 'forecast',
      metric,
      periods
    });
  }

  // Get comparison data
  async function getComparison(metric: string, periods: string[]): Promise<ComparisonData[]> {
    return await fetchAnalytics('', {
      type: 'comparison',
      metric,
      periods: periods.join(',')
    });
  }

  // Get real-time insights
  async function getInsights(): Promise<string[]> {
    return await fetchAnalytics('', { type: 'insights' });
  }

  // Get all reports
  async function getReports(): Promise<ReportConfig[]> {
    return await fetchAnalytics('', { type: 'reports' });
  }

  // Generate specific report
  async function generateReport(reportId: string): Promise<any> {
    return await fetchAnalytics('', { type: 'report', reportId });
  }

  // Create new report
  async function createReport(reportConfig: Partial<ReportConfig>): Promise<{ reportId: string; report: ReportConfig }> {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'report', ...reportConfig })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در ایجاد گزارش');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطای ناشناخته';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Update report
  async function updateReport(reportId: string, updates: Partial<ReportConfig>): Promise<ReportConfig> {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/advanced', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, updates })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در بروزرسانی گزارش');
      }

      const result = await response.json();
      return result.report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطای ناشناخته';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Delete report
  async function deleteReport(reportId: string): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/advanced?reportId=${reportId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در حذف گزارش');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطای ناشناخته';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    getSalesMetrics,
    getCustomerMetrics,
    getForecast,
    getComparison,
    getInsights,
    getReports,
    generateReport,
    createReport,
    updateReport,
    deleteReport
  };
}

export function useDataExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Export report data
  async function exportReport(
    reportId: string, 
    format: 'excel' | 'pdf' | 'csv',
    customOptions?: {
      filters?: any[];
      dateRange?: DateRange;
      columns?: string[];
    }
  ): Promise<string> {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (customOptions) {
        // Use POST for custom export
        response = await fetch('/api/analytics/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportId,
            format,
            customFilters: customOptions.filters,
            dateRange: customOptions.dateRange,
            columns: customOptions.columns
          })
        });
      } else {
        // Use GET for simple export
        response = await fetch(`/api/analytics/export?reportId=${reportId}&format=${format}`);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در صادرات داده‌ها');
      }

      const result = await response.json();
      return result.downloadUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطای ناشناخته';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Download file
  function downloadFile(url: string, filename?: string) {
    const link = document.createElement('a');
    link.href = url;
    if (filename) {
      link.download = filename;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return {
    loading,
    error,
    exportReport,
    downloadFile
  };
}

export function useDashboard(dashboardId: string) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  async function loadDashboard() {
    if (!dashboardId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/advanced?type=dashboard&dashboardId=${dashboardId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در بارگذاری داشبورد');
      }

      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطای ناشناخته';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Refresh dashboard
  async function refreshDashboard() {
    await loadDashboard();
  }

  useEffect(() => {
    loadDashboard();
  }, [dashboardId]);

  return {
    dashboard,
    loading,
    error,
    refreshDashboard
  };
}
