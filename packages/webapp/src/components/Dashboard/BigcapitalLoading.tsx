import { PashizBrand } from '@/components/Icons/PashizBrand';
import classNames from 'classnames';
import React from 'react';

import '@/style/components/BigcapitalLoading.scss';

interface BigcapitalLoadingProps {
  className?: string;
}

/**
 * Bigcapital logo loading.
 */
export default function BigcapitalLoading({
  className,
}: BigcapitalLoadingProps) {
  // One lockup for both themes. The dark branch used to fall back to the
  // original English wordmark, so anyone loading the app in dark mode was
  // greeted by the upstream brand; the mark takes `currentColor` and the name
  // is text, so a single element now serves both.
  return (
    <div className={classNames('bigcapital-loading', className)}>
      <div className="center">
        <PashizBrand height={34} />
      </div>
    </div>
  );
}
