import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#4F46E5',
          borderRadius: 36,
        }}
      >
        <div style={{
          fontSize: 110,
          fontWeight: 800,
          color: 'white',
          letterSpacing: '-0.05em',
        }}>
          M
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
