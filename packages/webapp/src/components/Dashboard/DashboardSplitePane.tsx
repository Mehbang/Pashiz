import { debounce } from 'lodash';
import React, { useState, useRef, useEffect } from 'react';
import SplitPane from 'react-split-pane';
import { useLocation } from 'react-router-dom';
import { MEDIA_BELOW_DESKTOP } from '@/constants/breakpoints';
import { withDashboard } from '@/containers/Dashboard/withDashboard';
import { withDashboardActions } from '@/containers/Dashboard/withDashboardActions';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { compose } from '@/utils';

interface DashboardSplitPaneProps {
  sidebarExpended: boolean;
  toggleSidebarExpand: (toggle?: boolean) => void;
  children?: React.ReactNode;
}

interface SplitPaneWithChildrenProps {
  allowResize?: boolean;
  split?: 'vertical' | 'horizontal';
  minSize?: number | string;
  maxSize?: number | string;
  defaultSize?: number | string;
  size?: number | string;
  onChange?: (size: number) => void;
  className?: string;
  children?: React.ReactNode;
}

const SplitPaneComponent =
  SplitPane as unknown as React.ComponentType<SplitPaneWithChildrenProps>;

/**
 * The desktop layout: a sidebar the user can drag wider or narrower, and the
 * content beside it.
 */
function DashboardResizableLayout({
  sidebarExpended,
  children,
}: Pick<DashboardSplitPaneProps, 'sidebarExpended' | 'children'>) {
  const initialSize = 220;

  const [defaultSize, setDefaultSize] = useState(
    parseInt(localStorage.getItem('dashboard-size') || '', 10) || initialSize,
  );
  const debounceSaveSize = useRef(
    debounce((size: number) => {
      localStorage.setItem('dashboard-size', String(size));
    }, 500),
  );
  const handleChange = (size: number) => {
    debounceSaveSize.current(size);
    setDefaultSize(size);
  };
  return (
    <SplitPaneComponent
      allowResize={sidebarExpended}
      split="vertical"
      minSize={180}
      maxSize={300}
      defaultSize={sidebarExpended ? defaultSize : 50}
      size={sidebarExpended ? defaultSize : 50}
      onChange={handleChange}
      className="primary"
    >
      {children}
    </SplitPaneComponent>
  );
}

/**
 * The phone and tablet layout.
 *
 * There is nothing to drag: the content takes the whole width and the sidebar
 * sits over it, opened from the topbar and closed by tapping the backdrop or
 * by going somewhere. It starts closed — the store says "expanded" on every
 * load, which is right for a desktop and wrong for a screen the sidebar would
 * cover entirely.
 *
 * The sidebar's own positioning is CSS, keyed on `.dashboard-compact`; this
 * component only decides *when* it is open.
 */
function DashboardCompactLayout({
  sidebarExpended,
  toggleSidebarExpand,
  children,
}: DashboardSplitPaneProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    toggleSidebarExpand(false);
    // On mount, and again whenever the route changes: a tap on a menu item
    // has done its job once the page has moved.
  }, [pathname, toggleSidebarExpand]);

  return (
    <div className="dashboard-compact">
      {children}
      {sidebarExpended && (
        <div
          className="dashboard-compact__backdrop"
          onClick={() => toggleSidebarExpand(false)}
          aria-hidden
        />
      )}
    </div>
  );
}

function DashboardSplitPane(props: DashboardSplitPaneProps) {
  const isCompact = useMediaQuery(MEDIA_BELOW_DESKTOP, false, {
    getInitialValueInEffect: false,
  });

  return isCompact ? (
    <DashboardCompactLayout {...props} />
  ) : (
    <DashboardResizableLayout {...props} />
  );
}

export default compose(
  withDashboard(({ sidebarExpended }) => ({ sidebarExpended })),
  withDashboardActions,
)(DashboardSplitPane);
