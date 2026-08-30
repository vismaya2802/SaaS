// hooks/useMediaPipe.js — Initializes MediaPipe FaceMesh with AR overlay and camera controls
import { useState, useRef, useCallback, useEffect } from 'react'

export function useMediaPipe(options = {}) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const faceMeshRef = useRef(null)
  const cameraRef = useRef(null)
  const frameImageRef = useRef(null)

  const [isReady, setIsReady] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState(null)
  const [scale, setScale] = useState(1.0)
  const scaleRef = useRef(1.0)

  // Load fallback / glasses image
  useEffect(() => {
    const img = new Image()
    img.src = options.arAssetUrl || 'https://cdn.pixabay.com/photo/2016/12/10/16/57/glasses-1897632_1280.png'
    img.crossOrigin = 'Anonymous'
    img.onload = () => { frameImageRef.current = img }
  }, [options.arAssetUrl])

  const adjustScale = useCallback((delta) => {
    setScale((prev) => {
      const next = Math.max(0.5, Math.min(2.5, +(prev + delta).toFixed(2)))
      scaleRef.current = next
      return next
    })
  }, [])

  // ── FaceMesh landmark overlay rendering ──────────────────────────
  const onResults = useCallback((results) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (results.multiFaceLandmarks?.length > 0) {
      const landmarks = results.multiFaceLandmarks[0]
      const leftEye = landmarks[33]
      const rightEye = landmarks[263]
      const nose = landmarks[168]

      const lx = leftEye.x * canvas.width
      const ly = leftEye.y * canvas.height
      const rx = rightEye.x * canvas.width
      const ry = rightEye.y * canvas.height
      const nx = nose.x * canvas.width
      const ny = nose.y * canvas.height

      const ipd = Math.hypot(rx - lx, ry - ly)
      const angle = Math.atan2(ry - ly, rx - lx)

      if (frameImageRef.current?.complete) {
        const currentScale = scaleRef.current || 1.0
        const frameWidth = ipd * 2.2 * currentScale
        const frameHeight = frameWidth * (frameImageRef.current.height / (frameImageRef.current.width || 1))

        ctx.save()
        ctx.translate(nx, ny)
        ctx.rotate(angle)
        ctx.drawImage(frameImageRef.current, -frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight)
        ctx.restore()
      } else {
        ctx.beginPath()
        ctx.arc(nx, ny, 5, 0, 2 * Math.PI)
        ctx.fillStyle = '#6366f1'
        ctx.fill()
      }
    }
  }, [])

  const startAR = useCallback(async () => {
    setError(null)
    try {
      const { FaceMesh } = await import('@mediapipe/face_mesh')
      const { Camera } = await import('@mediapipe/camera_utils')

      if (!videoRef.current || !canvasRef.current) {
        throw new Error('Video or Canvas element not found')
      }

      faceMeshRef.current = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      })

      faceMeshRef.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      faceMeshRef.current.onResults(onResults)

      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current })
          }
        },
        width: 640,
        height: 480,
      })

      await cameraRef.current.start()
      setIsTracking(true)
    } catch (err) {
      console.error('Failed to start AR:', err)
      setError(err.message || 'Unable to access webcam')
      setIsTracking(false)
    }
  }, [onResults])

  const stopAR = useCallback(() => {
    try {
      cameraRef.current?.stop()
      faceMeshRef.current?.close()
    } catch (e) {
      console.warn('Error during camera stop:', e)
    }
    setIsTracking(false)
  }, [])

  useEffect(() => {
    setIsReady(true)
    return () => stopAR()
  }, [stopAR])

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
  }
}
