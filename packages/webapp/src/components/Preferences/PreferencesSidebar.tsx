// @ts-nocheck
import { Menu, MenuItem, MenuDivider } from '@blueprintjs/core';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PreferencesSidebarContainer from './PreferencesSidebarContainer';
import { FormattedMessage as T } from '@/components';
import { MEDIA_BELOW_DESKTOP } from '@/constants/breakpoints';
import { PreferencesMenu } from '@/constants/preferencesMenu';
import { useFeatureCan } from '@/hooks/state/feature';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import '@/style/pages/Preferences/Sidebar.scss';

/**
 * Preferences sidebar.
 *
 * On a desktop it is a 220px column of sections down the side. Below that
 * width there is no side to spare, so the same items become a strip of tabs
 * across the top of the page that scrolls sideways — the section headings
 * are dropped there, since a heading between tabs in a row reads as a tab.
 */
export default function PreferencesSidebar() {
  const history = useHistory();
  const location = useLocation();
  const { featureCan } = useFeatureCan();
  const isCompact = useMediaQuery(MEDIA_BELOW_DESKTOP, false, {
    getInitialValueInEffect: false,
  });

  const items = PreferencesMenu.filter((item) => {
    if (item.feature && !featureCan(item.feature)) {
      return false;
    }
    if (isCompact && item.divider) {
      return false;
    }
    return true;
  }).map((item) =>
    item.divider ? (
      <MenuDivider title={item.title} />
    ) : (
      <MenuItem
        active={item.href && item.href === location.pathname}
        text={item.text}
        label={item.label}
        disabled={item.disabled}
        onClick={() => {
          history.push(item.href);
        }}
      />
    ),
  );

  if (isCompact) {
    return (
      <nav className="preferences-tabs" aria-label="preferences">
        <Menu className="preferences-tabs__menu">{items}</Menu>
      </nav>
    );
  }
  return (
    <PreferencesSidebarContainer>
      <div class="preferences-sidebar__head">
        <h2>{<T id={'preferences'} />}</h2>
      </div>

      <Menu className="preferences-sidebar__menu">{items}</Menu>
    </PreferencesSidebarContainer>
  );
}
