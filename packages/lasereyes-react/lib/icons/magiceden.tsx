import * as React from 'react'

interface MagicedenLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  variant?: 'first' | 'second'
}

const MagicEdenLogo: React.FC<MagicedenLogoProps> = ({
  size = 42,
  variant = 'first',
  className,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      viewBox="0 0 42 42"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_17_93)">
        <path
          fill="#070C34"
          d="M32 0H10C4.477 0 0 4.477 0 10v22c0 5.523 4.477 10 10 10h22c5.523 0 10-4.477 10-10V10c0-5.523-4.477-10-10-10Z"
        />
        <path
          fill="url(#paint0_linear_17_93)"
          d="m27.666 16.837 1.874 2.177c.215.245.404.446.483.562.56.55.874 1.293.874 2.07-.053.915-.657 1.54-1.213 2.205l-1.311 1.521-.685.79a.184.184 0 0 0 .046.281c.033.02.07.028.107.026h6.835c1.045 0 2.36.868 2.283 2.184 0 .597-.247 1.171-.68 1.595a2.36 2.36 0 0 1-1.637.664H23.936c-.704 0-2.598.076-3.128-1.521a1.841 1.841 0 0 1-.043-1.035 4.5 4.5 0 0 1 .72-1.404 65.543 65.543 0 0 1 1.695-2.343c.741-1.002 1.503-1.971 2.251-2.992a.19.19 0 0 0 .04-.116.19.19 0 0 0-.04-.116l-2.72-3.156a.192.192 0 0 0-.153-.073.192.192 0 0 0-.152.073c-.728.96-3.917 5.203-4.598 6.063-.68.86-2.355.907-3.283 0l-4.255-4.161a.197.197 0 0 0-.1-.053.195.195 0 0 0-.2.082.192.192 0 0 0-.032.106v8a2.678 2.678 0 0 1-.494 1.594c-.33.466-.804.823-1.352 1.014a2.375 2.375 0 0 1-2.111-.293 2.271 2.271 0 0 1-.72-.805A2.22 2.22 0 0 1 5 28.736V14.349a2.416 2.416 0 0 1 .548-1.422c.33-.406.785-.7 1.298-.841a2.632 2.632 0 0 1 2.502.664l6.54 6.381c.019.02.043.034.07.043a.197.197 0 0 0 .161-.013.188.188 0 0 0 .061-.054l4.646-6.27c.215-.254.485-.46.79-.601.304-.142.636-.217.976-.221H34.68c.33 0 .657.07.959.204a2.31 2.31 0 0 1 1.263 1.409c.096.309.122.633.079.952a2.288 2.288 0 0 1-.813 1.42c-.439.364-.996.56-1.572.551h-6.768a.188.188 0 0 0-.163.099.187.187 0 0 0-.022.095c0 .032.013.065.032.093h-.008Z"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_17_93"
          x1="-0.315"
          x2="35.366"
          y1="9.343"
          y2="30.176"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.23" stopColor="#FF0074" />
          <stop offset="0.26" stopColor="#FF0068" />
          <stop offset="0.32" stopColor="#FF0048" />
          <stop offset="0.39" stopColor="#FF0015" />
          <stop offset="0.41" stopColor="#FF0009" />
          <stop offset="0.43" stopColor="#FF0908" />
          <stop offset="0.54" stopColor="#FF4003" />
          <stop offset="0.62" stopColor="#FF6201" />
          <stop offset="0.66" stopColor="#FF6F00" />
          <stop offset="0.72" stopColor="#FF8700" />
          <stop offset="0.83" stopColor="#FFAB00" />
          <stop offset="0.92" stopColor="#FFC100" />
          <stop offset="0.98" stopColor="#FFCA00" />
        </linearGradient>
        <clipPath id="clip0_17_93">
          <path fill="#fff" d="M0 0h42v42H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export { MagicEdenLogo }
