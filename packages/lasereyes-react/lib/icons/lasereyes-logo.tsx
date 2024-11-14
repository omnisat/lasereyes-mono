const LaserEyesLogo = ({
  color = 'green',
  width = 135,
  height,
  className = '',
}: {
  color?: string
  width?: number
  height?: number
  className?: string
}) => {
  const aspectRatio = 135 / 56
  const calculatedHeight = height || width! / aspectRatio
  const calculatedWidth = width || height! * aspectRatio

  if (color === 'orange') {
    return (
      <svg
        width={calculatedWidth}
        height={calculatedHeight}
        viewBox="0 0 135 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(40.2375 0.395386) rotate(90)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(4.37114e-08 1 1 -4.37114e-08 95.47 0.395386)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(63.9086 31.9568) rotate(-180)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 71.7989 31.9568)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(40.2375 16.1761) rotate(90)"
          fill="#FF9345"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(4.37114e-08 1 1 -4.37114e-08 95.47 16.1761)"
          fill="#FF9345"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(32.3471 16.1761) rotate(90)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(4.37114e-08 1 1 -4.37114e-08 103.36 16.1761)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(32.3471 31.9568) rotate(90)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(4.37114e-08 1 1 -4.37114e-08 103.36 31.9568)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(48.1278 31.9568) rotate(90)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(4.37114e-08 1 1 -4.37114e-08 87.5797 31.9568)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(48.1278 16.1761) rotate(90)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(4.37114e-08 1 1 -4.37114e-08 87.5797 16.1761)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(48.1278 31.9568) rotate(-180)"
          fill="#FFDE31"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 87.5797 31.9568)"
          fill="#FFDE31"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(40.2375 31.9568) rotate(90)"
          fill="#FF9345"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(4.37114e-08 1 1 -4.37114e-08 95.47 31.9568)"
          fill="#FF9345"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(32.3471 31.9568) rotate(-180)"
          fill="#FFDE31"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 103.36 31.9568)"
          fill="#FFDE31"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(40.2375 39.8472) rotate(90)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(4.37114e-08 1 1 -4.37114e-08 95.47 39.8472)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(24.4567 31.9568) rotate(-180)"
          fill="#FF9345"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 111.251 31.9568)"
          fill="#FF9345"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(40.2375 47.7375) rotate(90)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(4.37114e-08 1 1 -4.37114e-08 95.47 47.7375)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(16.5664 31.9568) rotate(-180)"
          fill="#FF9345"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 119.141 31.9568)"
          fill="#FF9345"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(8.67601 31.9568) rotate(-180)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 127.031 31.9568)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(40.2375 8.28577) rotate(90)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(4.37114e-08 1 1 -4.37114e-08 95.47 8.28577)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(56.0182 31.9568) rotate(-180)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 79.6893 31.9568)"
          fill="#FF701E"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="translate(40.2375 24.0665) rotate(90)"
          fill="#FFF065"
        />
        <rect
          width={7.89036}
          height={7.89036}
          transform="matrix(4.37114e-08 1 1 -4.37114e-08 95.47 24.0665)"
          fill="#FFF065"
        />
      </svg>
    )
  }

  return (
    <svg
      width={calculatedWidth}
      height={calculatedHeight}
      viewBox="0 0 135 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(40.2375 0.232574) rotate(90)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(4.37114e-08 1 1 -4.37114e-08 95.47 0.232574)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(63.9086 31.794) rotate(-180)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 71.7989 31.794)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(40.2375 16.0133) rotate(90)"
        fill="#8AFF76"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(4.37114e-08 1 1 -4.37114e-08 95.47 16.0133)"
        fill="#8AFF76"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(32.3471 16.0133) rotate(90)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(4.37114e-08 1 1 -4.37114e-08 103.36 16.0133)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(32.3471 31.794) rotate(90)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(4.37114e-08 1 1 -4.37114e-08 103.36 31.794)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(48.1278 31.794) rotate(90)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(4.37114e-08 1 1 -4.37114e-08 87.5797 31.794)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(48.1278 16.0133) rotate(90)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(4.37114e-08 1 1 -4.37114e-08 87.5797 16.0133)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(48.1278 31.794) rotate(-180)"
        fill="#FFDE31"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 87.5797 31.794)"
        fill="#FFDE31"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(40.2375 31.794) rotate(90)"
        fill="#8AFF76"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(4.37114e-08 1 1 -4.37114e-08 95.47 31.794)"
        fill="#8AFF76"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(32.3471 31.794) rotate(-180)"
        fill="#FFDE31"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 103.36 31.794)"
        fill="#FFDE31"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(40.2375 39.6844) rotate(90)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(4.37114e-08 1 1 -4.37114e-08 95.47 39.6844)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(24.4567 31.794) rotate(-180)"
        fill="#8AFF76"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 111.251 31.794)"
        fill="#8AFF76"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(40.2375 47.5748) rotate(90)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(4.37114e-08 1 1 -4.37114e-08 95.47 47.5748)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(16.5664 31.794) rotate(-180)"
        fill="#8AFF76"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 119.141 31.794)"
        fill="#8AFF76"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(8.67601 31.794) rotate(-180)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 127.031 31.794)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(40.2375 8.12296) rotate(90)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(4.37114e-08 1 1 -4.37114e-08 95.47 8.12296)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(56.0182 31.794) rotate(-180)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(1 -8.74228e-08 -8.74228e-08 -1 79.6893 31.794)"
        fill="#00E45D"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="translate(40.2375 23.9037) rotate(90)"
        fill="#FFF065"
      />
      <rect
        width={7.89036}
        height={7.89036}
        transform="matrix(4.37114e-08 1 1 -4.37114e-08 95.47 23.9037)"
        fill="#FFF065"
      />
    </svg>
  )
}

export { LaserEyesLogo }
