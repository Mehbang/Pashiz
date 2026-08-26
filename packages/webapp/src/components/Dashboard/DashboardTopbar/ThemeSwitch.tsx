import { Button, Classes, Position, Tooltip } from '@blueprintjs/core';
import intl from 'react-intl-universal';
import { useIsDarkMode } from '@/hooks/useDarkMode';
import { toggleTheme } from '@/utils/theme';

/**
 * Switches the interface between the light and dark themes.
 *
 * The icon shows the theme the button would move to rather than the one in
 * force, which is what makes a single button read as a choice instead of a
 * status light.
 */
export function ThemeSwitch() {
  const isDarkMode = useIsDarkMode();

  const label = intl.get(
    isDarkMode ? 'theme.switch_to_light' : 'theme.switch_to_dark',
  );

  return (
    <Tooltip content={label} position={Position.BOTTOM}>
      <Button
        className={Classes.MINIMAL}
        aria-label={label}
        onClick={() => toggleTheme()}
        icon={isDarkMode ? <SunIcon /> : <MoonIcon />}
      />
    </Tooltip>
  );
}

// Drawn here rather than taken from an icon set: neither the application's own
// icons nor Blueprint's carry a sun, and the pair has to match in weight to
// read as one control.

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="3.75" />
      <path d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M16 4l-1.4 1.4M5.4 14.6 4 16M16 16l-1.4-1.4M5.4 5.4 4 4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 12.2A7.5 7.5 0 0 1 7.8 3a7.5 7.5 0 1 0 9.2 9.2Z" />
    </svg>
  );
}
