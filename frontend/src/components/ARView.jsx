import React, { useState, useEffect, useRef } from 'react';
import { useMediaPipe } from '../hooks/useMediaPipe';

const ARView = ({ productId, productName, userId, arAssetUrl }) => {
  const [ws, setWs] = useState(null);
  const [dwellTime, setDwellTime] = useState(0);
  const dwellTimerRef = useRef(null);
  const canvasResizeRef = useRef(null);

  // 1. Initialize the MediaPipe Hook
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

  // ✅ FIX: Set canvas dimensions when video loads
  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const setCanvasSize = () => {
        if (video.videoWidth && video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          console.log(`✅ Canvas sized to ${canvas.width}x${canvas.height}`);
        }
      };
      
      video.addEventListener('loadedmetadata', setCanvasSize);
      
      return () => {
        video.removeEventListener('loadedmetadata', setCanvasSize);
      };
    }
  }, [videoRef, canvasRef, isTracking]);

  // 2. WebSocket Connection Setup
  useEffect(() => {
    if (isTracking && !ws) {
      const effectiveUserId = userId || 'USER_ANON';
      const socketUrl = `ws://localhost:8000/api/telemetry/ws/${effectiveUserId}`;
      const socket = new WebSocket(socketUrl);

      socket.onopen = () => console.log('✅ WebSocket connected to local telemetry engine');
      socket.onclose = () => {
        console.log('ℹ️ WebSocket disconnected');
        setWs(null);
      };
      socket.onerror = (err) => console.error('⚠️ WebSocket Error:', err);

      setWs(socket);
    } else if (!isTracking && ws) {
      ws.close();
      setWs(null);
    }
  }, [isTracking, userId]);

  // 3. Dwell Time Tracker
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

  // 4. Telemetry Emitter
  const sendTelemetry = (eventData) => {
    if (ws?.readyState === WebSocket.OPEN) {
      const payload = {
        product_id: productId,
        event_type: eventData.event_type,
        dwell_time_seconds: dwellTime,
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(payload));
      console.log('📡 Telemetry sent:', payload);
    }
  };

  // 5. UI Handlers
  const handleStart = () => {
    startAR();
    sendTelemetry({ event_type: 'TRY_ON_START', dwell_time_seconds: 0 });
  };

  const handleStop = () => {
    sendTelemetry({ event_type: 'TRY_ON_END', dwell_time_seconds: dwellTime });
    stopAR();
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900 text-white rounded-lg shadow-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-[#000042] bg-white px-4 py-1 rounded">
        AR Try-On: {productName || 'Eyewear Frame'}
      </h2>
      
      {/* Video & Canvas Container */}
      <div className="relative w-full max-w-md aspect-[4/3] bg-black rounded-lg overflow-hidden border-2 border-[#000042]">
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
          playsInline 
          muted 
          autoPlay
        />
        <canvas 
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
        />
        
        {!isTracking && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            <p className="text-lg">Click "Start AR" to begin</p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/80 text-white p-4 text-center">
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-col gap-3 w-full max-w-md">
        <div className="flex justify-between gap-2">
          {!isTracking ? (
            <button 
              type="button"
              id="ar-start-btn"
              onClick={handleStart}
              disabled={!isReady}
              className="flex-1 bg-[#000042] hover:bg-blue-900 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
            >
              {isReady ? 'Start AR Try-On' : 'Loading AR Engine...'}
            </button>
          ) : (
            <button 
              type="button"
              id="ar-stop-btn"
              onClick={handleStop}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Stop AR
            </button>
          )}
        </div>

        {isTracking && (
          <div className="bg-gray-800 p-3 rounded flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span>Dwell Time:</span>
              <span className="font-mono text-green-400">{dwellTime}s</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Scale:</span>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value={scale} 
                onChange={(e) => adjustScale(Number.parseFloat(e.target.value) - scale)}
                className="flex-1"
              />
              <span className="text-xs text-gray-400 w-12">{scale.toFixed(1)}x</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARView;
