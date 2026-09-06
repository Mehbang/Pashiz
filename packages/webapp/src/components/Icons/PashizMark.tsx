import React from 'react';

export interface PashizMarkProps {
  /** Size of the mark in pixels; it is square. */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The Pashiz mark: a Sasanian coin, struck with a fire altar and the two who
 * tend it.
 *
 * The disc is the outline of the actual coin the brand is named for, traced
 * from the photograph, so its edge keeps the irregularity of something hammered
 * rather than printed. The device is cut out of it, which is why the mark is a
 * single colour: it takes `currentColor` and so reads on a light page and a
 * dark one without a second asset.
 *
 * Below roughly 28px the three figures collapse into each other — the favicon
 * carries its own, simpler cut for those sizes rather than shrinking this one.
 */
export function PashizMark({ size = 34, className, style }: PashizMarkProps) {
  // Several lockups can share a page, and a duplicated mask id would let one
  // instance erase another.
  const maskId = `pashiz-mark-${React.useId()}`;

  return (
    <svg
      data-icon="pashiz-mark"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden={true}
    >
      <mask
        id={maskId}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="64"
        height="64"
      >
        <g transform="translate(0.6,64) scale(0.0125,-0.0125)">
          <path
            fill="#fff"
            d="M1960 5110 c-33 -18 -100 -32 -129 -27 -22 5 -41 0 -66 -14 -21 -13
-44 -19 -57 -16 -12 4 -27 2 -33 -3 -6 -5 -23 -11 -38 -14 -15 -2 -39 -13 -55
-24 -15 -11 -62 -34 -104 -52 -43 -17 -97 -45 -120 -61 -24 -16 -47 -29 -51
-29 -5 0 -23 -10 -40 -23 -18 -13 -50 -29 -72 -37 -46 -15 -109 -53 -145 -87
-14 -13 -61 -55 -105 -94 -214 -189 -270 -243 -301 -290 -12 -20 -43 -57 -68
-83 -25 -25 -46 -50 -46 -56 0 -10 -54 -87 -107 -151 -17 -22 -41 -65 -53 -97
-12 -31 -27 -64 -34 -72 -7 -8 -19 -35 -26 -60 -8 -25 -19 -54 -26 -65 -6 -11
-17 -51 -24 -90 -7 -38 -18 -88 -25 -110 -8 -22 -21 -78 -30 -125 -10 -47 -22
-94 -28 -105 -10 -20 -21 -61 -36 -143 -4 -24 -13 -48 -19 -54 -7 -7 -12 -23
-12 -36 0 -13 -5 -33 -12 -45 -6 -12 -15 -38 -19 -57 -25 -111 -31 -137 -39
-155 -5 -11 -11 -81 -15 -155 -4 -74 -11 -141 -17 -148 -8 -9 -7 -20 2 -38 11
-19 11 -27 2 -36 -13 -13 -17 -140 -5 -151 8 -9 11 -28 22 -157 5 -58 16 -132
26 -165 9 -33 20 -82 25 -110 10 -71 38 -140 99 -245 5 -8 18 -35 30 -60 26
-55 50 -95 90 -150 16 -23 42 -74 56 -113 14 -40 33 -83 41 -97 8 -14 21 -38
29 -55 7 -16 36 -58 64 -93 28 -34 51 -64 51 -67 0 -25 95 -129 205 -223 33
-28 114 -82 123 -82 5 0 17 -9 27 -20 10 -11 21 -20 26 -20 4 0 22 -15 41 -33
36 -34 142 -112 187 -137 14 -8 40 -24 56 -35 51 -34 69 -45 85 -51 8 -3 27
-12 41 -20 14 -7 28 -11 31 -8 3 2 11 -2 18 -11 7 -8 19 -15 27 -15 15 0 105
-39 113 -49 11 -14 179 -92 230 -107 30 -9 64 -20 75 -24 11 -5 47 -16 80 -26
33 -10 69 -23 80 -31 11 -7 29 -13 42 -13 12 0 25 -5 28 -10 3 -5 14 -10 24
-10 10 0 45 -8 77 -19 33 -10 91 -22 129 -26 39 -4 76 -12 83 -17 8 -7 16 -7
26 1 15 13 94 12 102 -1 8 -12 68 -10 81 3 12 12 189 33 583 70 69 7 137 18
152 26 15 7 37 13 49 13 21 0 183 51 216 69 10 5 45 22 78 38 33 15 64 34 68
40 4 7 19 13 32 13 13 0 27 4 30 10 9 14 110 80 123 80 13 0 101 74 181 152
29 29 61 58 71 63 26 15 244 280 266 323 10 20 37 57 59 82 42 46 143 185 184
252 12 20 25 38 29 40 8 3 112 155 112 163 0 2 14 24 30 48 17 25 30 49 30 55
0 5 7 15 15 22 8 7 15 25 15 41 0 16 4 37 9 47 5 9 16 44 26 77 9 33 21 70 26
83 5 13 9 45 9 72 0 28 9 76 19 107 17 50 20 98 24 357 4 195 9 302 16 309 14
14 15 229 2 243 -6 5 -15 52 -21 104 -7 52 -16 100 -20 105 -4 6 -16 42 -25
80 -10 39 -22 79 -28 90 -18 32 -37 88 -37 110 0 27 -34 123 -49 138 -6 6 -11
19 -11 29 0 34 -69 188 -164 362 -14 27 -26 61 -26 75 0 14 -7 35 -15 45 -8
11 -15 30 -15 43 0 33 -41 113 -86 170 -112 140 -295 333 -315 333 -6 0 -25
11 -43 25 -18 14 -54 32 -80 41 -25 9 -48 20 -52 25 -3 5 -14 9 -24 9 -11 0
-39 13 -62 30 -24 16 -65 35 -93 41 -27 7 -63 18 -80 25 -39 18 -267 80 -323
89 -24 4 -56 13 -70 21 -15 8 -44 14 -66 14 -21 0 -55 9 -75 19 -20 10 -56 24
-81 31 -25 6 -54 23 -65 36 -18 22 -32 26 -125 35 -58 6 -146 17 -196 25 -50
8 -108 14 -127 14 -20 0 -38 4 -41 9 -4 5 -29 12 -56 16 -27 4 -53 11 -56 16
-3 5 -17 0 -31 -11 -20 -15 -29 -17 -40 -9 -9 8 -48 10 -131 5 -95 -5 -122 -4
-146 9 -36 19 -51 19 -81 -1 -22 -14 -27 -14 -56 0 -36 18 -38 18 -59 6z"
          />
        </g>
        <g fill="#000" transform="translate(13.25,13.25) scale(0.586)">
          <g transform="translate(0,3.2)">
            {/* the fire */}
            <path d="M32 3.5l1.9 5.2v8.9h-3.8V8.7z" />
            <path d="M26.4 6.4l1.7 4.6v6.6h-3.4V11z" />
            <path d="M37.6 6.4l1.7 4.6v6.6h-3.4V11z" />
            <path d="M21.5 10.2l1.4 3.6v3.8h-2.8v-3.8z" />
            <path d="M42.5 10.2l1.4 3.6v3.8h-2.8v-3.8z" />
            {/* altar: it stands lower than the two who tend it */}
            <path d="M19.4 17.6h25.2v4.6H19.4z" />
            <path d="M23.4 22.2h17.2v3.4H23.4z" />
            <path d="M28.7 25.6h6.6c-.7 6.1-.7 12.2 0 18.3h-6.6c.7-6.1.7-12.2 0-18.3Z" />
            <path d="M23.4 43.9h17.2v3.4H23.4z" />
            <path d="M19.4 47.3h25.2v4.8H19.4z" />
            {/* left attendant; the arm reaches toward the fire but does not touch it */}
            <path d="M10.9 18.9h5.6l-.8 2.6h-4z" />
            <circle cx="13.7" cy="24.7" r="3.6" />
            <path d="M10.3 29.7h6.8c1.3 6.6 1.9 13.2 1.8 19.8H8.5c-.1-6.6.5-13.2 1.8-19.8Z" />
            <path d="M17 30.9l5 2.4-1.5 3.2-5-2.4z" />
            {/* right attendant */}
            <path d="M47.5 18.9h5.6l-.8 2.6h-4z" />
            <circle cx="50.3" cy="24.7" r="3.6" />
            <path d="M46.9 29.7h6.8c1.3 6.6 1.9 13.2 1.8 19.8H45.1c-.1-6.6.5-13.2 1.8-19.8Z" />
            <path d="M42 33.3l5-2.4 1.5 3.2-5 2.4z" />
          </g>
        </g>
      </mask>
      <rect
        width="64"
        height="64"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
