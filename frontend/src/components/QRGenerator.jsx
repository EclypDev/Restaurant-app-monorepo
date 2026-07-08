import { QRCodeSVG } from 'qrcode.react'
import '../styles/QRGenerator.css'

export default function QRGenerator({ value }) {
  return (
    <div className="qr-generator">
      <QRCodeSVG value={value} size={150} />
      <p className="qr-url">{value}</p>
    </div>
  )
}
