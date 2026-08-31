// hooks/useMediaPipe.js — AR glasses overlay with improved image loading
import { useEffect, useRef, useState, useCallback } from 'react';

export function useMediaPipe(options = {}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const frameImageRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const scaleRef = useRef(1.0);

  // Wait for MediaPipe to load from CDN
  useEffect(() => {
    const checkMediaPipeLoaded = () => {
      if (window.FaceMesh && window.Camera) {
        setIsReady(true);
        console.log('✅ MediaPipe libraries loaded');
      } else {
        setTimeout(checkMediaPipeLoaded, 100);
      }
    };
    checkMediaPipeLoaded();
  }, []);

  // Create SVG glasses frame as fallback - ALWAYS visible
  const createGlassesFrame = () => {
    const svg = `<svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFD700;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#FFA500;stop-opacity:0.5" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Left Lens -->
      <ellipse cx="75" cy="60" rx="50" ry="40" fill="url(#lensGrad)" stroke="#B8860B" stroke-width="3" filter="url(#glow)"/>
      <!-- Right Lens -->
      <ellipse cx="225" cy="60" rx="50" ry="40" fill="url(#lensGrad)" stroke="#B8860B" stroke-width="3" filter="url(#glow)"/>
      <!-- Bridge -->
      <rect x="125" y="52" width="50" height="16" fill="#B8860B" rx="4"/>
      <!-- Left Temple -->
      <path d="M 25 65 Q 15 70 10 90" stroke="#B8860B" stroke-width="4" fill="none" stroke-linecap="round"/>
      <!-- Right Temple -->
      <path d="M 275 65 Q 285 70 290 90" stroke="#B8860B" stroke-width="4" fill="none" stroke-linecap="round"/>
      <!-- Highlight on left lens -->
      <ellipse cx="60" cy="45" rx="15" ry="20" fill="white" opacity="0.4"/>
      <!-- Highlight on right lens -->
      <ellipse cx="210" cy="45" rx="15" ry="20" fill="white" opacity="0.4"/>
    </svg>`;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log('✅ SVG glasses frame created');
        resolve(img);
      };
      img.onerror = () => {
        console.error('❌ Failed to create SVG glasses');
        resolve(null);
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    });
  };

  // Load glasses image with immediate fallback
  useEffect(() => {
    const loadImage = async () => {
      try {
        // ALWAYS load SVG fallback first
        const svgFrame = await createGlassesFrame();
        frameImageRef.current = svgFrame;
        setImageLoaded(true);
        console.log('✅ Default glasses loaded (SVG)');
        
        // Then try to load product image if available
        if (options.arAssetUrl && options.arAssetUrl.startsWith('http')) {
          console.log('📸 Attempting to load product image:', options.arAssetUrl);
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          img.onload = () => {
            frameImageRef.current = img;
            setImageLoaded(true);
            console.log('✅ Product image loaded successfully');
          };
          
          img.onerror = (err) => {
            console.warn('⚠️ Product image failed, keeping SVG fallback', err);
            // Keep SVG fallback that's already loaded
          };
          
          img.src = options.arAssetUrl;
        }
      } catch (err) {
        console.error('Error in image loading:', err);
        // Ensure we always have something
        const svgFrame = await createGlassesFrame();
        frameImageRef.current = svgFrame;
        setImageLoaded(true);
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
    if (!canvas || !isTracking) return;
    
    const ctx = canvas.getContext('2d');
    ctx.save();
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

      // Draw glasses if image is loaded
      if (frameImageRef.current && imageLoaded) {
        const img = frameImageRef.current;
        const currentScale = scaleRef.current || 1.0;
        const frameWidth = ipd * 2.5 * currentScale;
        const frameHeight = frameWidth * 0.4; // Fixed aspect ratio for glasses

        ctx.translate(nx, ny - ipd * 0.1); // Slightly above nose
        ctx.rotate(angle);
        ctx.globalAlpha = 0.95;
        
        // Draw with better positioning
        ctx.drawImage(
          img, 
          -frameWidth / 2, 
          -frameHeight / 2, 
          frameWidth, 
          frameHeight
        );
        
        ctx.restore();
        
        // Draw face detected indicator
        ctx.fillStyle = '#00FF64';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✓ Face Detected', canvas.width / 2, 30);
      } else {
        ctx.restore();
        // Loading state
        ctx.fillStyle = 'rgba(0, 255, 100, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#00FF64';
        ctx.lineWidth = 3;
        ctx.strokeRect(nx - 120, ny - 60, 240, 120);
        ctx.fillStyle = '#00FF64';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Face Detected ✓', nx, ny - 20);
        ctx.font = '14px Arial';
        ctx.fillText('Loading glasses...', nx, ny + 10);
      }
    } else {
      ctx.restore();
      // No face detected
      ctx.fillStyle = 'rgba(255, 100, 100, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FF6464';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ No Face Detected', canvas.width / 2, canvas.height / 2);
      ctx.font = '14px Arial';
      ctx.fillText('Please face the camera', canvas.width / 2, canvas.height / 2 + 30);
    }
  }, [isTracking, imageLoaded]);

  const startAR = useCallback(async () => {
    setError(null);
    if (!window.FaceMesh || !window.Camera) {
      setError('MediaPipe libraries loading...');
      return;
    }

    if (!imageLoaded || !frameImageRef.current) {
      setError('Glasses image still loading...');
      return;
    }

    try {
      if (!videoRef.current || !canvasRef.current) {
        throw new Error('Video or Canvas not ready');
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
          if (faceMeshRef.current && videoRef.current && isTracking) {
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
      console.log('🎥 AR tracking started');
    } catch (err) {
      console.error('Failed to start AR:', err);
      setError(err.message || 'Unable to start AR');
      setIsTracking(false);
    }
  }, [onResults, isTracking, imageLoaded]);

  const stopAR = useCallback(() => {
    console.log('🛑 Stopping AR...');
    setIsTracking(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
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
        streamRef.current.getTracks().forEach(track => {
          try { track.stop(); } catch (e) {}
        });
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
    
    console.log('✅ AR stopped');
  }, []);

  useEffect(() => {
    return () => stopAR();
  }, [stopAR]);

  return {
    videoRef,
    canvasRef,
    isReady: isReady && imageLoaded,
    isTracking,
    error,
    startAR,
    stopAR,
    adjustScale,
    scale,
  };
}

export default useMediaPipe;
