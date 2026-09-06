import React from 'react';
import { PashizMark } from './PashizMark';

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
 * Latin, so it could not carry a Persian name. Here the mark is separate and
 * the name is real text, which also means it inherits the page font and reads
 * correctly right-to-left.
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
      <PashizMark size={height} />
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
