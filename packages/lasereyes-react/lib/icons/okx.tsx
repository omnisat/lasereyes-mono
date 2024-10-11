import * as React from "react";

interface OkxLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  variant?: "first" | "second";
}

const OkxLogo: React.FC<OkxLogoProps> = ({
  size = 42,
  variant = "first",
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
        <g fill="#fff" clipPath="url(#b)">
          <path d="M24.578 17.052h-6.787a.523.523 0 0 0-.52.52v6.788c0 .286.235.52.52.52h6.787c.286 0 .521-.234.521-.52v-6.787a.523.523 0 0 0-.52-.521ZM16.733 9.223H9.946a.523.523 0 0 0-.521.521v6.787c0 .286.235.521.52.521h6.788c.285 0 .52-.235.52-.52V9.743a.523.523 0 0 0-.52-.52ZM32.424 9.223h-6.787a.523.523 0 0 0-.521.521v6.787c0 .286.235.521.52.521h6.788c.286 0 .52-.235.52-.52V9.743a.523.523 0 0 0-.52-.52ZM16.733 24.898H9.946a.523.523 0 0 0-.521.52v6.788c0 .285.235.52.52.52h6.788c.285 0 .52-.235.52-.52v-6.788a.523.523 0 0 0-.52-.52ZM32.424 24.898h-6.787a.523.523 0 0 0-.521.52v6.788c0 .285.235.52.52.52h6.788c.286 0 .52-.235.52-.52v-6.788a.523.523 0 0 0-.52-.52Z" />
        </g>
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h42v42H0z" />
        </clipPath>
        <clipPath id="b">
          <path fill="#fff" d="M0 0h42v42H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export { OkxLogo };
