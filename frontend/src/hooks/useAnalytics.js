/**
 * useAnalytics.js — React hook for tracking analytics events
 * Provides easy-to-use methods for funnel, heatmap, and A/B test tracking
 */

import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import sessionManager from '../utils/sessionManager';

/**
 * Custom hook for analytics tracking
 * @param {Object} options - Configuration options
 * @param {boolean} options.trackPageViews - Auto-track page views on route change
 * @param {boolean} options.trackClicks - Auto-track click events for heatmaps
 * @param {string} options.funnel - Auto-track funnel stage on mount
 */
export function useAnalytics(options = {}) {
  const {
    trackPageViews = true,
    trackClicks = false,
    funnel = null,
  } = options;

  const location = useLocation();
  const clickListenerRef = useRef(null);

  // Auto-track page views on route change
  useEffect(() => {
    if (trackPageViews) {
      sessionManager.trackPageView(location.pathname);
      console.log('📊 Page view tracked:', location.pathname);
    }
  }, [location.pathname, trackPageViews]);

  // Auto-track funnel stage on mount
  useEffect(() => {
    if (funnel) {
      sessionManager.trackFunnel(funnel);
      console.log('📊 Funnel tracked:', funnel);
    }
  }, [funnel]);

  // Auto-track clicks for heatmaps
  useEffect(() => {
    if (trackClicks) {
      const handleClick = (e) => {
        const element = e.target;
        const rect = element.getBoundingClientRect();
        const x = Math.round(e.clientX);
        const y = Math.round(e.clientY);
        
        sessionManager.trackHeatmap(
          'click',
          x,
          y,
          element.id || null,
          element.className || null
        );
      };

      document.addEventListener('click', handleClick);
      clickListenerRef.current = handleClick;

      return () => {
        document.removeEventListener('click', handleClick);
      };
    }
  }, [trackClicks]);

  // Manual tracking methods
  const trackFunnel = useCallback((stage, productId = null, metadata = null) => {
    sessionManager.trackFunnel(stage, productId, metadata);
  }, []);

  const trackClick = useCallback((x, y, elementId = null, elementClass = null) => {
    sessionManager.trackHeatmap('click', x, y, elementId, elementClass);
  }, []);

  const trackScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const scrollPercentage = (scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    sessionManager.trackHeatmap('scroll', 0, Math.round(scrollPercentage));
  }, []);

  const markConverted = useCallback(() => {
    sessionManager.markConverted();
  }, []);

  const getABTestVariant = useCallback(async (experimentName) => {
    return await sessionManager.getABTestVariant(experimentName);
  }, []);

  return {
    trackFunnel,
    trackClick,
    trackScroll,
    markConverted,
    getABTestVariant,
    sessionId: sessionManager.getSessionId(),
  };
}

/**
 * HOC for automatic funnel tracking on component mount
 */
export function withFunnelTracking(Component, funnelStage) {
  return function WrappedComponent(props) {
    useAnalytics({ funnel: funnelStage, trackPageViews: true });
    return <Component {...props} />;
  };
}

/**
 * HOC for automatic click heatmap tracking
 */
export function withHeatmapTracking(Component) {
  return function WrappedComponent(props) {
    useAnalytics({ trackClicks: true, trackPageViews: true });
    return <Component {...props} />;
  };
}
