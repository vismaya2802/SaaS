/**
 * sessionManager.js — Client-side session tracking for advanced analytics
 * Manages session IDs, page views, and event tracking with localStorage persistence
 */

import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'vf_session_id';
const SESSION_START_KEY = 'vf_session_start';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

class SessionManager {
  constructor() {
    this.sessionId = null;
    this.apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
    this.pageViews = 0;
    this.initialize();
  }

  /**
   * Initialize or restore session from localStorage
   */
  initialize() {
    const stored = localStorage.getItem(SESSION_KEY);
    const startTime = localStorage.getItem(SESSION_START_KEY);
    
    // Check if session expired (30 min timeout)
    if (stored && startTime) {
      const elapsed = Date.now() - parseInt(startTime, 10);
      if (elapsed < SESSION_TIMEOUT) {
        this.sessionId = stored;
        console.log('📊 Session restored:', this.sessionId);
        return;
      }
    }
    
    // Create new session
    this.createSession();
  }

  /**
   * Create a new session and register with backend
   */
  async createSession() {
    this.sessionId = uuidv4();
    localStorage.setItem(SESSION_KEY, this.sessionId);
    localStorage.setItem(SESSION_START_KEY, Date.now().toString());
    
    console.log('📊 New session created:', this.sessionId);
    
    // Register session with backend
    try {
      const response = await fetch(`${this.apiBaseUrl}/telemetry/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landing_page: window.location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        }),
      });
      
      if (!response.ok) {
        console.warn('Failed to register session with backend');
      }
    } catch (error) {
      console.warn('Session registration error:', error);
    }
  }

  /**
   * Get current session ID
   */
  getSessionId() {
    if (!this.sessionId) {
      this.initialize();
    }
    return this.sessionId;
  }

  /**
   * Update session activity (heartbeat)
   */
  async updateActivity() {
    if (!this.sessionId) return;
    
    try {
      await fetch(`${this.apiBaseUrl}/telemetry/session/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionId,
          last_activity_at: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.warn('Session update error:', error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView(path) {
    this.pageViews++;
    
    if (!this.sessionId) return;
    
    try {
      await fetch(`${this.apiBaseUrl}/telemetry/session/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionId,
          page_views: this.pageViews,
        }),
      });
    } catch (error) {
      console.warn('Page view tracking error:', error);
    }
  }

  /**
   * Track funnel stage
   */
  async trackFunnel(stage, productId = null, metadata = null) {
    if (!this.sessionId) return;
    
    try {
      const payload = {
        session_id: this.sessionId,
        funnel_stage: stage,
        product_id: productId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      };
      
      const user = JSON.parse(localStorage.getItem('vf_user') || '{}');
      if (user.id) {
        payload.user_id = user.id;
      }
      
      await fetch(`${this.apiBaseUrl}/telemetry/funnel/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      console.log('📊 Funnel tracked:', stage);
    } catch (error) {
      console.warn('Funnel tracking error:', error);
    }
  }

  /**
   * Track heatmap event (click, mousemove, scroll)
   */
  async trackHeatmap(eventType, x, y, elementId = null, elementClass = null) {
    if (!this.sessionId) return;
    
    try {
      await fetch(`${this.apiBaseUrl}/telemetry/heatmap/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionId,
          page_path: window.location.pathname,
          event_type: eventType,
          x_coordinate: x,
          y_coordinate: y,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
          element_id: elementId,
          element_class: elementClass,
        }),
      });
    } catch (error) {
      console.warn('Heatmap tracking error:', error);
    }
  }

  /**
   * Mark session as converted (user made a purchase)
   */
  async markConverted() {
    if (!this.sessionId) return;
    
    try {
      await fetch(`${this.apiBaseUrl}/telemetry/session/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionId,
          converted: true,
        }),
      });
      
      console.log('📊 Session marked as converted');
    } catch (error) {
      console.warn('Conversion tracking error:', error);
    }
  }

  /**
   * End current session
   */
  async endSession() {
    if (!this.sessionId) return;
    
    try {
      await fetch(`${this.apiBaseUrl}/telemetry/session/${this.sessionId}/end`, {
        method: 'POST',
      });
      
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_START_KEY);
      this.sessionId = null;
      this.pageViews = 0;
      
      console.log('📊 Session ended');
    } catch (error) {
      console.warn('Session end error:', error);
    }
  }

  /**
   * Get A/B test variant assignment
   */
  async getABTestVariant(experimentName) {
    if (!this.sessionId) return null;
    
    try {
      const user = JSON.parse(localStorage.getItem('vf_user') || '{}');
      const response = await fetch(`${this.apiBaseUrl}/telemetry/ab-test/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experiment_name: experimentName,
          session_id: this.sessionId,
          user_id: user.id || null,
        }),
      });
      
      if (!response.ok) {
        console.warn('A/B test assignment failed');
        return null;
      }
      
      const data = await response.json();
      console.log('🧪 A/B test variant assigned:', data.variant_name);
      return data.variant_name;
    } catch (error) {
      console.warn('A/B test error:', error);
      return null;
    }
  }
}

// Singleton instance
const sessionManager = new SessionManager();

// Auto-update activity every 30 seconds
setInterval(() => {
  sessionManager.updateActivity();
}, 30000);

// End session on page unload (use sendBeacon for reliability)
window.addEventListener('beforeunload', () => {
  if (sessionManager.sessionId) {
    const url = `${sessionManager.apiBaseUrl}/telemetry/session/${sessionManager.sessionId}/end`;
    // sendBeacon is guaranteed to send even during page unload
    navigator.sendBeacon(url, '');
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_START_KEY);
  }
});

export default sessionManager;
