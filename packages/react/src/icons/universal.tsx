import * as React from 'react'

interface UniversalLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  variant?: 'first' | 'second'
}

const UniversalLogo: React.FC<UniversalLogoProps> = ({
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
      viewBox="0 0 20.2 13.4"
      {...props}
    >
      <defs>
        <style>
          {`.cls-1 {
            fill: #231f20;
            stroke-width: 0px;
          }`}
        </style>
      </defs>
      <g id="Layer_1-2" data-name="Layer 1-2">
        <g>
          <path 
            className="cls-1" 
            d="M5.9,9.9c-1-1.7.9-4.6,4.2-6.6,3.3-2,6.8-2.2,7.8-.5.7,1.1,0,2.7-1.3,4.3,1.9-1.9,2.7-3.9,2-5.2C17.4,0,12.9.5,8.5,3.2,4.1,5.8,1.4,9.5,2.6,11.4c1.1,1.9,5.6,1.3,10-1.3.7-.4,1.3-.9,1.9-1.3-.3.2-.6.4-.9.6-3.3,2-6.8,2.2-7.8.5Z"
          />
          <path 
            className="cls-1" 
            d="M15.5,3.1c-.3,4.2-.5,4.5-4.7,4.7,4.2.3,4.5.5,4.7,4.7.3-4.2.5-4.5,4.7-4.7-4.2-.3-4.5-.5-4.7-4.7Z"
          />
        </g>
      </g>
    </svg>
  )
}

export { UniversalLogo }