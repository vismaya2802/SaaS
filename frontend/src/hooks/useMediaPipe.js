// hooks/useMediaPipe.js — AR glasses overlay WITH face tracking
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
  const scaleRef = useRef(1.0);

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

  // Create gold glasses image
  useEffect(() => {
    console.log('🕶️ Creating glasses overlay...');
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    // Draw luxury gold glasses
    ctx.strokeStyle = '#FFD700';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.lineWidth = 6;
    
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
    ctx.strokeRect(165, 60, 70, 30);
    
    // Temples (arms)
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(30, 75);
    ctx.lineTo(0, 80);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(370, 75);
    ctx.lineTo(400, 80);
    ctx.stroke();
    
    // Convert to image
    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = () => {
      glassesImageRef.current = img;
      console.log('✅ Glasses image ready');
    };
  }, []);

  // MediaPipe face tracking callback
  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    if (!canvas || !isTracking) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // Key facial landmarks
      const leftEye = landmarks[33];   // Left eye outer corner
      const rightEye = landmarks[263]; // Right eye outer corner
      const noseTip = landmarks[1];    // Nose tip
      
      // Convert normalized coordinates to pixel coordinates
      const lx = leftEye.x * canvas.width;
      const ly = leftEye.y * canvas.height;
      const rx = rightEye.x * canvas.width;
      const ry = rightEye.y * canvas.height;
      const nx = noseTip.x * canvas.width;
      const ny = noseTip.y * canvas.height;
      
      // Calculate inter-pupillary distance (IPD)
      const ipd = Math.hypot(rx - lx, ry - ly);
      
      // Calculate face rotation angle
      const angle = Math.atan2(ry - ly, rx - lx);
      
      // Draw glasses if image is ready
      if (glassesImageRef.current) {
        const img = glassesImageRef.current;
        const currentScale = scaleRef.current;
        
        // Size glasses based on IPD and scale
        const glassesWidth = ipd * 2.8 * currentScale;
        const glassesHeight = (glassesWidth / 400) * 150;
        
        // Position slightly above nose bridge
        const centerX = (lx + rx) / 2;
        const centerY = (ly + ry) / 2 - ipd * 0.15;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.globalAlpha = 0.85;
        ctx.drawImage(
          img,
          -glassesWidth / 2,
          -glassesHeight / 2,
          glassesWidth,
          glassesHeight
        );
        ctx.restore();
        
        // Face detected indicator
        ctx.fillStyle = '#00FF64';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✓ Face Tracked', canvas.width / 2, 25);
      }
    } else {
      // No face detected
      ctx.fillStyle = 'rgba(255, 100, 100, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FF6464';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ No Face Detected', canvas.width / 2, canvas.height / 2);
      ctx.font = '12px Arial';
      ctx.fillText('Please face the camera', canvas.width / 2, canvas.height / 2 + 25);
    }
  }, [isTracking]);

  const startAR = useCallback(async () => {
    if (!isReady) {
      setError('MediaPipe not ready');
      return;
    }
    
    if (!glassesImageRef.current) {
      setError('Glasses image loading...');
      return;
    }
    
    try {
      console.log('🎥 Starting AR with face tracking...');
      
      // Initialize MediaPipe FaceMesh
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
      
      // Start camera
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
      console.log('✅ AR tracking started');
      
    } catch (err) {
      console.error('❌ AR start failed:', err);
      setError(err.message);
    }
  }, [isReady, onResults]);

  const stopAR = useCallback(() => {
    console.log('🛑 Stopping AR');
    setIsTracking(false);
    
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
