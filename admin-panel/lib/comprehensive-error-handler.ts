/**
 * Comprehensive Error Handler for A-DROP Admin Panel
 * 
 * این فایل تمام خطاهای احتمالی کنسول را شناسایی و مدیریت می‌کند:
 * - Hydration Errors
 * - Ant Design Context Warnings
 * - ProComponents Locale Issues
 * - MetaMask Connection Errors
 * - Console Warnings and Errors
 * - Performance Issues
 */

interface ErrorConfig {
  enabled: boolean
  logToConsole: boolean
  logToServer: boolean
  suppressInProduction: boolean
}

interface ErrorHandlerOptions {
  hydration: ErrorConfig
  antdWarnings: ErrorConfig
  metamask: ErrorConfig
  performance: ErrorConfig
  general: ErrorConfig
}

class ComprehensiveErrorHandler {
  private originalConsoleError: typeof console.error
  private originalConsoleWarn: typeof console.warn
  private originalConsoleLog: typeof console.log
  private config: ErrorHandlerOptions
  private errorCounts: Record<string, number> = {}
  private isDevelopment: boolean

  constructor(options?: Partial<ErrorHandlerOptions>) {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    
    // Default configuration
    this.config = {
      hydration: {
        enabled: true,
        logToConsole: false,
        logToServer: false,
        suppressInProduction: true
      },
      antdWarnings: {
        enabled: true,
        logToConsole: false,
        logToServer: false,
        suppressInProduction: true
      },
      metamask: {
        enabled: true,
        logToConsole: false,
        logToServer: false,
        suppressInProduction: true
      },
      performance: {
        enabled: true,
        logToConsole: false,
        logToServer: false,
        suppressInProduction: true
      },
      general: {
        enabled: true,
        logToConsole: false,
        logToServer: false,
        suppressInProduction: true
      },
      ...options
    }

    // Store original console methods
    this.originalConsoleError = console.error
    this.originalConsoleWarn = console.warn
    this.originalConsoleLog = console.log

    this.init()
  }

  private init(): void {
    this.setupConsoleOverrides()
    this.setupUnhandledRejectionHandler()
    this.setupErrorEventHandler()
    this.setupHydrationErrorHandler()
    this.setupPerformanceMonitoring()
  }

  private setupConsoleOverrides(): void {
    // Override console.error
    console.error = (...args: any[]) => {
      const errorMessage = args.join(' ')
      const errorType = this.categorizeError(errorMessage)
      
      if (this.shouldSuppressError(errorType, errorMessage)) {
        return
      }

      this.logError(errorType, errorMessage, args)
      this.originalConsoleError.apply(console, args)
    }

    // Override console.warn
    console.warn = (...args: any[]) => {
      const warningMessage = args.join(' ')
      const errorType = this.categorizeError(warningMessage)
      
      if (this.shouldSuppressError(errorType, warningMessage)) {
        return
      }

      this.logWarning(errorType, warningMessage, args)
      this.originalConsoleWarn.apply(console, args)
    }
  }

  private categorizeError(message: string): keyof ErrorHandlerOptions {
    // Hydration errors
    if (
      message.includes('Hydration failed') ||
      message.includes('className did not match') ||
      message.includes('Text content does not match') ||
      message.includes('initial UI does not match') ||
      message.includes('SSR') ||
      message.includes('server-side')
    ) {
      return 'hydration'
    }

    // Ant Design warnings
    if (
      message.includes('[antd:') ||
      message.includes('Static function can not consume context') ||
      message.includes('Prop `className` did not match') ||
      message.includes('ant-') ||
      message.includes('@ant-design') ||
      message.includes('ProComponents')
    ) {
      return 'antdWarnings'
    }

    // MetaMask errors
    if (
      message.includes('MetaMask') ||
      message.includes('ethereum') ||
      message.includes('web3') ||
      message.includes('wallet') ||
      message.includes('crypto') ||
      message.includes('blockchain')
    ) {
      return 'metamask'
    }

    // Performance issues
    if (
      message.includes('performance') ||
      message.includes('memory') ||
      message.includes('bundle') ||
      message.includes('chunk') ||
      message.includes('optimization')
    ) {
      return 'performance'
    }

    return 'general'
  }

