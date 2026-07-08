import { QRCodeSVG } from 'qrcode.react'
import '../styles/QRGenerator.css'

interface QRGeneratorProps {
  value: string
}

export default function QRGenerator({ value }: QRGeneratorProps) {
  return (
    <div className="qr-generator">
      <QRCodeSVG value={value} size={150} />
      <p className="qr-url">{value}</p>
    </div>
  )
}
