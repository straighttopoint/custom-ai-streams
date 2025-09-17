// Security utilities and validation functions
import DOMPurify from 'dompurify';

// Input validation patterns
export const ValidationPatterns = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  NAME: /^[a-zA-Z\s'-]{2,50}$/,
  COMPANY: /^[a-zA-Z0-9\s&.,'-]{2,100}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  SOCIAL_HANDLE: /^@?[a-zA-Z0-9_]{1,30}$/,
} as const;

// Security error types
export class SecurityError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

// Input sanitization
export const sanitizeInput = {
  text: (input: string): string => {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] });
  },
  
  html: (input: string): string => {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input.trim(), {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });
  },
  
  email: (input: string): string => {
    const sanitized = sanitizeInput.text(input).toLowerCase();
    if (!ValidationPatterns.EMAIL.test(sanitized)) {
      throw new SecurityError('Invalid email format', 'INVALID_EMAIL');
    }
    return sanitized;
  },
  
  phone: (input: string): string => {
    const sanitized = sanitizeInput.text(input).replace(/[^\d\+\-\(\)\s]/g, '');
    if (!ValidationPatterns.PHONE.test(sanitized)) {
      throw new SecurityError('Invalid phone format', 'INVALID_PHONE');
    }
    return sanitized;
  },
  
  url: (input: string): string => {
    const sanitized = sanitizeInput.text(input);
    if (sanitized && !ValidationPatterns.URL.test(sanitized)) {
      throw new SecurityError('Invalid URL format', 'INVALID_URL');
    }
    return sanitized;
  },
  
  socialHandle: (input: string): string => {
    const sanitized = sanitizeInput.text(input);
    if (sanitized && !ValidationPatterns.SOCIAL_HANDLE.test(sanitized)) {
      throw new SecurityError('Invalid social handle format', 'INVALID_SOCIAL_HANDLE');
    }
    return sanitized;
  }
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  // Check for common patterns
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password contains common words or patterns');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting utility
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isBlocked(identifier: string): boolean {
    const record = this.attempts.get(identifier);
    if (!record) return false;
    
    if (Date.now() > record.resetTime) {
      this.attempts.delete(identifier);
      return false;
    }
    
    return record.count >= this.maxAttempts;
  }
  
  recordAttempt(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }
    
    record.count++;
    const isBlocked = record.count >= this.maxAttempts;
    
    if (isBlocked) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { identifier, attempts: record.count });
    }
    
    return isBlocked;
  }
  
  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return 0;
    
    return Math.max(0, record.resetTime - Date.now());
  }
}

// Security event logging
export const logSecurityEvent = (event: string, details: Record<string, any>) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href,
    sessionId: sessionStorage.getItem('session_id') || 'anonymous'
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('Security Event:', logEntry);
  }
  
  // In production, send to monitoring service
  // This could be sent to Supabase Edge Functions for processing
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/security-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    }).catch(err => console.error('Failed to log security event:', err));
  }
};

// Create rate limiter instances
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute

// Security headers helper
export const getSecurityHeaders = (): Record<string, string> => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
});

// Input validation for forms
export const validateFormInput = (field: string, value: string, required = true): string | null => {
  if (required && (!value || value.trim().length === 0)) {
    return `${field} is required`;
  }
  
  if (!value) return null;
  
  try {
    switch (field.toLowerCase()) {
      case 'email':
        sanitizeInput.email(value);
        break;
      case 'phone':
        sanitizeInput.phone(value);
        break;
      case 'name':
      case 'full_name':
      case 'fullname':
        if (!ValidationPatterns.NAME.test(value)) {
          return 'Name contains invalid characters';
        }
        break;
      case 'company':
        if (!ValidationPatterns.COMPANY.test(value)) {
          return 'Company name contains invalid characters';
        }
        break;
      case 'website_url':
      case 'url':
        sanitizeInput.url(value);
        break;
      case 'instagram_handle':
      case 'twitter_handle':
      case 'linkedin_profile':
        sanitizeInput.socialHandle(value);
        break;
      default:
        // Generic text validation
        if (value.length > 1000) {
          return `${field} is too long (maximum 1000 characters)`;
        }
        break;
    }
    return null;
  } catch (error) {
    if (error instanceof SecurityError) {
      return error.message;
    }
    return `Invalid ${field} format`;
  }
};

// CSRF token generation and validation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken || token.length !== storedToken.length) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }
  
  return result === 0;
};