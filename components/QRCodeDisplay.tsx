'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

type Props = {
  url: string
  size?: number
}

export default function QRCodeDisplay({ url, size = 200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !url) return
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      color: { dark: '#211922', light: '#ffffff' },
    })
  }, [url, size])

  return <canvas ref={canvasRef} className="rounded-xl mx-auto" />
}
