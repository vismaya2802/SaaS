// hooks/useMediaPipe.js — Updated with SVG fallback glasses frames
import { useEffect, useRef, useState, useCallback } from 'react';

export function useMediaPipe(options = {}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const frameImageRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const scaleRef = useRef(1.0);

  // Wait for MediaPipe to load from CDN
  useEffect(() => {
    const checkMediaPipeLoaded = () => {
      if (window.FaceMesh && window.Camera) {
        setIsReady(true);
      } else {
        setTimeout(checkMediaPipeLoaded, 100);
      }
    };
    checkMediaPipeLoaded();
  }, []);

  // Create SVG glasses frame as fallback
  const createGlassesFrame = () => {
    const svg = `
      <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Left lens -->
        <rect x="20" y="15" width="50" height="45" rx="5" fill="rgba(100, 150, 255, 0.3)" stroke="#4a90e2" stroke-width="2"/>
        <!-- Right lens -->
        <rect x="130" y="15" width="50" height="45" rx="5" fill="rgba(100, 150, 255, 0.3)" stroke="#4a90e2" stroke-width="2"/>
        <!-- Bridge -->
        <rect x="70" y="35" width="60" height="8" fill="#333" rx="2"/>
        <!-- Left temple -->
        <line x1="20" y1="40" x2="5" y2="55" stroke="#333" stroke-width="3" stroke-linecap="round"/>
        <!-- Right temple -->
        <line x1="180" y1="40" x2="195" y2="55" stroke="#333" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    });
  };

  // Load glasses image from options.arAssetUrl or create fallback
  useEffect(() => {
    const loadImage = async () => {
      if (options.arAssetUrl) {
        // Try to load the provided asset URL
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = options.arAssetUrl;
        
        img.onload = () => {
          frameImageRef.current = img;
          console.log('✅ Glasses image loaded from asset URL');
        };
        
        img.onerror = async () => {
          console.warn('⚠️ Failed to load glasses image from URL, using SVG fallback');
          const fallbackImg = await createGlassesFrame();
          frameImageRef.current = fallbackImg;
        };
      } else {
        // Use SVG fallback if no asset URL provided
        const fallbackImg = await createGlassesFrame();
        frameImageRef.current = fallbackImg;
        console.log('✅ SVG glasses frame created');
      }
    };
    
    loadImage();
  }, [options.arAssetUrl]);

  const adjustScale = useCallback((delta) => {
    setScale((prev) => {
      const next = Math.max(0.5, Math.min(2.5, +(prev + delta).toFixed(2)));
      scaleRef.current = next;
      return next;
    });
  }, []);

  // ── FaceMesh landmark overlay rendering ──────────────────────────
  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks?.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];
      const nose = landmarks[168];

      const lx = leftEye.x * canvas.width;
      const ly = leftEye.y * canvas.height;
      const rx = rightEye.x * canvas.width;
      const ry = rightEye.y * canvas.height;
      const nx = nose.x * canvas.width;
      const ny = nose.y * canvas.height;

      const ipd = Math.hypot(rx - lx, ry - ly);
      const angle = Math.atan2(ry - ly, rx - lx);

      // Draw the glasses frame
      if (frameImageRef.current) {
        const img = frameImageRef.current;
        const currentScale = scaleRef.current || 1.0;
        
        // Calculate frame dimensions based on interpupillary distance
        const frameWidth = ipd * 2.2 * currentScale;
        const frameHeight = frameWidth * (img.height / (img.width || 1));

        ctx.save();
        ctx.translate(nx, ny);
        ctx.rotate(angle);
        ctx.globalAlpha = 0.85; // Slight transparency
        ctx.drawImage(img, -frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight);
        ctx.restore();
      } else {
        // Fallback: draw simple rectangles if image fails completely
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        ctx.strokeRect(nx - 100, ny - 50, 200, 100);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.fillRect(nx - 100, ny - 50, 200, 100);
        ctx.fillStyle = '#00FF00';
        ctx.font = '14px Arial';
        ctx.fillText('AR Frame Loading...', nx - 50, ny + 5);
      }
    }
  }, []);

  const startAR = useCallback(async () => {
    setError(null);
    
    // Check if MediaPipe is loaded from CDN
    if (!window.FaceMesh || !window.Camera) {
      setError('MediaPipe libraries are loading. Please wait a moment and try again.');
      return;
    }

    try {
      if (!videoRef.current || !canvasRef.current) {
        throw new Error('Video or Canvas element not found');
      }

      faceMeshRef.current = new window.FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
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
      setIsTracking(true);
    } catch (err) {
      console.error('Failed to start AR:', err);
      setError(err.message || 'Unable to access webcam or start AR');
      setIsTracking(false);
    }
  }, [onResults]);

  const stopAR = useCallback(() => {
    try {
      cameraRef.current?.stop();
      faceMeshRef.current?.close();
    } catch (e) {
      console.warn('Error during camera stop:', e);
    }
    setIsTracking(false);
  }, []);

  useEffect(() => {
    return () => stopAR();
  }, [stopAR]);

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
