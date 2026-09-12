/**
 * The two widths this interface changes shape at.
 *
 * Below `TABLET` the layout is a phone's: one column, the sidebar off-canvas,
 * tables scrolling inside themselves. From `TABLET` to `DESKTOP` it is a
 * tablet's: the sidebar a narrow rail, content otherwise full width. From
 * `DESKTOP` up nothing here applies and the interface is what upstream built.
 *
 * `_responsive.scss` carries the same two numbers; keep them together.
 */
export const BREAKPOINTS = {
  TABLET: 600,
  DESKTOP: 1024,
} as const;

/** Matches phones. */
export const MEDIA_PHONE = `(max-width: ${BREAKPOINTS.TABLET - 0.02}px)`;

/** Matches phones and tablets — everything below the desktop layout. */
export const MEDIA_BELOW_DESKTOP = `(max-width: ${BREAKPOINTS.DESKTOP - 0.02}px)`;
