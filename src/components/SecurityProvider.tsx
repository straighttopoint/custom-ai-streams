import React, { createContext, useContext, useEffect, useState } from 'react';
import { generateCSRFToken, logSecurityEvent } from '@/lib/security';

interface SecurityContextType {
  csrfToken: string;
  refreshCSRFToken: () => void;
  reportSuspiciousActivity: (details: Record<string, any>) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }: { children: React.ReactNode }) => {
  const [csrfToken, setCSRFToken] = useState(() => generateCSRFToken());

  useEffect(() => {
    // Generate session ID for tracking
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', generateCSRFToken());
    }

    // Log session start
    logSecurityEvent('SESSION_START', {
      timestamp: new Date().toISOString()
    });

    // Set up security monitoring
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        logSecurityEvent('TAB_FOCUS', { timestamp: new Date().toISOString() });
      }
    };

    const handleBeforeUnload = () => {
      logSecurityEvent('SESSION_END', { timestamp: new Date().toISOString() });
    };

    // Monitor for suspicious activities
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detect potential key loggers or automation
      if (event.isTrusted === false) {
        reportSuspiciousActivity({ 
          type: 'UNTRUSTED_KEYDOWN',
          key: event.key,
          timestamp: new Date().toISOString()
        });
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      // Log right-click events (potential debugging attempts)
      if (process.env.NODE_ENV === 'production') {
        logSecurityEvent('CONTEXT_MENU_ACCESS', {
          timestamp: new Date().toISOString(),
          x: event.clientX,
          y: event.clientY
        });
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    // Refresh CSRF token periodically
    const tokenRefreshInterval = setInterval(() => {
      setCSRFToken(generateCSRFToken());
    }, 30 * 60 * 1000); // Every 30 minutes

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  const refreshCSRFToken = () => {
    setCSRFToken(generateCSRFToken());
  };

  const reportSuspiciousActivity = (details: Record<string, any>) => {
    logSecurityEvent('SUSPICIOUS_ACTIVITY', {
      ...details,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <SecurityContext.Provider value={{
      csrfToken,
      refreshCSRFToken,
      reportSuspiciousActivity
    }}>
      {children}
    </SecurityContext.Provider>
  );
};