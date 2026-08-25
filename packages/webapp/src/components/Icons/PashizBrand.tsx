import React from 'react';

export interface PashizBrandProps {
  /** Height of the mark in pixels; the wordmark scales with it. */
  height?: number;
  /** Colour of both the mark and the wordmark. */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The application's brand lockup: the mark, followed by the product name.
 *
 * The original asset was a single SVG whose letterforms spelled the name in
 * Latin, so it could not carry a Persian name. Here the mark keeps its paths
 * and the name is real text, which also means it inherits the page font and
 * reads correctly right-to-left.
 */
export function PashizBrand({
  height = 37,
  color = 'currentColor',
  className,
  style,
}: PashizBrandProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: height * 0.3,
        color,
        ...style,
      }}
    >
      <svg
        data-icon="pashiz-mark"
        viewBox="0 0 62 42.89"
        height={height}
        width={height * 1.45}
        aria-hidden={'true'}
      >
        <path
          fill="currentColor"
          d="M56,3.16,61.33,8.5,31.94,37.9l-5.35-5.35Z"
          fillRule="evenodd"
        />
        <path
          fill="currentColor"
          d="M29.53,6.94l5.35,5.34L5.49,41.67.14,36.33l15.8-15.8Z"
          fillRule="evenodd"
        />
      </svg>
      <span
        style={{
          fontSize: height * 0.62,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}
      >
        سامانه مالی پشیز
      </span>
    </span>
  );
}
