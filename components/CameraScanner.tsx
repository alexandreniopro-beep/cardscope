"use client"

import { useEffect, useRef, useState } from "react"

export default function CameraScanner({
  onCapture
}: {
  onCapture: (img: string) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setStreaming(true)
        }
      } catch (err) {
        console.error("Camera error:", err)
        setError(
          "Impossible d'accéder à la caméra. Vérifie les permissions du navigateur."
        )
      }
    }

    startCamera()

    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function capture() {
    if (!videoRef.current) return

    const canvas = document.createElement("canvas")
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(videoRef.current, 0, 0)

    const image = canvas.toDataURL("image/jpeg", 0.9)
    onCapture(image)
  }

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>
  }

  return (
    <div className="space-y-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full rounded-xl border border-gray-700"
      />

      <button
        onClick={capture}
        disabled={!streaming}
        className="w-full bg-blue-600 disabled:bg-gray-700 py-3 rounded-xl"
      >
        📸 Capturer la carte
      </button>
    </div>
  )
}
