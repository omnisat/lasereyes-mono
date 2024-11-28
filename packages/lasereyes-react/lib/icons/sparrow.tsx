interface SparrowLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  variant?: 'first' | 'second'
}

const SparrowLogo: React.FC<SparrowLogoProps> = ({
  size = 42,
  className,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    {...props}
  >
    <g>
      <path
        style={{
          opacity: 0.14,
        }}
        fill="#090a0b"
        d="M 81.5,9.5 C 82.2423,11.4258 83.2423,13.2591 84.5,15C 82.7184,15.1218 81.0518,14.6218 79.5,13.5C 79.2291,11.6203 79.8958,10.287 81.5,9.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#4f585a"
        d="M 125.5,38.5 C 112.548,31.863 99.8817,25.0297 87.5,18C 100.667,29.0023 113.667,40.1689 126.5,51.5C 127.634,54.3704 128.3,57.3704 128.5,60.5C 126.668,59.7515 125.001,58.7515 123.5,57.5C 110.167,46.8333 96.8333,36.1667 83.5,25.5C 80.3626,22.7015 78.0293,19.3681 76.5,15.5C 76.9731,14.0937 77.9731,13.427 79.5,13.5C 81.0518,14.6218 82.7184,15.1218 84.5,15C 83.2423,13.2591 82.2423,11.4258 81.5,9.5C 83.4346,8.29099 85.4346,8.45766 87.5,10C 100.414,19.2774 113.08,28.7774 125.5,38.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.161,
        }}
        fill="#08090a"
        d="M 76.5,15.5 C 78.0293,19.3681 80.3626,22.7015 83.5,25.5C 80.5498,24.6916 77.8831,23.3582 75.5,21.5C 73.9378,19.0993 74.2712,17.0993 76.5,15.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.999,
        }}
        fill="#778085"
        d="M 75.5,21.5 C 77.8831,23.3582 80.5498,24.6916 83.5,25.5C 96.8333,36.1667 110.167,46.8333 123.5,57.5C 118.285,55.5594 113.285,53.0594 108.5,50C 99.2121,47.5708 90.0454,44.7374 81,41.5C 80.2352,41.5699 79.7352,41.9033 79.5,42.5C 75.0157,41.6841 72.6824,39.0174 72.5,34.5C 72.8417,33.6618 73.5084,33.3284 74.5,33.5C 77.4258,34.868 80.4258,35.7013 83.5,36C 80.3333,32.8333 77.1667,29.6667 74,26.5C 73.51,25.2068 73.3433,23.8734 73.5,22.5C 73.8417,21.6618 74.5084,21.3284 75.5,21.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.165,
        }}
        fill="#070809"
        d="M 73.5,22.5 C 73.3433,23.8734 73.51,25.2068 74,26.5C 77.1667,29.6667 80.3333,32.8333 83.5,36C 80.4258,35.7013 77.4258,34.868 74.5,33.5C 73.2222,31.2009 71.8889,28.8676 70.5,26.5C 71.0351,24.739 72.0351,23.4057 73.5,22.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#8d9999"
        d="M 125.5,38.5 C 126.125,42.3258 126.791,46.1592 127.5,50C 127.43,50.7648 127.097,51.2648 126.5,51.5C 113.667,40.1689 100.667,29.0023 87.5,18C 99.8817,25.0297 112.548,31.863 125.5,38.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#8e9a9a"
        d="M 123.5,57.5 C 125.001,58.7515 126.668,59.7515 128.5,60.5C 128.5,61.8333 128.5,63.1667 128.5,64.5C 128.5,65.8333 128.5,67.1667 128.5,68.5C 112.879,61.0229 97.5452,53.0229 82.5,44.5C 81.2905,44.0679 80.2905,43.4013 79.5,42.5C 79.7352,41.9033 80.2352,41.5699 81,41.5C 90.0454,44.7374 99.2121,47.5708 108.5,50C 113.285,53.0594 118.285,55.5594 123.5,57.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#777f85"
        d="M 125.5,38.5 C 129.5,41.5 133.5,44.5 137.5,47.5C 136.428,51.7555 134.261,55.4222 131,58.5C 130.155,60.6115 129.322,62.6115 128.5,64.5C 128.5,63.1667 128.5,61.8333 128.5,60.5C 128.3,57.3704 127.634,54.3704 126.5,51.5C 127.097,51.2648 127.43,50.7648 127.5,50C 126.791,46.1592 126.125,42.3258 125.5,38.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.997,
        }}
        fill="#888889"
        d="M 58.5,63.5 C 48.5374,62.2002 38.7041,60.2002 29,57.5C 27.9302,57.528 27.0968,57.8614 26.5,58.5C 24.2459,57.5849 22.2459,56.2516 20.5,54.5C 18.4985,51.6662 15.9985,49.3329 13,47.5C 12.51,46.2068 12.3433,44.8734 12.5,43.5C 13.2506,42.4265 14.2506,42.2599 15.5,43C 29.1035,51.4694 43.4368,58.3027 58.5,63.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.17,
        }}
        fill="#0e0f0f"
        d="M 12.5,43.5 C 12.3433,44.8734 12.51,46.2068 13,47.5C 15.9985,49.3329 18.4985,51.6662 20.5,54.5C 20.44,55.0431 20.1067,55.3764 19.5,55.5C 16.3707,53.6001 13.0373,52.2667 9.5,51.5C 10.7279,49.9902 10.7279,48.4902 9.5,47C 10.1634,45.4815 11.1634,44.3149 12.5,43.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#7b848a"
        d="M 82.5,44.5 C 97.5452,53.0229 112.879,61.0229 128.5,68.5C 128.72,71.4005 128.054,74.0671 126.5,76.5C 113.14,69.1544 99.8062,61.8211 86.5,54.5C 83.5279,52.6778 80.5279,50.8445 77.5,49C 76.6198,47.6439 76.2865,46.1439 76.5,44.5C 78.7411,44.9539 80.7411,44.9539 82.5,44.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.153,
        }}
        fill="#050506"
        d="M 72.5,34.5 C 72.6824,39.0174 75.0157,41.6841 79.5,42.5C 80.2905,43.4013 81.2905,44.0679 82.5,44.5C 80.7411,44.9539 78.7411,44.9539 76.5,44.5C 76.2865,46.1439 76.6198,47.6439 77.5,49C 80.5279,50.8445 83.5279,52.6778 86.5,54.5C 86.2774,59.2804 87.944,63.2804 91.5,66.5C 91.1496,69.4534 92.1496,71.7867 94.5,73.5C 92.4471,73.5979 90.7804,72.9313 89.5,71.5C 89.6495,70.448 89.4828,69.448 89,68.5C 85.7393,65.9786 84.0726,62.6453 84,58.5C 80.5991,56.6387 77.5991,54.3053 75,51.5C 74.2419,49.2305 74.4086,47.0639 75.5,45C 70.4866,42.378 69.4866,38.878 72.5,34.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.016,
        }}
        fill="#0f1010"
        d="M 138.5,48.5 C 140.539,49.911 141.539,51.911 141.5,54.5C 139.992,52.8185 138.992,50.8185 138.5,48.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.999,
        }}
        fill="#343f49"
        d="M 9.5,51.5 C 13.0373,52.2667 16.3707,53.6001 19.5,55.5C 20.1067,55.3764 20.44,55.0431 20.5,54.5C 22.2459,56.2516 24.2459,57.5849 26.5,58.5C 35.1667,62.8333 43.8333,67.1667 52.5,71.5C 56.6478,75.4041 60.9811,79.0708 65.5,82.5C 65.5,82.8333 65.5,83.1667 65.5,83.5C 50.001,77.6719 34.6676,71.6719 19.5,65.5C 16.9116,63.4392 14.0783,60.7726 11,57.5C 9.87201,55.6547 9.37201,53.6547 9.5,51.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.191,
        }}
        fill="#070809"
        d="M 9.5,51.5 C 9.37201,53.6547 9.87201,55.6547 11,57.5C 14.0783,60.7726 16.9116,63.4392 19.5,65.5C 16.2854,65.0951 13.2854,64.0951 10.5,62.5C 8.3912,60.8783 7.3912,58.7116 7.5,56C 7.30684,53.9919 7.9735,52.4919 9.5,51.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.05,
        }}
        fill="#060707"
        d="M 141.5,54.5 C 142.633,56.0552 143.299,57.8886 143.5,60C 142.418,65.9944 141.418,71.9944 140.5,78C 140.899,79.7275 141.566,81.2275 142.5,82.5C 142.167,83.5 141.5,84.1667 140.5,84.5C 140.046,81.1349 139.38,77.8015 138.5,74.5C 139.874,67.8812 140.874,61.2146 141.5,54.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#c9cbcb"
        d="M 26.5,58.5 C 27.0968,57.8614 27.9302,57.528 29,57.5C 38.7041,60.2002 48.5374,62.2002 58.5,63.5C 61.221,63.9628 63.8877,64.6295 66.5,65.5C 72.5358,70.1912 78.8691,74.5245 85.5,78.5C 74.6653,76.7183 63.6653,74.385 52.5,71.5C 43.8333,67.1667 35.1667,62.8333 26.5,58.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#929294"
        d="M 10.5,62.5 C 13.2854,64.0951 16.2854,65.0951 19.5,65.5C 34.6676,71.6719 50.001,77.6719 65.5,83.5C 63.9504,84.7199 62.2837,84.7199 60.5,83.5C 47.2117,81.5939 34.2117,78.5939 21.5,74.5C 15.1127,73.7734 10.7793,70.4401 8.5,64.5C 8.83333,63.5 9.5,62.8333 10.5,62.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#494f51"
        d="M 137.5,47.5 C 138.167,47.5 138.5,47.8333 138.5,48.5C 138.992,50.8185 139.992,52.8185 141.5,54.5C 140.874,61.2146 139.874,67.8812 138.5,74.5C 139.38,77.8015 140.046,81.1349 140.5,84.5C 138.83,87.0016 136.664,89.0016 134,90.5C 132.478,88.2591 131.145,85.9258 130,83.5C 128.544,86.0324 127.377,88.6991 126.5,91.5C 115.094,82.7537 103.427,74.4203 91.5,66.5C 87.944,63.2804 86.2774,59.2804 86.5,54.5C 99.8062,61.8211 113.14,69.1544 126.5,76.5C 128.054,74.0671 128.72,71.4005 128.5,68.5C 128.5,67.1667 128.5,65.8333 128.5,64.5C 129.322,62.6115 130.155,60.6115 131,58.5C 134.261,55.4222 136.428,51.7555 137.5,47.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.183,
        }}
        fill="#060606"
        d="M 8.5,64.5 C 10.7793,70.4401 15.1127,73.7734 21.5,74.5C 19.3021,75.1653 16.9688,75.8319 14.5,76.5C 16.3737,81.6139 20.0404,84.6139 25.5,85.5C 26.5,85.5 27.5,85.5 28.5,85.5C 28.2627,86.791 28.596,87.791 29.5,88.5C 29.5106,90.0174 30.1772,91.1841 31.5,92C 34.7365,93.7862 38.0698,95.2862 41.5,96.5C 41.5,97.1667 41.8333,97.5 42.5,97.5C 42.5494,100.099 43.5494,102.266 45.5,104C 48.8168,104.498 52.1501,104.665 55.5,104.5C 55.2627,105.791 55.596,106.791 56.5,107.5C 56.9528,108.458 57.6195,109.292 58.5,110C 61.3771,111.127 64.3771,111.794 67.5,112C 68.9852,114.237 70.9852,115.737 73.5,116.5C 76.9386,117.019 80.272,118.019 83.5,119.5C 87.2508,121.079 91.2508,122.079 95.5,122.5C 95.5,122.833 95.5,123.167 95.5,123.5C 92.5715,130.285 90.2382,137.285 88.5,144.5C 88.1667,145.167 87.8333,145.833 87.5,146.5C 87.1667,146.5 86.8333,146.5 86.5,146.5C 87.7936,139.786 89.7936,133.286 92.5,127C 87.5169,126.897 83.1836,125.23 79.5,122C 74.2686,122.485 69.9353,120.819 66.5,117C 60.8614,116.865 56.528,114.531 53.5,110C 50.1853,109.059 46.852,108.226 43.5,107.5C 41.5592,105.166 39.8925,102.666 38.5,100C 32.4206,98.8085 28.0872,95.4752 25.5,90C 17.189,88.6898 12.689,83.8564 12,75.5C 9.28221,73.2292 7.44888,70.3958 6.5,67C 7.06594,66.0053 7.73261,65.172 8.5,64.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#b8b6ac"
        d="M 52.5,71.5 C 63.6653,74.385 74.6653,76.7183 85.5,78.5C 89.228,81.5589 93.228,84.2256 97.5,86.5C 91.3341,87.3789 85.0007,87.3789 78.5,86.5C 75.3915,86.7359 72.3915,86.4025 69.5,85.5C 68.205,84.5116 66.8717,83.5116 65.5,82.5C 60.9811,79.0708 56.6478,75.4041 52.5,71.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#343f48"
        d="M 21.5,74.5 C 34.2117,78.5939 47.2117,81.5939 60.5,83.5C 48.8333,84.1667 37.1667,84.8333 25.5,85.5C 20.0404,84.6139 16.3737,81.6139 14.5,76.5C 16.9688,75.8319 19.3021,75.1653 21.5,74.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#565a5e"
        d="M 66.5,65.5 C 74.1667,67.5 81.8333,69.5 89.5,71.5C 90.7804,72.9313 92.4471,73.5979 94.5,73.5C 104.436,81.5934 114.269,89.9267 124,98.5C 124.333,100.5 124.667,102.5 125,104.5C 127.25,100.332 129.75,96.3318 132.5,92.5C 130.604,91.5344 128.604,91.2011 126.5,91.5C 127.377,88.6991 128.544,86.0324 130,83.5C 131.145,85.9258 132.478,88.2591 134,90.5C 136.664,89.0016 138.83,87.0016 140.5,84.5C 141.5,84.1667 142.167,83.5 142.5,82.5C 146.184,80.4717 149.85,78.4717 153.5,76.5C 153.5,76.8333 153.5,77.1667 153.5,77.5C 150.542,81.6911 148.542,86.3578 147.5,91.5C 151.5,90.5 155.5,89.5 159.5,88.5C 160.492,88.3284 161.158,88.6618 161.5,89.5C 160.26,90.6588 158.926,91.6588 157.5,92.5C 154.615,92.1936 151.948,92.5269 149.5,93.5C 148.391,93.4431 147.391,93.1098 146.5,92.5C 142.6,91.5701 138.6,91.2367 134.5,91.5C 134.46,94.8806 134.793,98.2139 135.5,101.5C 135.5,102.833 135.5,104.167 135.5,105.5C 131.563,105.207 127.73,105.54 124,106.5C 115.993,99.572 107.493,93.2387 98.5,87.5C 98.5,86.8333 98.1667,86.5 97.5,86.5C 93.228,84.2256 89.228,81.5589 85.5,78.5C 78.8691,74.5245 72.5358,70.1912 66.5,65.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#c0bbb1"
        d="M 153.5,76.5 C 156.5,76.5 159.5,76.5 162.5,76.5C 164.526,80.5813 165.526,84.9146 165.5,89.5C 164.167,89.5 162.833,89.5 161.5,89.5C 161.158,88.6618 160.492,88.3284 159.5,88.5C 157.5,84.8333 155.5,81.1667 153.5,77.5C 153.5,77.1667 153.5,76.8333 153.5,76.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#7c858b"
        d="M 153.5,77.5 C 155.5,81.1667 157.5,84.8333 159.5,88.5C 155.5,89.5 151.5,90.5 147.5,91.5C 148.542,86.3578 150.542,81.6911 153.5,77.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.996,
        }}
        fill="#898a89"
        d="M 162.5,76.5 C 167.023,78.0073 171.523,79.674 176,81.5C 177.03,81.8361 177.53,82.5028 177.5,83.5C 177.992,85.8185 178.992,87.8185 180.5,89.5C 181.338,89.8417 181.672,90.5084 181.5,91.5C 178.012,91.7054 174.679,92.5387 171.5,94C 176.66,95.6954 181.66,97.5287 186.5,99.5C 181.93,100.441 177.263,100.774 172.5,100.5C 171.793,98.2186 170.793,96.0519 169.5,94C 165.534,93.1721 161.534,92.6721 157.5,92.5C 158.926,91.6588 160.26,90.6588 161.5,89.5C 162.184,91.1852 163.517,92.1852 165.5,92.5C 168.012,91.2162 168.012,90.2162 165.5,89.5C 165.526,84.9146 164.526,80.5813 162.5,76.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#5c676f"
        d="M 65.5,82.5 C 66.8717,83.5116 68.205,84.5116 69.5,85.5C 66.8333,87.5 64.1667,89.5 61.5,91.5C 51.2474,90.3957 41.0808,88.729 31,86.5C 29.9701,86.8361 29.4701,87.5028 29.5,88.5C 28.596,87.791 28.2627,86.791 28.5,85.5C 27.5,85.5 26.5,85.5 25.5,85.5C 37.1667,84.8333 48.8333,84.1667 60.5,83.5C 62.2837,84.7199 63.9504,84.7199 65.5,83.5C 65.5,83.1667 65.5,82.8333 65.5,82.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.018,
        }}
        fill="#191919"
        d="M 177.5,83.5 C 179.539,84.911 180.539,86.911 180.5,89.5C 178.992,87.8185 177.992,85.8185 177.5,83.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#cdcfd0"
        d="M 61.5,91.5 C 64.3522,93.0765 67.3522,94.5765 70.5,96C 60.8391,96.4998 51.1724,96.6665 41.5,96.5C 38.0698,95.2862 34.7365,93.7862 31.5,92C 30.1772,91.1841 29.5106,90.0174 29.5,88.5C 29.4701,87.5028 29.9701,86.8361 31,86.5C 41.0808,88.729 51.2474,90.3957 61.5,91.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#7c858b"
        d="M 78.5,86.5 C 85.0007,87.3789 91.3341,87.3789 97.5,86.5C 98.1667,86.5 98.5,86.8333 98.5,87.5C 95.9058,93.1859 92.9058,98.6859 89.5,104C 89.7284,104.399 90.0618,104.565 90.5,104.5C 94.7789,107.029 99.1122,109.363 103.5,111.5C 97.296,115.128 90.6293,117.795 83.5,119.5C 80.272,118.019 76.9386,117.019 73.5,116.5C 76.1873,116.664 78.854,116.497 81.5,116C 83.5871,112.492 85.9204,109.158 88.5,106C 88.2716,105.601 87.9382,105.435 87.5,105.5C 87.5,104.833 87.5,104.167 87.5,103.5C 87.9382,103.565 88.2716,103.399 88.5,103C 84.7673,97.6938 81.434,92.1938 78.5,86.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#3c413e"
        d="M 91.5,66.5 C 103.427,74.4203 115.094,82.7537 126.5,91.5C 128.604,91.2011 130.604,91.5344 132.5,92.5C 129.75,96.3318 127.25,100.332 125,104.5C 124.667,102.5 124.333,100.5 124,98.5C 114.269,89.9267 104.436,81.5934 94.5,73.5C 92.1496,71.7867 91.1496,69.4534 91.5,66.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#e2730e"
        d="M 161.5,89.5 C 162.833,89.5 164.167,89.5 165.5,89.5C 168.012,90.2162 168.012,91.2162 165.5,92.5C 163.517,92.1852 162.184,91.1852 161.5,89.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#b7b5ac"
        d="M 146.5,92.5 C 147.265,95.0961 147.599,97.7628 147.5,100.5C 147.5,100.833 147.5,101.167 147.5,101.5C 143.569,102.132 140.235,103.799 137.5,106.5C 137.167,106.5 136.833,106.5 136.5,106.5C 136.784,104.585 136.451,102.919 135.5,101.5C 134.793,98.2139 134.46,94.8806 134.5,91.5C 138.6,91.2367 142.6,91.5701 146.5,92.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.998,
        }}
        fill="#babbba"
        d="M 181.5,91.5 C 184.81,93.4821 187.81,95.8154 190.5,98.5C 189.432,99.4345 188.099,99.7678 186.5,99.5C 181.66,97.5287 176.66,95.6954 171.5,94C 174.679,92.5387 178.012,91.7054 181.5,91.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#353f49"
        d="M 146.5,92.5 C 147.391,93.1098 148.391,93.4431 149.5,93.5C 153.167,94.1667 156.833,94.8333 160.5,95.5C 156.624,98.1293 152.29,99.796 147.5,100.5C 147.599,97.7628 147.265,95.0961 146.5,92.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#d0c9c0"
        d="M 149.5,93.5 C 151.948,92.5269 154.615,92.1936 157.5,92.5C 161.534,92.6721 165.534,93.1721 169.5,94C 170.793,96.0519 171.793,98.2186 172.5,100.5C 168.52,98.8702 164.52,97.2035 160.5,95.5C 156.833,94.8333 153.167,94.1667 149.5,93.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#7e8182"
        d="M 160.5,95.5 C 164.52,97.2035 168.52,98.8702 172.5,100.5C 172.5,101.167 172.167,101.5 171.5,101.5C 163.981,101.175 156.648,101.508 149.5,102.5C 148.833,102.167 148.167,101.833 147.5,101.5C 147.5,101.167 147.5,100.833 147.5,100.5C 152.29,99.796 156.624,98.1293 160.5,95.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#5c666f"
        d="M 42.5,97.5 C 52.1724,97.3335 61.8391,97.5002 71.5,98C 66.7133,99.8932 62.0466,102.06 57.5,104.5C 56.6143,105.325 56.281,106.325 56.5,107.5C 55.596,106.791 55.2627,105.791 55.5,104.5C 52.1501,104.665 48.8168,104.498 45.5,104C 43.5494,102.266 42.5494,100.099 42.5,97.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#5d6871"
        d="M 87.5,103.5 C 87.5,104.167 87.5,104.833 87.5,105.5C 81.5738,106.774 75.7404,108.441 70,110.5C 69.5,110.167 69,109.833 68.5,109.5C 69.9376,105.167 71.9376,101.167 74.5,97.5C 78.9793,99.2405 83.3126,101.24 87.5,103.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.165,
        }}
        fill="#070707"
        d="M 190.5,98.5 C 192.676,99.7133 193.009,101.38 191.5,103.5C 185.274,105.018 178.94,105.852 172.5,106C 168.352,109.314 164.352,112.814 160.5,116.5C 157.833,124.323 154.667,131.99 151,139.5C 147.796,142.369 144.963,145.535 142.5,149C 139.761,150.026 137.428,151.526 135.5,153.5C 134.609,152.89 133.609,152.557 132.5,152.5C 131.833,152.5 131.167,152.5 130.5,152.5C 130.5,151.833 130.5,151.167 130.5,150.5C 131.167,150.5 131.5,150.167 131.5,149.5C 139.372,146.766 145.372,141.766 149.5,134.5C 150.167,134.5 150.5,134.167 150.5,133.5C 153.099,127.704 155.099,121.704 156.5,115.5C 157.167,115.5 157.5,115.167 157.5,114.5C 157.833,113.5 158.5,112.833 159.5,112.5C 163.5,108.833 167.5,105.167 171.5,101.5C 172.167,101.5 172.5,101.167 172.5,100.5C 177.263,100.774 181.93,100.441 186.5,99.5C 188.099,99.7678 189.432,99.4345 190.5,98.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#cdcfcf"
        d="M 147.5,101.5 C 148.167,101.833 148.833,102.167 149.5,102.5C 153.14,105.473 156.473,108.806 159.5,112.5C 158.5,112.833 157.833,113.5 157.5,114.5C 150.833,111.833 144.167,109.167 137.5,106.5C 140.235,103.799 143.569,102.132 147.5,101.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#343e48"
        d="M 171.5,101.5 C 167.5,105.167 163.5,108.833 159.5,112.5C 156.473,108.806 153.14,105.473 149.5,102.5C 156.648,101.508 163.981,101.175 171.5,101.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#969798"
        d="M 69.5,85.5 C 72.3915,86.4025 75.3915,86.7359 78.5,86.5C 81.434,92.1938 84.7673,97.6938 88.5,103C 88.2716,103.399 87.9382,103.565 87.5,103.5C 83.3126,101.24 78.9793,99.2405 74.5,97.5C 71.9376,101.167 69.9376,105.167 68.5,109.5C 69,109.833 69.5,110.167 70,110.5C 75.7404,108.441 81.5738,106.774 87.5,105.5C 87.9382,105.435 88.2716,105.601 88.5,106C 85.9204,109.158 83.5871,112.492 81.5,116C 78.854,116.497 76.1873,116.664 73.5,116.5C 70.9852,115.737 68.9852,114.237 67.5,112C 64.3771,111.794 61.3771,111.127 58.5,110C 57.6195,109.292 56.9528,108.458 56.5,107.5C 56.281,106.325 56.6143,105.325 57.5,104.5C 62.0466,102.06 66.7133,99.8932 71.5,98C 61.8391,97.5002 52.1724,97.3335 42.5,97.5C 41.8333,97.5 41.5,97.1667 41.5,96.5C 51.1724,96.6665 60.8391,96.4998 70.5,96C 67.3522,94.5765 64.3522,93.0765 61.5,91.5C 64.1667,89.5 66.8333,87.5 69.5,85.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#bfc2c4"
        d="M 90.5,104.5 C 100.989,105.041 111.322,105.707 121.5,106.5C 115.431,107.914 109.431,109.581 103.5,111.5C 99.1122,109.363 94.7789,107.029 90.5,104.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#5d6870"
        d="M 98.5,87.5 C 107.493,93.2387 115.993,99.572 124,106.5C 127.73,105.54 131.563,105.207 135.5,105.5C 135.5,104.167 135.5,102.833 135.5,101.5C 136.451,102.919 136.784,104.585 136.5,106.5C 135.724,113.137 135.391,119.804 135.5,126.5C 129.121,126.038 122.788,125.538 116.5,125C 118.606,128.039 120.106,131.205 121,134.5C 116.332,132.082 111.499,130.082 106.5,128.5C 106.5,128.167 106.5,127.833 106.5,127.5C 106.5,126.833 106.833,126.5 107.5,126.5C 110.315,126.796 112.982,125.796 115.5,123.5C 114.639,121.089 113.306,119.089 111.5,117.5C 115.841,114.189 119.174,110.522 121.5,106.5C 111.322,105.707 100.989,105.041 90.5,104.5C 90.0618,104.565 89.7284,104.399 89.5,104C 92.9058,98.6859 95.9058,93.1859 98.5,87.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#959697"
        d="M 136.5,106.5 C 136.833,106.5 137.167,106.5 137.5,106.5C 144.167,109.167 150.833,111.833 157.5,114.5C 157.5,115.167 157.167,115.5 156.5,115.5C 150.409,118.408 144.409,121.574 138.5,125C 137.619,125.708 136.953,126.542 136.5,127.5C 131.952,129.107 127.619,131.274 123.5,134C 127.152,134.499 130.818,134.665 134.5,134.5C 131.038,135.482 127.371,135.815 123.5,135.5C 121.308,139.098 120.308,143.098 120.5,147.5C 119.869,149.934 118.869,152.268 117.5,154.5C 116.833,155.5 116.167,156.5 115.5,157.5C 114.18,156.058 112.514,155.392 110.5,155.5C 108.704,154.207 107.037,152.707 105.5,151C 108.833,150.667 112.167,150.333 115.5,150C 107.624,149.113 99.7911,147.946 92,146.5C 90.6244,146.316 89.7911,145.649 89.5,144.5C 95.1404,139.195 100.807,133.861 106.5,128.5C 111.499,130.082 116.332,132.082 121,134.5C 120.106,131.205 118.606,128.039 116.5,125C 122.788,125.538 129.121,126.038 135.5,126.5C 135.391,119.804 135.724,113.137 136.5,106.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#56595b"
        d="M 121.5,106.5 C 119.174,110.522 115.841,114.189 111.5,117.5C 106.167,119.167 100.833,120.833 95.5,122.5C 91.2508,122.079 87.2508,121.079 83.5,119.5C 90.6293,117.795 97.296,115.128 103.5,111.5C 109.431,109.581 115.431,107.914 121.5,106.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#56585a"
        d="M 156.5,115.5 C 155.099,121.704 153.099,127.704 150.5,133.5C 145.597,132.048 140.93,130.048 136.5,127.5C 136.953,126.542 137.619,125.708 138.5,125C 144.409,121.574 150.409,118.408 156.5,115.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#858689"
        d="M 111.5,117.5 C 110.16,120.529 108.827,123.529 107.5,126.5C 106.833,126.5 106.5,126.833 106.5,127.5C 102.721,126.442 99.0541,125.109 95.5,123.5C 95.5,123.167 95.5,122.833 95.5,122.5C 100.833,120.833 106.167,119.167 111.5,117.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#37414b"
        d="M 111.5,117.5 C 113.306,119.089 114.639,121.089 115.5,123.5C 112.982,125.796 110.315,126.796 107.5,126.5C 108.827,123.529 110.16,120.529 111.5,117.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#343e48"
        d="M 95.5,123.5 C 99.0541,125.109 102.721,126.442 106.5,127.5C 106.5,127.833 106.5,128.167 106.5,128.5C 100.807,133.861 95.1404,139.195 89.5,144.5C 89.1667,144.5 88.8333,144.5 88.5,144.5C 90.2382,137.285 92.5715,130.285 95.5,123.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#ced0d0"
        d="M 136.5,127.5 C 140.93,130.048 145.597,132.048 150.5,133.5C 150.5,134.167 150.167,134.5 149.5,134.5C 144.5,134.5 139.5,134.5 134.5,134.5C 130.818,134.665 127.152,134.499 123.5,134C 127.619,131.274 131.952,129.107 136.5,127.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#7b8389"
        d="M 134.5,134.5 C 139.5,134.5 144.5,134.5 149.5,134.5C 145.372,141.766 139.372,146.766 131.5,149.5C 128.406,145.074 125.739,140.407 123.5,135.5C 127.371,135.815 131.038,135.482 134.5,134.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#36414b"
        d="M 123.5,135.5 C 125.739,140.407 128.406,145.074 131.5,149.5C 131.5,150.167 131.167,150.5 130.5,150.5C 126.881,150.119 123.548,149.119 120.5,147.5C 120.308,143.098 121.308,139.098 123.5,135.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#5d676f"
        d="M 88.5,144.5 C 88.8333,144.5 89.1667,144.5 89.5,144.5C 89.7911,145.649 90.6244,146.316 92,146.5C 99.7911,147.946 107.624,149.113 115.5,150C 112.167,150.333 108.833,150.667 105.5,151C 107.037,152.707 108.704,154.207 110.5,155.5C 107.085,162 103.418,168.333 99.5,174.5C 101.095,168.717 103.095,163.051 105.5,157.5C 103.5,156.833 101.5,156.167 99.5,155.5C 101.316,154.185 102.983,152.685 104.5,151C 99.8333,150.333 95.1667,150.333 90.5,151C 91.4118,153.205 92.7451,155.038 94.5,156.5C 94.5,157.167 94.1667,157.5 93.5,157.5C 83.3942,165.095 73.3942,172.928 63.5,181C 62.8333,181.667 62.1667,181.667 61.5,181C 69.3025,172.197 77.4691,163.697 86,155.5C 87.1821,153.656 88.3488,151.823 89.5,150C 89.1918,148.541 88.5251,147.374 87.5,146.5C 87.8333,145.833 88.1667,145.167 88.5,144.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.999,
        }}
        fill="#5e686e"
        d="M 120.5,147.5 C 123.548,149.119 126.881,150.119 130.5,150.5C 130.5,151.167 130.5,151.833 130.5,152.5C 129.039,151.314 127.705,151.314 126.5,152.5C 123.402,152.756 120.402,153.422 117.5,154.5C 118.869,152.268 119.869,149.934 120.5,147.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.961,
        }}
        fill="#b3afa3"
        d="M 130.5,152.5 C 131.167,152.5 131.833,152.5 132.5,152.5C 133.306,153.728 134.306,154.728 135.5,155.5C 132.145,155.31 129.145,154.31 126.5,152.5C 127.705,151.314 129.039,151.314 130.5,152.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.988,
        }}
        fill="#686b65"
        d="M 132.5,152.5 C 133.609,152.557 134.609,152.89 135.5,153.5C 137.292,153.366 138.958,153.699 140.5,154.5C 139.789,156.03 138.789,157.363 137.5,158.5C 134.932,158.594 133.432,159.928 133,162.5C 131.794,159.162 132.96,157.329 136.5,157C 135.944,156.617 135.611,156.117 135.5,155.5C 134.306,154.728 133.306,153.728 132.5,152.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.176,
        }}
        fill="#030404"
        d="M 110.5,155.5 C 112.514,155.392 114.18,156.058 115.5,157.5C 117.986,159.155 119.986,161.322 121.5,164C 119.419,166.818 119.085,169.818 120.5,173C 121.167,173.667 121.833,173.667 122.5,173C 120.775,166.133 122.608,164.966 128,169.5C 129.505,171.298 129.672,173.132 128.5,175C 132.204,174.516 132.538,172.849 129.5,170C 132.657,170.176 134.157,172.009 134,175.5C 135.689,173.68 135.855,171.68 134.5,169.5C 137.686,172.399 138.02,175.566 135.5,179C 132.207,179.826 128.874,180.326 125.5,180.5C 127.089,177.036 126.589,174.036 124,171.5C 125.225,174.331 124.559,176.664 122,178.5C 119.086,177.252 117.253,175.086 116.5,172C 117.791,169.95 118.291,167.783 118,165.5C 116.316,163.649 114.483,161.982 112.5,160.5C 111.522,160.977 110.689,161.643 110,162.5C 105.922,170.991 101.588,179.324 97,187.5C 95.786,189.049 94.286,190.215 92.5,191C 77.4054,197.181 62.9054,196.014 49,187.5C 48.1742,184.788 48.6742,182.455 50.5,180.5C 50.238,181.978 50.5713,183.311 51.5,184.5C 56.3296,185.951 60.9962,187.617 65.5,189.5C 70.2981,190.744 74.9648,190.744 79.5,189.5C 82.9419,190.172 85.6086,189.172 87.5,186.5C 90.1569,186.838 92.4902,186.171 94.5,184.5C 96.705,181.423 98.3716,178.09 99.5,174.5C 103.418,168.333 107.085,162 110.5,155.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#555759"
        d="M 94.5,156.5 C 96.0481,156.821 96.7148,157.821 96.5,159.5C 89.8331,168.856 83.4997,178.523 77.5,188.5C 77.9569,189.298 78.6236,189.631 79.5,189.5C 74.9648,190.744 70.2981,190.744 65.5,189.5C 68.4045,187.101 71.2379,184.435 74,181.5C 80.2688,173.286 86.7688,165.286 93.5,157.5C 94.1667,157.5 94.5,157.167 94.5,156.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.99,
        }}
        fill="#2d363e"
        d="M 140.5,154.5 C 143.802,155.294 147.135,155.96 150.5,156.5C 149.645,158.787 149.478,161.12 150,163.5C 148.334,164.34 148.167,163.84 149.5,162C 148.25,159.375 146.25,158.375 143.5,159C 146.47,162.145 145.97,164.645 142,166.5C 141.667,164.953 142.167,163.62 143.5,162.5C 142.833,159.167 140.833,157.833 137.5,158.5C 138.789,157.363 139.789,156.03 140.5,154.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#898f8c"
        d="M 99.5,174.5 C 98.3716,178.09 96.705,181.423 94.5,184.5C 92.4902,186.171 90.1569,186.838 87.5,186.5C 90.2985,177.438 93.2985,168.438 96.5,159.5C 96.7148,157.821 96.0481,156.821 94.5,156.5C 92.7451,155.038 91.4118,153.205 90.5,151C 95.1667,150.333 99.8333,150.333 104.5,151C 102.983,152.685 101.316,154.185 99.5,155.5C 101.5,156.167 103.5,156.833 105.5,157.5C 103.095,163.051 101.095,168.717 99.5,174.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 0.132,
        }}
        fill="#040505"
        d="M 126.5,152.5 C 129.145,154.31 132.145,155.31 135.5,155.5C 135.611,156.117 135.944,156.617 136.5,157C 132.96,157.329 131.794,159.162 133,162.5C 133.432,159.928 134.932,158.594 137.5,158.5C 140.833,157.833 142.833,159.167 143.5,162.5C 142.167,163.62 141.667,164.953 142,166.5C 145.97,164.645 146.47,162.145 143.5,159C 146.25,158.375 148.25,159.375 149.5,162C 148.167,163.84 148.334,164.34 150,163.5C 149.478,161.12 149.645,158.787 150.5,156.5C 153.859,160.675 153.525,164.842 149.5,169C 146.36,168.418 143.36,168.751 140.5,170C 139.351,168.396 139.351,166.73 140.5,165C 140.387,163.72 139.72,162.887 138.5,162.5C 136.599,164.006 134.932,165.673 133.5,167.5C 132.29,167.068 131.29,166.401 130.5,165.5C 130.784,163.123 130.784,160.956 130.5,159C 128.722,158.296 126.888,157.796 125,157.5C 123.301,157.387 122.134,158.053 121.5,159.5C 119.413,158.415 118.08,156.749 117.5,154.5C 120.402,153.422 123.402,152.756 126.5,152.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#828688"
        d="M 86.5,146.5 C 86.8333,146.5 87.1667,146.5 87.5,146.5C 88.5251,147.374 89.1918,148.541 89.5,150C 88.3488,151.823 87.1821,153.656 86,155.5C 77.4691,163.697 69.3025,172.197 61.5,181C 62.1667,181.667 62.8333,181.667 63.5,181C 73.3942,172.928 83.3942,165.095 93.5,157.5C 86.7688,165.286 80.2688,173.286 74,181.5C 71.2379,184.435 68.4045,187.101 65.5,189.5C 60.9962,187.617 56.3296,185.951 51.5,184.5C 50.5713,183.311 50.238,181.978 50.5,180.5C 62.1716,168.829 74.1716,157.495 86.5,146.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#5c666f"
        d="M 96.5,159.5 C 93.2985,168.438 90.2985,177.438 87.5,186.5C 85.6086,189.172 82.9419,190.172 79.5,189.5C 78.6236,189.631 77.9569,189.298 77.5,188.5C 83.4997,178.523 89.8331,168.856 96.5,159.5 Z"
      />
    </g>
    <g>
      <path
        style={{
          opacity: 1,
        }}
        fill="#3b4346"
        d="M 117.5,154.5 C 118.08,156.749 119.413,158.415 121.5,159.5C 124.328,161.748 127.328,163.748 130.5,165.5C 131.29,166.401 132.29,167.068 133.5,167.5C 133.833,168.167 134.167,168.833 134.5,169.5C 135.855,171.68 135.689,173.68 134,175.5C 134.157,172.009 132.657,170.176 129.5,170C 132.538,172.849 132.204,174.516 128.5,175C 129.672,173.132 129.505,171.298 128,169.5C 122.608,164.966 120.775,166.133 122.5,173C 121.833,173.667 121.167,173.667 120.5,173C 119.085,169.818 119.419,166.818 121.5,164C 119.986,161.322 117.986,159.155 115.5,157.5C 116.167,156.5 116.833,155.5 117.5,154.5 Z"
      />
    </g>
  </svg>
);

export default SparrowLogo