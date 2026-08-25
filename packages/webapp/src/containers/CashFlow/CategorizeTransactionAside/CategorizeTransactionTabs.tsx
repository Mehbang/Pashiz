import { Tab, Tabs } from '@blueprintjs/core';
import intl from 'react-intl-universal';
import React from 'react';
import { CategorizeTransactionContent } from '../CategorizeTransaction/drawers/CategorizeTransactionDrawer/CategorizeTransactionContent';
import styles from './CategorizeTransactionTabs.module.scss';
import { MatchingBankTransaction } from './MatchingTransaction';

export function CategorizeTransactionTabs() {
  const defaultSelectedTabId = 'categorize';

  return (
    <Tabs
      large
      renderActiveTabPanelOnly
      defaultSelectedTabId={defaultSelectedTabId}
      className={styles.tabs}
    >
      <Tab
        id="categorize"
        title={intl.get('categorize_transaction')}
        panel={<CategorizeTransactionContent />}
      />
      <Tab
        id="matching"
        title={intl.get('matching_transaction')}
        panel={<MatchingBankTransaction />}
      />
    </Tabs>
  );
}
