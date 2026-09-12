// @ts-nocheck
import classNames from 'classnames';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { DashboardHamburgerButton } from '@/components/Dashboard/DashboardTopbar/_components';
import DashboardTopbarUser from '@/components/Dashboard/TopbarUser';
import { CLASSES } from '@/constants/classes';
import { withDashboard } from '@/containers/Dashboard/withDashboard';
import { withDashboardActions } from '@/containers/Dashboard/withDashboardActions';
import { ApiKeysActions } from '@/containers/Preferences/ApiKeys/ApiKeysActions';
import { BranchesActions } from '@/containers/Preferences/Branches/BranchesActions';
import { CurrenciesActions } from '@/containers/Preferences/Currencies/CurrenciesActions';
import { UsersActions } from '@/containers/Preferences/Users/UsersActions';
import { WarehousesActions } from '@/containers/Preferences/Warehouses/WarehousesActions';
import { compose } from '@/utils';

import '@/style/pages/Preferences/Topbar.scss';

/**
 * Preferences topbar.
 */
function PreferencesTopbar({ preferencesPageTitle, toggleSidebarExpand }) {
  return (
    <div
      className={classNames(
        CLASSES.PREFERENCES_PAGE_TOPBAR,
        CLASSES.PREFERENCES_TOPBAR,
      )}
    >
      {/* On a desktop the main sidebar stays beside this page as a rail, so
          there is nothing to open. On a phone it is off screen, and without
          this button the settings would be a page with no way out. Shown
          below the desktop width only. */}
      <div className="preferences-topbar__sidebar-toggle">
        <DashboardHamburgerButton onClick={() => toggleSidebarExpand()} />
      </div>

      <div class="preferences-topbar__title">
        <h2>{preferencesPageTitle}</h2>
      </div>
      <div class="preferences-topbar__actions">
        <Route pathname="/preferences">
          <Switch>
            <Route exact path={'/preferences/users'} component={UsersActions} />
            <Route
              exact
              path={'/preferences/currencies'}
              component={CurrenciesActions}
            />
            <Route
              exact
              path={'/preferences/warehouses'}
              component={WarehousesActions}
            />
            <Route
              exact
              path={'/preferences/branches'}
              component={BranchesActions}
            />
            <Route
              exact
              path={'/preferences/api-keys'}
              component={ApiKeysActions}
            />
          </Switch>
        </Route>
      </div>

      <div class="preferences-topbar__user">
        <DashboardTopbarUser />
      </div>
    </div>
  );
}

export default compose(
  withDashboard(({ preferencesPageTitle }) => ({ preferencesPageTitle })),
  withDashboardActions,
)(PreferencesTopbar);
