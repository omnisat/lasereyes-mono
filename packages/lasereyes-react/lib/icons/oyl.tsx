import * as React from "react";

interface OylLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  variant?: "first" | "second";
}

const OylLogo: React.FC<OylLogoProps> = ({
  size = 42,
  variant = "first",
  className,
  ...props
}) => {
  if (variant === "first") {
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 42 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <rect
          width="42"
          height="42"
          rx="10"
          fill="#090A0C"
          style={{ fill: "#090A0C", fillOpacity: 1 }}
        />
        <path
          d="M21 14C29.222 14 38 15.9676 38 20.9054C38 25.8622 29.222 28 21 28C12.778 28 4 26.0324 4 21.0946C4 16.1378 12.778 14 21 14ZM21.0397 25.3135C24.6939 25.3135 30.1752 24.3297 30.1752 21C30.1752 17.6703 24.6939 16.6865 21.0397 16.6865H20.9603C17.3061 16.6865 11.8248 17.6703 11.8248 21C11.8248 24.3297 17.3061 25.3135 20.9603 25.3135H21.0397Z"
          fill="white"
          style={{ fill: "white", fillOpacity: 1 }}
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        width="42"
        height="42"
        rx="10"
        fill="white"
        style={{ fill: "white", fillOpacity: 1 }}
      />
      <path
        d="M21 14C29.222 14 38 15.9676 38 20.9054C38 25.8622 29.222 28 21 28C12.778 28 4 26.0324 4 21.0946C4 16.1378 12.778 14 21 14ZM21.0397 25.3135C24.6939 25.3135 30.1752 24.3297 30.1752 21C30.1752 17.6703 24.6939 16.6865 21.0397 16.6865H20.9603C17.3061 16.6865 11.8248 17.6703 11.8248 21C11.8248 24.3297 17.3061 25.3135 20.9603 25.3135H21.0397Z"
        fill="#090A0C"
        style={{ fill: "#090A0C", fillOpacity: 1 }}
      />
    </svg>
  );
};

export { OylLogo };
