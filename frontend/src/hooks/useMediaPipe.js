// hooks/useMediaPipe.js — Updated with actual glasses image loading
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

  // Load glasses image from options.arAssetUrl
  useEffect(() => {
    if (options.arAssetUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous'; // Prevents canvas tainting from CDN images
      img.src = options.arAssetUrl;
      img.onload = () => {
        frameImageRef.current = img;
        console.log('✅ Glasses image loaded for AR overlay');
      };
      img.onerror = () => {
        console.warn('⚠️ Failed to load glasses image, using fallback');
        // Fallback to generic glasses icon
        frameImageRef.current = null;
      };
    }
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

      // DRAW THE ACTUAL IMAGE
      if (frameImageRef.current?.complete) {
        const img = frameImageRef.current;
        const currentScale = scaleRef.current || 1.0;
        const frameWidth = ipd * 2.2 * currentScale;
        const frameHeight = frameWidth * (img.height / (img.width || 1));

        ctx.save();
        ctx.translate(nx, ny);
        ctx.rotate(angle);
        ctx.drawImage(img, -frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight);
        ctx.restore();
      } else {
        // Fallback - draw a placeholder
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(nx - 100, ny - 50, 200, 100);
        ctx.fillStyle = '#00FF00';
        ctx.fillText('Loading Frame...', nx - 40, ny);
      }
    }
  }, []);

  const startAR = useCallback(async () => {
    setError(null);
    try {
      const { FaceMesh } = await import('mediapipe/face_mesh');
      const { Camera } = await import('mediapipe/camera_utils');

      if (!videoRef.current || !canvasRef.current) {
        throw new Error('Video or Canvas element not found');
      }

      faceMeshRef.current = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/mediapipe/face_mesh/${file}`,
      });

      faceMeshRef.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMeshRef.current.onResults(onResults);

      cameraRef.current = new Camera(videoRef.current, {
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
      setError(err.message || 'Unable to access webcam');
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
    setIsReady(true);
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
