// Rate Limiting Utility
// محدودیت تعداد درخواست برای جلوگیری از حملات brute force

class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 5 attempts per 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      // First attempt
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (now > attempt.resetTime) {
      // Reset window
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      // Too many attempts
      return false;
    }

    // Increment attempt count
    attempt.count++;
    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt || Date.now() > attempt.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - attempt.count);
  }

  getResetTime(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt || Date.now() > attempt.resetTime) {
      return 0;
    }
    return attempt.resetTime;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, attempt] of this.attempts.entries()) {
      if (now > attempt.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

// Export singleton instance
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute

// Helper function to get client identifier
export function getClientIdentifier(request: Request): string {
  // Use IP address as identifier
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Cleanup old entries every 30 minutes
setInterval(() => {
  loginRateLimiter.cleanup();
  apiRateLimiter.cleanup();
}, 30 * 60 * 1000);
