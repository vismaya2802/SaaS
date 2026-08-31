// hooks/useMediaPipe.js — AR with visual debugging
import { useEffect, useRef, useState, useCallback } from 'react';

export function useMediaPipe(options = {}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const glassesImageRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectedRef = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [debugInfo, setDebugInfo] = useState('');
  const scaleRef = useRef(1.0);

  // Check MediaPipe loaded
  useEffect(() => {
    const check = () => {
      if (window.FaceMesh && window.Camera) {
        setIsReady(true);
        setDebugInfo('✅ MediaPipe loaded');
        console.log('✅ MediaPipe ready');
      } else {
        setDebugInfo('⏳ Loading MediaPipe...');
        setTimeout(check, 100);
      }
    };
    check();
  }, []);

  // Create gold glasses
  useEffect(() => {
    console.log('🕶️ Creating glasses...');
    setDebugInfo('🕶️ Creating glasses...');
    
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    // Bright gold glasses for visibility
    ctx.strokeStyle = '#FFD700';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 8;
    
    // Left lens
    ctx.beginPath();
    ctx.ellipse(100, 75, 65, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Right lens
    ctx.beginPath();
    ctx.ellipse(300, 75, 65, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Bridge
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(165, 60, 70, 30);
    
    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = () => {
      glassesImageRef.current = img;
      setDebugInfo('✅ Glasses ready');
      console.log('✅ Glasses ready');
    };
  }, []);

  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    if (!canvas || !isTracking) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // ALWAYS draw debug info
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Debug: ${debugInfo}`, 10, 20);
    
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      faceDetectedRef.current = true;
      const landmarks = results.multiFaceLandmarks[0];
      
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];
      const noseTip = landmarks[1];
      
      const lx = leftEye.x * canvas.width;
      const ly = leftEye.y * canvas.height;
      const rx = rightEye.x * canvas.width;
      const ry = rightEye.y * canvas.height;
      
      const ipd = Math.hypot(rx - lx, ry - ly);
      const angle = Math.atan2(ry - ly, rx - lx);
      
      // Draw face landmarks for debugging
      ctx.fillStyle = '#00FF00';
      ctx.beginPath();
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.arc(rx, ry, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw glasses
      if (glassesImageRef.current) {
        const img = glassesImageRef.current;
        const currentScale = scaleRef.current;
        const glassesWidth = ipd * 2.8 * currentScale;
        const glassesHeight = (glassesWidth / 400) * 150;
        const centerX = (lx + rx) / 2;
        const centerY = (ly + ry) / 2 - ipd * 0.15;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.globalAlpha = 0.9;
        ctx.drawImage(img, -glassesWidth / 2, -glassesHeight / 2, glassesWidth, glassesHeight);
        ctx.restore();
        
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✓ GLASSES ACTIVE', canvas.width / 2, 40);
      } else {
        ctx.fillStyle = '#FFFF00';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⏳ Loading glasses image...', canvas.width / 2, canvas.height / 2);
      }
    } else {
      faceDetectedRef.current = false;
      ctx.fillStyle = '#FF6464';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ NO FACE DETECTED', canvas.width / 2, canvas.height / 2);
      ctx.font = '14px Arial';
      ctx.fillText('Look at the camera', canvas.width / 2, canvas.height / 2 + 30);
    }
  }, [isTracking, debugInfo]);

  const startAR = useCallback(async () => {
    if (!isReady) {
      setError('MediaPipe not ready');
      setDebugInfo('❌ MediaPipe not ready');
      return;
    }
    
    if (!glassesImageRef.current) {
      setError('Glasses loading...');
      setDebugInfo('⏳ Glasses loading...');
      setTimeout(() => startAR(), 500);
      return;
    }
    
    try {
      setDebugInfo('🎥 Starting camera...');
      console.log('🎥 Starting AR...');
      
      faceMeshRef.current = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
      });
      
      faceMeshRef.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      
      faceMeshRef.current.onResults(onResults);
      
      cameraRef.current = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      
      await cameraRef.current.start();
      
      if (videoRef.current && videoRef.current.srcObject) {
        streamRef.current = videoRef.current.srcObject;
      }
      
      setIsTracking(true);
      setDebugInfo('✅ AR ACTIVE');
      console.log('✅ AR tracking started');
      
    } catch (err) {
      console.error('❌ AR failed:', err);
      setError(err.message);
      setDebugInfo(`❌ Error: ${err.message}`);
    }
  }, [isReady, onResults]);

  const stopAR = useCallback(() => {
    console.log('🛑 Stopping AR');
    setDebugInfo('🛑 Stopped');
    setIsTracking(false);
    faceDetectedRef.current = false;
    
    if (cameraRef.current) {
      try { cameraRef.current.stop(); } catch (e) {}
      cameraRef.current = null;
    }
    
    if (faceMeshRef.current) {
      try { faceMeshRef.current.close(); } catch (e) {}
      faceMeshRef.current = null;
    }
    
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      try { videoRef.current.srcObject = null; } catch (e) {}
    }
    
    if (canvasRef.current) {
      try {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      } catch (e) {}
    }
  }, []);

  const adjustScale = useCallback((delta) => {
    setScale(prev => {
      const newScale = Math.max(0.5, Math.min(2.5, prev + delta));
      scaleRef.current = newScale;
      return newScale;
    });
  }, []);

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
