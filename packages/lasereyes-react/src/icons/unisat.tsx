import * as React from 'react'

interface UnisatLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  variant?: 'first' | 'second'
}

const UnisatLogo: React.FC<UnisatLogoProps> = ({
  size = 42,
  variant = 'first',
  className,
  ...props
}) => {
  return (
    <svg
      id="Layer_2"
      data-name="Layer 2"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 115.77 147.7"
      {...props}
    >
      <defs>
        <linearGradient
          id="_未命名的渐变_5"
          x1="3379.03"
          x2="3415.48"
          y1="-2102"
          y2="-2198.11"
          data-name="未命名的渐变 5"
          gradientTransform="rotate(-134.73 2187.667 -353.427)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#201c1b"></stop>
          <stop offset="0.36" stopColor="#77390d"></stop>
          <stop offset="0.67" stopColor="#ea8101"></stop>
          <stop offset="1" stopColor="#f4b852"></stop>
        </linearGradient>
        <linearGradient
          id="_未命名的渐变_4"
          x1="3384.23"
          x2="3330.64"
          y1="-2231.42"
          y2="-2131.29"
          data-name="未命名的渐变 4"
          gradientTransform="rotate(-134.73 2187.667 -353.427)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#1f1d1c"></stop>
          <stop offset="0.37" stopColor="#77390d"></stop>
          <stop offset="0.67" stopColor="#ea8101"></stop>
          <stop offset="1" stopColor="#f4fb52"></stop>
        </linearGradient>
        <radialGradient
          id="_未命名的渐变_6"
          cx="53.01"
          cy="45.84"
          r="11.13"
          data-name="未命名的渐变 6"
          fx="53.01"
          fy="45.84"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#f4b852"></stop>
          <stop offset="0.33" stopColor="#ea8101"></stop>
          <stop offset="0.64" stopColor="#77390d"></stop>
          <stop offset="1" stopColor="#211c1d"></stop>
        </radialGradient>
      </defs>
      <g id="_图层_1-2" data-name="图层 1">
        <path
          fill="url(#_未命名的渐变_5)"
          d="m81.66 13.29 30.31 30.02c2.58 2.55 3.85 5.13 3.81 7.73s-1.15 4.97-3.32 7.12c-2.27 2.25-4.72 3.39-7.34 3.44-2.62.04-5.22-1.22-7.8-3.77l-31-30.7c-3.52-3.49-6.92-5.96-10.19-7.41s-6.71-1.68-10.31-.68c-3.61.99-7.48 3.54-11.63 7.64-5.72 5.67-8.45 10.99-8.17 15.96s3.12 10.13 8.51 15.46l31.25 30.96c2.61 2.58 3.89 5.16 3.85 7.72-.04 2.57-1.16 4.94-3.37 7.13-2.2 2.18-4.63 3.32-7.27 3.41s-5.27-1.16-7.87-3.74L20.81 73.56q-7.395-7.32-10.68-13.86c-2.19-4.36-3.01-9.29-2.44-14.79.51-4.71 2.02-9.27 4.54-13.69 2.51-4.42 6.11-8.94 10.78-13.57 5.56-5.51 10.87-9.73 15.93-12.67C43.99 2.04 48.88.41 53.6.07c4.73-.34 9.39.6 14 2.82s9.29 5.68 14.05 10.4Z"
        ></path>
        <path
          fill="url(#_未命名的渐变_4)"
          d="M34.11 134.42 3.81 104.4C1.23 101.84-.04 99.27 0 96.67s1.15-4.97 3.32-7.12c2.27-2.25 4.72-3.39 7.34-3.44 2.62-.04 5.22 1.21 7.8 3.77l30.99 30.7c3.53 3.49 6.92 5.96 10.19 7.41s6.71 1.67 10.32.68 7.48-3.54 11.63-7.65c5.72-5.67 8.45-10.99 8.17-15.96s-3.12-10.13-8.51-15.47L64.6 73.24c-2.61-2.58-3.89-5.16-3.85-7.72.04-2.57 1.16-4.94 3.37-7.13 2.2-2.18 4.63-3.32 7.27-3.41s5.27 1.16 7.87 3.74l15.7 15.41q7.395 7.32 10.68 13.86c2.19 4.36 3.01 9.29 2.44 14.79-.51 4.71-2.02 9.27-4.54 13.69-2.51 4.42-6.11 8.94-10.78 13.57-5.56 5.51-10.87 9.73-15.93 12.67s-9.95 4.58-14.68 4.92-9.39-.6-14-2.82-9.29-5.68-14.05-10.4Z"
        ></path>
        <circle
          cx="53.01"
          cy="45.83"
          r="11.13"
          fill="url(#_未命名的渐变_6)"
        ></circle>
      </g>
    </svg>
  )
}

export { UnisatLogo }
