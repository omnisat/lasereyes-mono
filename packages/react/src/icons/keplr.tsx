import React from 'react'
interface KeplrLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  variant?: 'first' | 'second'
}

const KeplrLogo: React.FC<KeplrLogoProps> = ({
  size = 42,
  className,
  variant,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    className={className}
    viewBox="0 0 38.687 38.002"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        fill="url(#b)"
        d="M29.895 0H8.791C3.937 0 0 3.867 0 8.637v20.728c0 4.77 3.937 8.637 8.792 8.637h21.102c4.856 0 8.793-3.867 8.793-8.637V8.637C38.687 3.867 34.75 0 29.895 0Z"
      />
      <path
        fill="url(#c)"
        d="M29.895 0H8.791C3.937 0 0 3.867 0 8.637v20.728c0 4.77 3.937 8.637 8.792 8.637h21.102c4.856 0 8.793-3.867 8.793-8.637V8.637C38.687 3.867 34.75 0 29.895 0Z"
      />
      <path
        fill="url(#d)"
        d="M29.895 0H8.791C3.937 0 0 3.867 0 8.637v20.728c0 4.77 3.937 8.637 8.792 8.637h21.102c4.856 0 8.793-3.867 8.793-8.637V8.637C38.687 3.867 34.75 0 29.895 0Z"
      />
      <path
        fill="url(#e)"
        d="M29.895 0H8.791C3.937 0 0 3.867 0 8.637v20.728c0 4.77 3.937 8.637 8.792 8.637h21.102c4.856 0 8.793-3.867 8.793-8.637V8.637C38.687 3.867 34.75 0 29.895 0Z"
      />
      <path
        fill="#F5F5F5"
        d="M15.892 29.19v-8.814l8.719 8.815h4.85v-.23l-10.029-10.04 9.258-9.524v-.112h-4.883L15.892 17.7V9.285H11.96V29.19h3.931Z"
      />
    </g>
    <defs>
      <radialGradient
        id="c"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="matrix(43.7508 -43.21048 43.85415 44.40253 1.848 36.562)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#232DE3" />
        <stop offset={1} stopColor="#232DE3" stopOpacity={0} />
      </radialGradient>
      <radialGradient
        id="d"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="matrix(-29.03064 -25.27423 38.4475 -44.16182 36.603 37.785)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#8B4DFF" />
        <stop offset={1} stopColor="#8B4DFF" stopOpacity={0} />
      </radialGradient>
      <radialGradient
        id="e"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="matrix(0 29.9615 -74.0047 0 19.021 .282)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#24D5FF" />
        <stop offset={1} stopColor="#1BB8FF" stopOpacity={0} />
      </radialGradient>
      <linearGradient
        id="b"
        x1={19.343}
        x2={19.343}
        y1={0}
        y2={38.002}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#1FD1FF" />
        <stop offset={1} stopColor="#1BB8FF" />
      </linearGradient>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h38.687v38.002H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default KeplrLogo
