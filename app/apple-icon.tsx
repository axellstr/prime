import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "black",
        }}
      >
        <svg width="100" height="100" viewBox="0 0 32 32">
          <path
            d="M16 16C24.8365 16 32 23.1635 32 32H24C24 27.5817 20.4183 24 16 24C11.5817 24 8 27.5817 8 32H0C0 23.1635 7.1635 16 16 16ZM32 0C32 8.8365 24.8365 16 16 16C7.1635 16 0 8.8365 0 0H8C8 4.41825 11.5817 8 16 8C20.4183 8 24 4.41825 24 0H32Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
