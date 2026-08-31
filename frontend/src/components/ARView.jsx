import React, { useState, useEffect, useRef } from 'react';
import { useMediaPipe } from '../hooks/useMediaPipe';
import sessionManager from '../utils/sessionManager';

const ARView = ({ productId, productName, userId, arAssetUrl }) => {
  const [ws, setWs] = useState(null);
  const [dwellTime, setDwellTime] = useState(0);
  const dwellTimerRef = useRef(null);

  const {
    videoRef,
    canvasRef,
    isReady,
    isTracking,
    error,
    startAR,
    stopAR,
    adjustScale,
    scale
  } = useMediaPipe({
    userId,
    arAssetUrl,
    onTelemetry: (data) => sendTelemetry(data)
  });

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const setCanvasSize = () => {
        if (video.videoWidth && video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          console.log(`📐 Canvas sized: ${canvas.width}x${canvas.height}`);
        }
      };
      
      video.addEventListener('loadedmetadata', setCanvasSize);
      return () => video.removeEventListener('loadedmetadata', setCanvasSize);
    }
  }, [videoRef, canvasRef, isTracking]);

  useEffect(() => {
    if (isTracking && !ws) {
      const effectiveUserId = userId || 'USER_ANON';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const wsBaseUrl = apiUrl.replace('https://', 'wss://').replace('http://', 'ws://').replace('/api', '');
      const socketUrl = `${wsBaseUrl}/api/telemetry/ws/${effectiveUserId}`;
      const socket = new WebSocket(socketUrl);

      socket.onopen = () => console.log('✅ WebSocket connected');
      socket.onclose = () => setWs(null);
      socket.onerror = (err) => console.error('WebSocket Error:', err);

      setWs(socket);
    } else if (!isTracking && ws) {
      ws.close();
      setWs(null);
    }
  }, [isTracking, userId]);

  useEffect(() => {
    if (isTracking) {
      dwellTimerRef.current = setInterval(() => {
        setDwellTime(prev => prev + 3);
      }, 3000);
    } else {
      clearInterval(dwellTimerRef.current);
      setDwellTime(0);
    }
    return () => clearInterval(dwellTimerRef.current);
  }, [isTracking]);

  const sendTelemetry = (eventData) => {
    if (ws?.readyState === WebSocket.OPEN) {
      const payload = {
        product_id: productId,
        event_type: eventData.event_type,
        dwell_time_seconds: dwellTime,
        session_id: sessionManager.getSessionId(),
        page_url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(payload));
    }
  };

  const handleStart = () => {
    startAR();
    sendTelemetry({ event_type: 'TRY_ON_START', dwell_time_seconds: 0 });
    sessionManager.trackFunnel('try_ar', productId);
  };

  const handleStop = () => {
    sendTelemetry({ event_type: 'TRY_ON_END', dwell_time_seconds: dwellTime });
    stopAR();
  };

  return (
    <div className="flex flex-col items-center glass-card p-6 shadow-xl shadow-gold-500/10">
      <div className="w-full mb-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 text-center">
          AR Virtual Try-On
        </h2>
        <p className="text-sm text-gray-400 text-center mt-1">{productName}</p>
      </div>
      
      <div className="relative w-full max-w-md aspect-[4/3] bg-charcoal-950 rounded-xl overflow-hidden border-2 border-gold-500/30 shadow-lg">
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover -scale-x-100" 
          playsInline 
          muted 
          autoPlay
          style={{ zIndex: 1 }}
        />
        <canvas 
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100" 
          style={{ zIndex: 10, pointerEvents: 'none' }}
        />
        
        {!isTracking && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-charcoal-950/90 to-luxury-950/90 backdrop-blur-sm text-white" style={{ zIndex: 20 }}>
            <div className="text-center">
              <p className="text-lg font-medium">Click "Start AR" to begin</p>
              <p className="text-sm text-gray-400 mt-2">Experience luxury eyewear in AR</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-600/90 text-white p-4 text-center" style={{ zIndex: 30 }}>
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 w-full max-w-md">
        <div className="flex justify-between gap-3">
          {!isTracking ? (
            <button 
              type="button"
              id="ar-start-btn"
              onClick={handleStart}
              disabled={!isReady}
              className="flex-1 btn-primary py-3 text-base disabled:opacity-50"
            >
              {isReady ? 'Start AR Try-On' : 'Loading AR Engine...'}
            </button>
          ) : (
            <button 
              type="button"
              id="ar-stop-btn"
              onClick={handleStop}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-600/30"
            >
              Stop AR
            </button>
          )}
        </div>

        {isTracking && (
          <div className="glass-card p-4 space-y-3 border border-gold-500/20">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Dwell Time:</span>
              <span className="font-mono text-gold-400 font-semibold">{dwellTime}s</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 min-w-fit">Scale:</span>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value={scale} 
                onChange={(e) => adjustScale(Number.parseFloat(e.target.value) - scale)}
                className="flex-1 accent-gold-500"
              />
              <span className="text-sm text-gold-400 font-semibold min-w-fit">{scale.toFixed(1)}x</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARView;
