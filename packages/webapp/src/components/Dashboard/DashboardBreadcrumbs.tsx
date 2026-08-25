import {
  Boundary,
  Classes,
  CollapsibleList,
  MenuItem,
} from '@blueprintjs/core';
import React from 'react';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
import { useHistory } from 'react-router-dom';
import { getDashboardRoutes } from '@/routes/dashboard';

export interface DashboardBreadcrumbItem {
  breadcrumb: React.ReactNode;
  match: { url: string };
}

function DashboardBreadcrumbsList({
  breadcrumbs,
}: {
  breadcrumbs: React.ReactNode[];
}) {
  const history = useHistory();

  return (
    <CollapsibleList
      className={Classes.BREADCRUMBS}
      dropdownTarget={<span className={Classes.BREADCRUMBS_COLLAPSED} />}
      collapseFrom={Boundary.START}
      visibleItemCount={0}
    >
      {breadcrumbs.map((crumb) => {
        const { breadcrumb, match } =
          crumb as unknown as DashboardBreadcrumbItem;
        return (
          <MenuItem
            key={match.url}
            icon={'folder-close'}
            text={breadcrumb}
            onClick={() => history.push(match.url)}
          />
        );
      })}
    </CollapsibleList>
  );
}

/**
 * Dashboard breadcrumbs.
 *
 * The route table already carries a translated `breadcrumb` for each screen,
 * but it has to be handed to `withBreadcrumbs` — given nothing, the library
 * falls back to humanising the URL segment, which is how every crumb ended up
 * reading "Items" or "Home" regardless of the chosen language.
 *
 * The wrapper is built on first render rather than at module load because the
 * route table calls `intl.get()`, which only returns translations once
 * `AppIntlLoader` has initialised.
 */
export default function DashboardBreadcrumbs() {
  const Breadcrumbs = React.useMemo(
    () =>
      withBreadcrumbs(
        getDashboardRoutes().map(({ path, breadcrumb }) => ({
          path,
          breadcrumb,
        })),
      )(DashboardBreadcrumbsList),
    [],
  );

  return <Breadcrumbs />;
}