  private shouldSuppressError(errorType: keyof ErrorHandlerOptions, message: string): boolean {
    const config = this.config[errorType]
    
    if (!config.enabled) {
      return true
    }

    if (!this.isDevelopment && config.suppressInProduction) {
      return true
    }

    // Specific suppressions
    const suppressedPatterns = [
      // MetaMask specific
      'MetaMask detected another web3',
      'ethereum.request',
      'wallet_requestPermissions',
      
      // Common development warnings
      'Download the React DevTools',
      'React DevTools',
      
      // Performance warnings in development
      'chunk',
      'webpack-internal',
      
      // Ant Design locale warnings that we can't fix
      'Warning: [antd: message] Static function',
      'Warning: [antd: notification] Static function',
      'Warning: [antd: modal] Static function',
      
      // Chinese warnings from Ant Design Pro components
      '只在 form 初始化时生效',
      'initialValues 只在',
      '只在',
      '中文',
      '異步加載',
      '初始化'
    ]

    // Check for Chinese characters
    if (/[\u4e00-\u9fff]/.test(message)) {
      return true
    }

    return suppressedPatterns.some(pattern => message.includes(pattern))
  }

  private logError(type: keyof ErrorHandlerOptions, message: string, args: any[]): void {
    this.incrementErrorCount(type)
    
    const config = this.config[type]
    
    if (config.logToConsole && this.isDevelopment) {
      this.originalConsoleError(`[${type.toUpperCase()}]`, message)
    }

    if (config.logToServer) {
      this.sendToServer('error', type, message, args)
    }
  }

  private logWarning(type: keyof ErrorHandlerOptions, message: string, args: any[]): void {
    this.incrementErrorCount(type)
    
    const config = this.config[type]
    
    if (config.logToConsole && this.isDevelopment) {
      this.originalConsoleWarn(`[${type.toUpperCase()}]`, message)
    }

    if (config.logToServer) {
      this.sendToServer('warning', type, message, args)
    }
  }

  private incrementErrorCount(type: string): void {
    this.errorCounts[type] = (this.errorCounts[type] || 0) + 1
  }

  private setupUnhandledRejectionHandler(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        const errorMessage = event.reason?.message || event.reason?.toString() || 'Unknown rejection'
        const errorType = this.categorizeError(errorMessage)
        
        if (this.shouldSuppressError(errorType, errorMessage)) {
          event.preventDefault()
          return
        }

        this.logError(errorType, `Unhandled Rejection: ${errorMessage}`, [event.reason])
      })
    }
  }

  private setupErrorEventHandler(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        const errorMessage = event.message || event.error?.message || 'Unknown error'
        const errorType = this.categorizeError(errorMessage)
        
        if (this.shouldSuppressError(errorType, errorMessage)) {
          event.preventDefault()
          return
        }

        this.logError(errorType, `Window Error: ${errorMessage}`, [event.error])
      })
    }
  }

  private setupHydrationErrorHandler(): void {
    if (typeof window !== 'undefined') {
      // Monitor for hydration mismatches specifically
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target as Element
            if (target.className?.includes('ant-')) {
              // Potential hydration mismatch in Ant Design components
              this.logWarning('hydration', `Potential className hydration mismatch detected on ${target.tagName}`, [target])
            }
          }
        })
      })

      // Start observing after initial render
      setTimeout(() => {
        observer.observe(document.body, {
          attributes: true,
          subtree: true,
          attributeFilter: ['class']
        })
      }, 1000)
    }
  }

  private setupPerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Monitor Long Tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.logWarning('performance', `Long Task detected: ${entry.duration}ms`, [entry])
            }
          })
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // PerformanceObserver not supported
      }

      // Monitor Layout Shifts
      try {
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (entry.value > 0.1) { // CLS threshold
              this.logWarning('performance', `Layout Shift detected: ${entry.value}`, [entry])
            }
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        // Not supported
      }
    }
  }

  private sendToServer(level: 'error' | 'warning', type: string, message: string, args: any[]): void {
    // In a real application, you would send this to your logging service
    if (this.isDevelopment) {
      return
    }

    try {
      fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          type,
          message,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          errorCounts: this.errorCounts
        })
      }).catch(() => {
        // Silently fail if logging service is unavailable
      })
    } catch (e) {
      // Silently fail
    }
  }

  public getErrorStats(): Record<string, number> {
    return { ...this.errorCounts }
  }

  public clearErrorStats(): void {
    this.errorCounts = {}
  }

  public updateConfig(newConfig: Partial<ErrorHandlerOptions>): void {
    this.config = { ...this.config, ...newConfig }
  }

  public destroy(): void {
    // Restore original console methods
    console.error = this.originalConsoleError
    console.warn = this.originalConsoleWarn
    console.log = this.originalConsoleLog
  }
}

// Create singleton instance
const errorHandler = new ComprehensiveErrorHandler()

// Export both the class and the instance
export { ComprehensiveErrorHandler, errorHandler }
export default errorHandler
