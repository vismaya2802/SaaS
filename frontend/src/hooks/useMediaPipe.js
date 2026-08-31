// hooks/useMediaPipe.js — Simplified AR with guaranteed glasses display
import { useEffect, useRef, useState, useCallback } from 'react';

export function useMediaPipe(options = {}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const glassesImageRef = useRef(null);
  const streamRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);

  // Check MediaPipe loaded
  useEffect(() => {
    const check = () => {
      if (window.FaceMesh && window.Camera) {
        setIsReady(true);
        console.log('✅ MediaPipe ready');
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  }, []);

  // Create simple guaranteed visible glasses
  useEffect(() => {
    console.log('🕶️ Creating glasses overlay...');
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    // Draw gold glasses
    ctx.strokeStyle = '#FFD700';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 8;
    
    // Left lens
    ctx.beginPath();
    ctx.ellipse(100, 75, 60, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Right lens
    ctx.beginPath();
    ctx.ellipse(300, 75, 60, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Bridge
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(160, 65, 80, 20);
    
    // Convert to image
    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = () => {
      glassesImageRef.current = img;
      console.log('✅ Glasses image ready');
    };
  }, []);

  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!canvas || !video || !isTracking) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // ALWAYS draw glasses in center for now (we'll add face detection after)
    if (glassesImageRef.current) {
      const w = canvas.width * 0.6 * scale;
      const h = (w / 400) * 150;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2.5; // Upper middle
      
      ctx.globalAlpha = 0.9;
      ctx.drawImage(glassesImageRef.current, x, y, w, h);
      
      // Debug text
      ctx.fillStyle = '#00FF00';
      ctx.font = '20px Arial';
      ctx.fillText('✓ Glasses Active', 10, 30);
    } else {
      ctx.fillStyle = '#FF0000';
      ctx.font = '20px Arial';
      ctx.fillText('⚠ Loading glasses...', 10, 30);
    }
    
    if (isTracking) {
      requestAnimationFrame(drawFrame);
    }
  }, [isTracking, scale]);

  const startAR = useCallback(async () => {
    if (!isReady) {
      setError('MediaPipe not ready');
      return;
    }
    
    try {
      console.log('🎥 Starting camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
      }
      
      setIsTracking(true);
      console.log('✅ AR started');
      
      // Start drawing
      setTimeout(() => drawFrame(), 100);
      
    } catch (err) {
      console.error('❌ AR start failed:', err);
      setError(err.message);
    }
  }, [isReady, drawFrame]);

  const stopAR = useCallback(() => {
    console.log('🛑 Stopping AR');
    setIsTracking(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  const adjustScale = useCallback((delta) => {
    setScale(prev => Math.max(0.5, Math.min(2.5, prev + delta)));
  }, []);

  useEffect(() => {
    if (isTracking) {
      drawFrame();
    }
  }, [isTracking, drawFrame]);

  useEffect(() => () => stopAR(), [stopAR]);

  return {
    videoRef,
    canvasRef,
    isReady,
    isTracking,
    error,
    startAR,
    stopAR,
    adjustScale,
    scale,
  };
}

export default useMediaPipe;
