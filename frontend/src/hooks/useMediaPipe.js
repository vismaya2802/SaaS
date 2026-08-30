// hooks/useMediaPipe.js — AR glasses overlay with improved fallback
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
    const svg = `<svg viewBox="0 0 240 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lensGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6B8FFF;stop-opacity:0.4" /><stop offset="100%" style="stop-color:#4A90E2;stop-opacity:0.6" /></linearGradient></defs><ellipse cx="60" cy="50" rx="40" ry="35" fill="url(#lensGradient)" stroke="#2C3E50" stroke-width="2.5"/><ellipse cx="180" cy="50" rx="40" ry="35" fill="url(#lensGradient)" stroke="#2C3E50" stroke-width="2.5"/><rect x="100" y="42" width="40" height="16" fill="#2C3E50" rx="3"/><path d="M 25 55 Q 15 60 10 75" stroke="#2C3E50" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 215 55 Q 225 60 230 75" stroke="#2C3E50" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="35" rx="12" ry="15" fill="white" opacity="0.3"/><ellipse cx="170" cy="35" rx="12" ry="15" fill="white" opacity="0.3"/></svg>`;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log('✅ SVG glasses frame loaded');
        resolve(img);
      };
      img.onerror = () => {
        console.error('Failed to create SVG');
        resolve(null);
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    });
  };

  // Load glasses image
  useEffect(() => {
    const loadImage = async () => {
      try {
        if (options.arAssetUrl) {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.src = options.arAssetUrl;
          
          img.onload = () => {
            frameImageRef.current = img;
            console.log('✅ Product image loaded');
          };
          
          img.onerror = async () => {
            console.warn('Using SVG fallback');
            frameImageRef.current = await createGlassesFrame();
          };
          
          setTimeout(() => {
            if (!frameImageRef.current) {
              createGlassesFrame().then(img => { frameImageRef.current = img; });
            }
          }, 3000);
        } else {
          frameImageRef.current = await createGlassesFrame();
        }
      } catch (err) {
        console.error('Error loading image:', err);
        frameImageRef.current = await createGlassesFrame();
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

      if (frameImageRef.current?.complete) {
        const img = frameImageRef.current;
        const currentScale = scaleRef.current || 1.0;
        const frameWidth = ipd * 2.2 * currentScale;
        const frameHeight = frameWidth * (img.height / (img.width || 1));

        ctx.save();
        ctx.translate(nx, ny);
        ctx.rotate(angle);
        ctx.globalAlpha = 0.9;
        ctx.drawImage(img, -frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight);
        ctx.restore();
      } else {
        // Face detected placeholder
        ctx.fillStyle = 'rgba(0, 255, 100, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#00FF64';
        ctx.lineWidth = 2;
        ctx.strokeRect(nx - 120, ny - 60, 240, 120);
        ctx.fillStyle = '#00FF64';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Face Detected', nx, ny - 20);
      }
    } else {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FF6464';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No Face Detected', canvas.width / 2, canvas.height / 2);
    }
  }, []);

  const startAR = useCallback(async () => {
    setError(null);
    if (!window.FaceMesh || !window.Camera) {
      setError('MediaPipe libraries loading...');
      return;
    }

    try {
      if (!videoRef.current || !canvasRef.current) {
        throw new Error('Video or Canvas not found');
      }

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
      setIsTracking(true);
    } catch (err) {
      console.error('Failed to start AR:', err);
      setError(err.message || 'Unable to start AR');
      setIsTracking(false);
    }
  }, [onResults]);

  const stopAR = useCallback(() => {
    try {
      cameraRef.current?.stop();
      faceMeshRef.current?.close();
    } catch (e) {
      console.warn('Error stopping AR:', e);
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
