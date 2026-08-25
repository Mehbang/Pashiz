import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JalaaliDatePicker } from '../JalaaliDatePicker';

/** 24 August 2026 is 2 Shahrivar 1405. */
const SUBJECT = new Date(2026, 7, 24);

const render = (
  props: Partial<React.ComponentProps<typeof JalaaliDatePicker>> = {},
) =>
  renderToStaticMarkup(
    <JalaaliDatePicker value={SUBJECT} onChange={() => {}} {...props} />,
  );

describe('<JalaaliDatePicker />', () => {
  it('heads the grid with the Persian weekdays, Saturday first', () => {
    const markup = render();
    const headers = [...markup.matchAll(/<th[^>]*>([^<]+)<\/th>/g)].map(
      (match) => match[1],
    );

    expect(headers).toEqual(['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']);
  });

  it('shows the month of the selected date', () => {
    expect(render()).toContain('شهریور');
  });

  it('renders the whole month with Persian digits', () => {
    const markup = render();

    // Shahrivar has 31 days; check both ends of the range.
    expect(markup).toContain('>۱</button>');
    expect(markup).toContain('>۳۱</button>');
  });

  it('falls back to Latin digits when asked', () => {
    const markup = render({ persianDigits: false });

    expect(markup).toContain('>1</button>');
    expect(markup).not.toContain('>۱</button>');
  });

  it('marks the selected day', () => {
    const markup = render();
    const selected = markup.match(
      /<button[^>]*is-selected[^>]*>([^<]+)<\/button>/,
    );

    expect(selected?.[1]).toBe('۲');
  });

  it('disables days outside the allowed range', () => {
    const markup = render({ minDate: SUBJECT });
    const firstOfMonth = markup.match(/<button([^>]*)>۱<\/button>/);

    expect(firstOfMonth?.[1]).toContain('disabled');
  });

  it('renders right-to-left', () => {
    expect(render()).toContain('dir="rtl"');
  });
});
