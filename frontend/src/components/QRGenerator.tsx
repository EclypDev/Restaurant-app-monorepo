import { useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface QRGeneratorProps {
  value: string
  showDownload?: boolean
}

const SIZES = [
  { label: 'Pequeño (5cm)', value: 150 },
  { label: 'Mediano (8cm)', value: 250 },
  { label: 'Grande (12cm)', value: 400 },
]

export default function QRGenerator({ value, showDownload }: QRGeneratorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedSize, setSelectedSize] = useState(250)
  const [downloading, setDownloading] = useState(false)

  const downloadQR = async () => {
    if (!svgRef.current) return
    setDownloading(true)

    try {
      const svgElement = svgRef.current
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const canvas = document.createElement('canvas')
      canvas.width = selectedSize
      canvas.height = selectedSize
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const img = new Image()
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      img.onload = () => {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)

        const pngUrl = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        a.href = pngUrl
        const nombre = value.split('/').pop() || 'qr'
        a.download = `QR-${nombre}.png`
        a.click()
        setDownloading(false)
      }
      img.src = url
    } catch (err) {
      console.error('Error al descargar QR:', err)
      setDownloading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <QRCodeSVG
        ref={svgRef}
        value={value}
        size={showDownload ? selectedSize : 150}
        bgColor="#ffffff"
        fgColor="#000000"
        style={{ borderRadius: '8px', maxWidth: '100%' }}
      />
      {showDownload && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
            {SIZES.map(s => (
              <button
                key={s.value}
                onClick={() => setSelectedSize(s.value)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: selectedSize === s.value ? '2px solid #ff6b35' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedSize === s.value ? 'rgba(255,107,53,0.15)' : 'transparent',
                  color: selectedSize === s.value ? '#ff6b35' : '#a0aec0',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            onClick={downloadQR}
            disabled={downloading}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem',
              opacity: downloading ? 0.6 : 1,
            }}
          >
            {downloading ? 'Generando...' : '⬇️ Descargar PNG'}
          </button>
        </div>
      )}
    </div>
  )
}
