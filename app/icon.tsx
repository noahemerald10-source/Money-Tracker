import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        }}
      >
        <svg
          width="220"
          height="220"
          viewBox="0 0 24 24"
          fill="none"
        >
          <polyline
            points="3 17 8 10 13 13 18 6"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20.5" cy="5" r="1.5" fill="#000000" />
        </svg>
      </div>
    ),
    { ...size },
  )
}
