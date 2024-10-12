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
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 42 42"
      fill="none"
      {...props}
    >
      <g clipPath="url(#a)">
        <path
          fill="#000"
          d="M32 0H10C4.477 0 0 4.477 0 10v22c0 5.523 4.477 10 10 10h22c5.523 0 10-4.477 10-10V10c0-5.523-4.477-10-10-10Z"
        />
        <path
          fill="url(#b)"
          d="m25.517 9.483 5.759 5.611c.49.477.731.959.724 1.445-.008.486-.219.929-.631 1.33-.431.421-.897.634-1.395.644-.497.007-.992-.228-1.482-.705l-5.89-5.738c-.669-.652-1.315-1.114-1.936-1.385a2.873 2.873 0 0 0-1.96-.127c-.685.185-1.42.662-2.21 1.428-1.086 1.06-1.605 2.054-1.552 2.983.053.929.593 1.893 1.617 2.89l5.938 5.786c.496.482.74.964.732 1.443-.008.48-.22.923-.64 1.332-.419.408-.88.62-1.382.638-.502.016-1.001-.217-1.495-.7l-5.76-5.61c-.936-.912-1.613-1.776-2.029-2.59-.416-.815-.572-1.737-.464-2.765.097-.88.384-1.732.863-2.558.477-.827 1.161-1.671 2.048-2.537C15.43 9.268 16.438 8.48 17.4 7.93c.96-.55 1.889-.854 2.786-.917.899-.064 1.784.112 2.66.527.876.415 1.765 1.061 2.67 1.943h.002Z"
        />
        <path
          fill="url(#c)"
          d="m16.482 32.123-5.758-5.611c-.49-.479-.731-.959-.724-1.445.008-.486.219-.929.631-1.33.431-.421.897-.634 1.395-.644.498-.007.992.227 1.482.705l5.888 5.738c.671.652 1.315 1.114 1.936 1.385.622.27 1.276.312 1.962.127.685-.185 1.42-.662 2.21-1.43 1.086-1.06 1.605-2.054 1.552-2.983-.053-.929-.593-1.893-1.617-2.891l-3.164-3.056c-.496-.482-.74-.964-.732-1.443.008-.48.22-.923.64-1.332.419-.408.88-.62 1.382-.638.502-.016 1.002.217 1.496.7l2.983 2.88c.936.912 1.613 1.775 2.03 2.59.415.815.571 1.736.463 2.764a6.477 6.477 0 0 1-.863 2.559c-.477.826-1.16 1.67-2.048 2.536-1.057 1.03-2.066 1.819-3.027 2.368-.962.55-1.89.856-2.79.92-.898.063-1.784-.113-2.66-.527-.876-.415-1.765-1.062-2.67-1.944l.003.002Z"
        />
        <path
          fill="url(#d)"
          d="M20.073 17.645c1.168 0 2.115-.93 2.115-2.08 0-1.149-.947-2.08-2.115-2.08-1.168 0-2.115.931-2.115 2.08 0 1.15.947 2.08 2.115 2.08Z"
        />
      </g>
      <defs>
        <linearGradient
          id="b"
          x1={30.329}
          x2={12.579}
          y1={12.752}
          y2={20.772}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#201C1B" />
          <stop offset={0.36} stopColor="#77390D" />
          <stop offset={0.67} stopColor="#EA8101" />
          <stop offset={1} stopColor="#F4B852" />
        </linearGradient>
        <linearGradient
          id="c"
          x1={12.163}
          x2={32.789}
          y1={29.085}
          y2={22.844}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1F1D1C" />
          <stop offset={0.37} stopColor="#77390D" />
          <stop offset={0.67} stopColor="#EA8101" />
          <stop offset={1} stopColor="#F4FB52" />
        </linearGradient>
        <radialGradient
          id="d"
          cx={0}
          cy={0}
          r={1}
          gradientTransform="matrix(2.11484 0 0 2.08019 20.073 15.567)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F4B852" />
          <stop offset={0.33} stopColor="#EA8101" />
          <stop offset={0.64} stopColor="#77390D" />
          <stop offset={1} stopColor="#211C1D" />
        </radialGradient>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h42v42H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export { UnisatLogo }
