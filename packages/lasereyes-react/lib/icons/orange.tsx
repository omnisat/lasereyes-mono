import * as React from 'react'

interface OrangeLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  variant?: 'first' | 'second'
}

const OrangeLogo: React.FC<OrangeLogoProps> = ({
  size = 42,
  variant = 'first',
  className,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={size}
    height={size}
    viewBox="0 0 42 42"
    {...props}
  >
    <defs>
      <clipPath id="clip1">
        <path d="M 9.433594 0 L 32.566406 0 C 37.777344 0 42 4.222656 42 9.433594 L 42 32.566406 C 42 37.777344 37.777344 42 32.566406 42 L 9.433594 42 C 4.222656 42 0 37.777344 0 32.566406 L 0 9.433594 C 0 4.222656 4.222656 0 9.433594 0 Z M 9.433594 0 " />
      </clipPath>
      <radialGradient
        id="radial0"
        gradientUnits="userSpaceOnUse"
        cx={0}
        cy={0}
        fx={0}
        fy={0}
        r={1}
        gradientTransform="matrix(0.000000000000001938,31.643555,-31.643555,0.000000000000001938,21,5.578125)"
      >
        <stop
          offset={0}
          style={{
            stopColor: 'rgb(5.098039%,5.490196%,7.058824%)',
            stopOpacity: 1,
          }}
        />
        <stop
          offset={1}
          style={{
            stopColor: 'rgb(0%,0%,0%)',
            stopOpacity: 1,
          }}
        />
      </radialGradient>

      <image
        id="image91"
        width={42}
        height={42}
        xlinkHref="data:image/png;base64,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"
      />
      <filter
        id="alpha"
        filterUnits="objectBoundingBox"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
      >
        <feColorMatrix
          type="matrix"
          in="SourceGraphic"
          values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
        />
      </filter>
      <image
        id="image170"
        width={42}
        height={42}
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAABmJLR0QA/wD/AP+gvaeTAAACtklEQVRYhWNgGAWjYBSMglEwCkYcmGslLagZ26TedkTUMOD/H11nY2a5Sb+/sJBiBiOtHMfAwMCg73JCaNrNdN2kh/eF0eXKFXf+qZBhvfbqqMkdYsxior7zGBjUK65yXtwsbBq4/7wDNkcyMDAwdN53ZxE87KQX4tNtRIyZVA1Rc3M7ZpZn5eoNd1lVc1hCmInVJ7ov4fwRl0n38amhWoiyP3kmPbfVyfXNw0gNUhzJwMDA8D/3q1bnt2a8bqE4RFPWPhRMLPDTwxXFxIKtN84cUdFSe4VLnuwQhaVDmbBtjpQ6koGBgWHPo6d8+ORJKiIYGBDp0CgsQTXM4Dczw+9y8l2HBB4kJFEv6p2NmeVYi1m170ewcVLmLEzw6HHhye/yjU9xyRMV9XaXNnLcmHTA9slpbhNaONLtgvpfZV5TnOmTgYGIEP3LGciWdPSB/QmDu7zUcxoquNv66c6fWoZL+NQQDNFwZysdWjpS8mnzhzsL664RUoc3M9ld2sixVWiFvBz13IUC2HjqXtzv4z+jcCf/DyG1eKOeb66bnGTiCRPqOQ0Ccpjzvq3gTr5y9IviE2L14I163YZ8HsqdhQDP3hn9vf8m5tq3r+y7SHEkAwOBqH/ncPYvZU6DgEjWToYZ/8UefWbsusrwd9p3ckpevCEqdNL9E5lug4N58opvn6zy2v/iX/AZhr8nv5NrDl6H7vx0/ZXyhqBf5BisuOLXdxnTr2esH188OCdY/j15zkMAguUoX8haFclViXrEGvjsndHfn/+0bjbzSN4q56r9R5nzEICoKlQvzsrk54IreEspWDp8wdh1lZIoxgWIrusrJBTVpl6R15QSOofR1qzc+eH1kW+Pr1AjiqkCJv3+wuJszCwnwaeq23ZE1JC9Q0ktq+09/0C7axSMglEwCkbBKKA/AABq8ekilgplTAAAAABJRU5ErkJggg=="
      />
      <mask id="mask0">
        <g filter="url(#alpha)">
          <use xlinkHref="#image170" />
        </g>
      </mask>
      <image
        id="image125"
        width={42}
        height={42}
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAABmJLR0QA/wD/AP+gvaeTAAAEF0lEQVRYhe2WTYscVRSGn3NvVXdPzySabwQN2SlGkQgjCC4EFWMU/A+CG925EhN0JSiof8BtxC8SSVZZiK7MRjRElPwEF8Ik0z3d9XXPOS6qJhM1pHucGXHRLxRFN9Sth/d977kFCy200EILLfR/kvwXL/n69NFvs6Y56MmGjUIlsU55TK9998eT866xp6DfvHTkcm9Snop1epBkqDuNQulCHWNT9Xq/s5FOv/7rxo1Za2V7AXjhzLEv+pPy5ODm+KSoSlQDdZI5GCQVCtdcKzuuw/5V4MCsNXfV0S9feeD8YKM4vlKVq5J0kJsR3Ajq4JAcygSjBOMkbEhEl3Ky+5dGb/6wdt+91t41Ry8+f+jS8tr6M3nTHNwEjO5EBxdwQFwIAcBxcxSjqY1Q6vKs9XcMevHMka+WxtPV/mh8IqiSWwcISJdXCIFkYIB5+5/jaHJSdIJa3DPQCy8f+3w4nj7auzl6PDYq0YzMncwcCYBDkIAByaAxaBxq2/pdG6iC2ez3bRv0dg/X1p8KSfu5GcGMgBMFEBAEFyG1ewg1qB3qBJVCqU6lLbDOCbEt0AvPHbyyf219Nd7Rw+BOJrQOGnjnYrfRW/e8A0zOVJ0iQaFQK7hu1WHHoJ+9ePTKynjy8HC0cSIzpff3HhpICLc7qNbu8Mah0TbmonEKc6YJxg1MGiikBWiH1g5Bz79w7Pul9Y3Hsro+nJkykLv38E4HN11sNmO21sVJgo0E0wSlQQpCiELMg+4Y1CfFQxTN4dyULBhBWhfv1sOmm5W1Qp2c0pxSaSEVyqaNfCqCBSH2I/kg03wQZ87ze4J++uzhn8NocsJUMTcQcAOTgPtfY07eRlwlpzYo7ujitLuXBjWCx0DWjwxX8rRvf+5vXV3r7Qg01WlfXVmM6m2sgAQB6SB9K+5aodqMWWHadIDWXgnBsoDkgf4g08Ew0+u/jT++DO/MgpwJqrUNK3OkcfIAwQR1QLbibiHbmKvOvYlCqVAZ1CZoDHge6PWi5ctZWh5mcvanW/15AOcCTU5UBVOQbozkAuCdm23MlbbRFtqe5UWCMggmAoNA7EUfLGVpaZhx7tr6tgDnArUQaFyoVUjm1Or0usPuzsgLawHL7rSpRPAQyHqRwXKWloaZvXt99K8A5wINecg0hFQgWZmEQpzYQOiiT9qC1d7GnOSfPfzlxviDS8Z7O4GEOT7z3n9i/6hcr/bV0wZJRugect8aRykIEgOSBXr9aPnwdg9n7uZdA3018MapR1Y+KTaaflMlUmrnknePexQkD/Ty6P1hloZLkXPX1ncNcG5QgI+ePlSMxrVURerVlYl3oCEIsRfo92MaDqKf3QPAbYFu6sPVA1XdKEk9OEgWxXt54O0fb+V7BbjQQgsttNBC/0/9CbvrotNPsOneAAAAAElFTkSuQmCC"
      />
      <image
        id="image142"
        width={42}
        height={42}
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAABmJLR0QA/wD/AP+gvaeTAAAAmklEQVRYhe2U0QqAIBAE1/7/n+tFIaQyur21aAdEX4RhDgWMMemUul7BkciZ3JopMqKXGhWcJltOzldMkS3dfhe5bOTBSGWXwF3pjxARBYSyUVFAJMsQBQSyLNF0mKKpVdlF02R/OfpGStWsonTZX4++Qa3qohVaVRfdQanqoh3hqi7KRikaGr+LslGLPh6/i7KxKBuLsvmM6AZK+AVU/UCtAQAAAABJRU5ErkJggg=="
      />
      <mask id="mask1">
        <g filter="url(#alpha)">
          <rect
            x={0}
            y={0}
            width={42}
            height={42}
            style={{
              fill: 'rgb(0%,0%,0%)',
              fillOpacity: 0.6,
              stroke: 'none',
            }}
          />
        </g>
      </mask>
      <image
        id="image148"
        width={42}
        height={42}
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAABmJLR0QA/wD/AP+gvaeTAAAEI0lEQVRYhe3XTW4kuREF4I9kZqX+7B61gAFGR5CWPsucZ9zn6Sv4Ct5ZfQAv1IABuaftaUlVmWR4kZS6tPKitBjDegCRZBaT9RA/Lxi84Q1veMMbDkF6msTTPPChz28kP+NTX99+3/+MSwGuhI+47utfhETS169BNEgvCF5JPkluJZeSO8lF/+3rHtl3ncSdcCHcCpfCjXAtXpPs8ILkjeRa8kVyJ7uUkE0SknvJuz2idzgWJg3hUkNzLlxpPiBEJOlQsilI/txJnu+RI7tXJPl5TJKtZJaMwiRshdCE5lhF8141aT4LNL+IlA4jml+QnGRfFQwejE6Mso1qMplwpDl2tj6POTKZVJNs49GIwd8NPituJVfSc0gdgAFcd9d+lb1T/GpwrPhmlAyKwaKoiiy7lxTxsNX626paDDJmZ9At/hd80Q4lmt30pCErsgdFMUg2Tm1kR5IjyYlwKpwa+zOcSk40xzbdst9sMLhXDD2Ufj6UJsOe/GRniq3BHwxmG4uNbFKMFhvJICua1L+omA3mHsfJpsflieY3zZ32LG8HEf0keS/5Z0+gSTEbVWNfTZpJ6cRDUSRNqKowS7bmrh5VM/dwyKqLZ48dSPR2T3pWCsXOIPdEaibVUSe9urVKslAsmkHuKlBVG7MHA93Kt3KXrQOJ/gnfJA/dootiUIRBMqg2hp75q2WH7vjAIssDbVlUYbE1SP2cU0k93Jor0c/doqw2mCRNlrtMMQijbBRGYUDWRElSJRYWydzTsXhUjJLHfu7d4WTz8+xYspEsUo/B78KvOzo6kbyGSE2KppT9fbV/v3StuH8di+b/vuX3ge9EH4SdMAhVyF1mnsYabVXrI9QSa2bX/X2lfz8Ij8LJ69yesp+EP/bDRmHutbuqWDzFXzMXdpoZO9murlV/HWHp9WmVplk46udevMLtyV+td8roFhlUO1W2CItit+a2VJNQ1C74a9aHnWRnsFN7mZi79R+Ef4leUg8keim8F/4h/KiiShbVjNKTg6RZVHlP8Jsqm4WtpRN+tGiq0ndcam5fw6JXwifhx27RrWoy00siqxgtandz2RP8JptVs9HWbKeYHVlQewmN5y7gIKIfcd4vvb+piuTfXU/HnhBh0SxjUebaLVp7smXLJsy7MCt2dmajxb2qai6Eq9cguvY4659WyZnqV0kI30SX/8Fonmu/SDdPJaIJdRe95ofFqRmLE9Vd99LHQ2k+ydNN73cWzVfVD6sFLXaKrerR4MHkXnP/4jl4UD0abTU7T0qxhlF77p8OxP9QK8La2l6LfhNvflLdqU7Mjs0WO5Ote1uTrTOPJlt3/f1i57i7nMXfNOf9rN6JHoohWbtEIXwA4Vzq7W9yqdlKziQnXrbLT0K+Fc722uUvXUleubd/wxve8IY3/B/gP+5/MI8x65+AAAAAAElFTkSuQmCC"
      />
      <mask id="mask2">
        <g filter="url(#alpha)">
          <rect
            x={0}
            y={0}
            width={42}
            height={42}
            style={{
              fill: 'rgb(0%,0%,0%)',
              fillOpacity: 0.701961,
              stroke: 'none',
            }}
          />
        </g>
      </mask>
      <image
        id="image154"
        width={42}
        height={42}
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAABmJLR0QA/wD/AP+gvaeTAAAA/ElEQVRYhe2VwW7DIAxAn9M0qcSN///G3JDaFEIPwRvqoUHdWKXJT/IhMokeNiZgGIZhGIZh/EPkVTLnLGWNxvD0Ti6xAVlEtk6eDA1rBDgBZ2ACZu/9DMzleSz5lm+9zVFFh0pyrELYK5m89/dlWSIQRWT9lOipiE1VnCvRCKwaInLtJXrULj2Xdesn4EJpvXPuT1o/NqxR2Vp4YB+gLYSgki+781PeqUL+dYsGWkT1+tmAxH4uNZJzLpVc1w0ctV4lE3Dne4i+himEEEu+2x0KxxV9Fr0B1ypu3vuVvbpdRVv+TDpEGvXmdBMJ2EQkdvI0DMMwDMMwjI/yAInrT4nWGUiJAAAAAElFTkSuQmCC"
      />
      <image
        id="image160"
        width={42}
        height={42}
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAABmJLR0QA/wD/AP+gvaeTAAACY0lEQVRYhe2W227iQBBEj7mFcAkbZf3/HxjtLUtCAtjeh6laN9YSDCHSPkxLrZE92BzXVPcM5MiRI0eOj0RxzZc1TeP3FcBAoxOgCWOtsSmKouFEjD4JcNgZBx3ASlmH688FFWQEHAJj5Uhp0ArYA7uQvv85oAGw6ABOgClwoxwLtBbkG/CqhNYO1wUNy+wl7QLeAjPlNIBWgnzRM9Bz2c8CPeJDL/GNAOfAIuSt5gG2AbImLfuW1hYfBz3iw4kApyT1FsBSeafraQDb6P8q0rKPNder87wL2sOHBlwIzrnU3ESvsnJb2iKL7ety0H+oOOoAzgW0HA6Hd1VVrXS90NxEz+5JBdNtUXG8HDRClmU5fnx8dKFEBVfAqqoqqzjXhxiyInnR1e7c6r576VVADWkFV8ovSvvxluRZ+24PvA0Gg+e6rn8DzjXJr1v9phfoexVnX45JKs0FdQ98BUqN97o/04c3AlwDP+u6/g58U/4Q7AvwWpblri/oUSM3TeO2MyMpeQ88CO6BpOZSH2FAL/ELSbkn4JfySfkXFKlaFMX+FGifpXcRuVc6b8Lz7okb4FkwT51cC3Cjj7F3r+JRwxrYhwz0B1vawogqRvUi4GsAdCFdbQv1i7zd7Wj36SFtA19zqOSapK4V7FZ6DdDniHcKtKHtdTv92YZUXA1JJTS34bCqnzn0oQErzjiDngPqE4/95y1wQ7s1Rm9GwK4P60sA+4LGpfZRzft0EeattgHdIw98eCnkOaDQqudjm+/5IOzCioBn+fAjoPZnhPZhwqD2XlfBi5c5R44cOXLkyJHjv40/gQUmD3HnzocAAAAASUVORK5CYII="
      />
      <mask id="mask3">
        <g filter="url(#alpha)">
          <rect
            x={0}
            y={0}
            width={42}
            height={42}
            style={{
              fill: 'rgb(0%,0%,0%)',
              fillOpacity: 0.2,
              stroke: 'none',
            }}
          />
        </g>
      </mask>
      <image
        id="image166"
        width={42}
        height={42}
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAABmJLR0QA/wD/AP+gvaeTAAACY0lEQVRYhe2W227iQBBEj7mFcAkbZf3/HxjtLUtCAtjeh6laN9YSDCHSPkxLrZE92BzXVPcM5MiRI0eOj0RxzZc1TeP3FcBAoxOgCWOtsSmKouFEjD4JcNgZBx3ASlmH688FFWQEHAJj5Uhp0ArYA7uQvv85oAGw6ABOgClwoxwLtBbkG/CqhNYO1wUNy+wl7QLeAjPlNIBWgnzRM9Bz2c8CPeJDL/GNAOfAIuSt5gG2AbImLfuW1hYfBz3iw4kApyT1FsBSeafraQDb6P8q0rKPNder87wL2sOHBlwIzrnU3ESvsnJb2iKL7ety0H+oOOoAzgW0HA6Hd1VVrXS90NxEz+5JBdNtUXG8HDRClmU5fnx8dKFEBVfAqqoqqzjXhxiyInnR1e7c6r576VVADWkFV8ovSvvxluRZ+24PvA0Gg+e6rn8DzjXJr1v9phfoexVnX45JKs0FdQ98BUqN97o/04c3AlwDP+u6/g58U/4Q7AvwWpblri/oUSM3TeO2MyMpeQ88CO6BpOZSH2FAL/ELSbkn4JfySfkXFKlaFMX+FGifpXcRuVc6b8Lz7okb4FkwT51cC3Cjj7F3r+JRwxrYhwz0B1vawogqRvUi4GsAdCFdbQv1i7zd7Wj36SFtA19zqOSapK4V7FZ6DdDniHcKtKHtdTv92YZUXA1JJTS34bCqnzn0oQErzjiDngPqE4/95y1wQ7s1Rm9GwK4P60sA+4LGpfZRzft0EeattgHdIw98eCnkOaDQqudjm+/5IOzCioBn+fAjoPZnhPZhwqD2XlfBi5c5R44cOXLkyJHjv40/gQUmD3HnzocAAAAASUVORK5CYII="
      />
      <clipPath id="clip2">
        <rect x={0} y={0} width={42} height={42} />
      </clipPath>
      <g id="surface169" clipPath="url(#clip2)">
        <use xlinkHref="#image125" />
        <use xlinkHref="#image142" />
        <use xlinkHref="#image148" mask="url(#mask1)" />
        <use xlinkHref="#image154" mask="url(#mask2)" />
        <use xlinkHref="#image160" />
        <use xlinkHref="#image166" mask="url(#mask3)" />
      </g>
    </defs>
    <g id="surface1">
      <g clipPath="url(#clip1)" clipRule="nonzero">
        <path
          style={{
            stroke: 'none',
            fillRule: 'nonzero',
            fill: 'url(#radial0)',
          }}
          d="M 9.433594 0 L 32.566406 0 C 37.777344 0 42 4.222656 42 9.433594 L 42 32.566406 C 42 37.777344 37.777344 42 32.566406 42 L 9.433594 42 C 4.222656 42 0 37.777344 0 32.566406 L 0 9.433594 C 0 4.222656 4.222656 0 9.433594 0 Z M 9.433594 0 "
        />
        <use xlinkHref="#image42" />
        <use xlinkHref="#image91" />
        <use xlinkHref="#surface169" mask="url(#mask0)" />
      </g>
    </g>
  </svg>
)
export default OrangeLogo
