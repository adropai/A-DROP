// Performance monitoring and optimization utilities
import React from 'react';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure component render time
  measureRender(componentName: string, renderFn: () => void) {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    
    this.metrics.set(`${componentName}_render`, end - start);
    
    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && (end - start) > 16) {
      console.warn(`🐌 Slow render detected: ${componentName} took ${(end - start).toFixed(2)}ms`);
    }
  }

  // Measure API call time
  async measureAPI<T>(apiName: string, apiCall: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      
      this.metrics.set(`${apiName}_api`, end - start);
      
      // Log slow API calls
      if (end - start > 1000) {
        console.warn(`🐌 Slow API call: ${apiName} took ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      this.metrics.set(`${apiName}_api_error`, end - start);
      throw error;
    }
  }

  // Get performance metrics
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Log performance summary
  logSummary() {
    const metrics = this.getMetrics();
    console.group('📊 Performance Summary');
    
    Object.entries(metrics).forEach(([key, value]) => {
      const time = typeof value === 'number' ? value.toFixed(2) : value;
      console.log(`${key}: ${time}ms`);
    });
    
    console.groupEnd();
  }
}

// React component performance wrapper
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  return function PerformanceWrapper(props: P) {
    const monitor = PerformanceMonitor.getInstance();
    
    React.useEffect(() => {
      monitor.measureRender(displayName, () => {
        // Render measurement is handled by React DevTools
      });
    });
    
    return React.createElement(WrappedComponent, props);
  };
}

// Memory usage monitoring
export class MemoryMonitor {
  static logMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.group('🧠 Memory Usage');
      console.log(`Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
      console.groupEnd();
    }
  }
  
  static isMemoryPressure(): boolean {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      return usageRatio > 0.8; // 80% memory usage threshold
    }
    return false;
  }
}

// Image optimization helper
export const optimizeImage = (src: string, width?: number, quality = 75) => {
  if (!src) return src;
  
  // For Next.js Image component optimization
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  params.set('q', quality.toString());
  
  return `${src}?${params.toString()}`;
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    import('webpack-bundle-analyzer').then(({ BundleAnalyzerPlugin }) => {
      console.log('📦 Bundle analyzer available in development mode');
    }).catch(() => {
      console.log('📦 Install webpack-bundle-analyzer for bundle analysis');
    });
  }
};

// Performance timing helper
export const logNavigationTiming = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        console.group('⏱️ Navigation Timing');
        console.log(`DNS Lookup: ${timing.domainLookupEnd - timing.domainLookupStart}ms`);
        console.log(`TCP Connection: ${timing.connectEnd - timing.connectStart}ms`);
        console.log(`Request: ${timing.responseStart - timing.requestStart}ms`);
        console.log(`Response: ${timing.responseEnd - timing.responseStart}ms`);
        console.log(`DOM Load: ${timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart}ms`);
        console.log(`Total Load: ${timing.loadEventEnd - timing.loadEventStart}ms`);
        console.groupEnd();
      }, 1000);
    });
  }
};
