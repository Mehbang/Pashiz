import intl from 'react-intl-universal';
import { Intent, Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import type { TaxRate } from '@bigcapital/sdk-ts';
import { Can, Icon } from '@/components';
import { AbilitySubject, TaxRateAction } from '@/constants/abilityOption';
import { safeCallback } from '@/utils';

interface TaxRatesTableActionsMenuProps {
  payload: {
    onEdit: (taxRate: TaxRate) => void;
    onDelete: (taxRate: TaxRate) => void;
    onViewDetails: (taxRate: TaxRate) => void;
    onActivate: (taxRate: TaxRate) => void;
    onInactivate: (taxRate: TaxRate) => void;
  };
  row: {
    original: TaxRate;
  };
}

/**
 * Tax rates table actions menu.
 * @returns {JSX.Element}
 */
export function TaxRatesTableActionsMenu({
  payload: { onEdit, onDelete, onViewDetails, onActivate, onInactivate },
  row: { original },
}: TaxRatesTableActionsMenuProps) {
  return (
    <Menu>
      <MenuItem
        icon={<Icon icon="reader-18" />}
        text={intl.get('view_details')}
        onClick={safeCallback(onViewDetails, original)}
      />
      <Can I={TaxRateAction.Edit} a={AbilitySubject.TaxRate}>
        <MenuDivider />
        <MenuItem
          icon={<Icon icon="pen-18" />}
          text={intl.get('edit_tax_rate')}
          onClick={safeCallback(onEdit, original)}
        />
      </Can>
      <MenuDivider />
      {!original.active && (
        <MenuItem
          icon={<Icon icon="play-16" iconSize={16} />}
          text={intl.get('activate_tax_rate')}
          onClick={safeCallback(onActivate, original)}
        />
      )}
      {!!original.active && (
        <MenuItem
          icon={<Icon icon="pause-16" iconSize={16} />}
          text={intl.get('inactivate_tax_rate')}
          onClick={safeCallback(onInactivate, original)}
        />
      )}
      <Can I={TaxRateAction.Delete} a={AbilitySubject.TaxRate}>
        <MenuDivider />
        <MenuItem
          text={intl.get('delete_tax_rate')}
          intent={Intent.DANGER}
          onClick={safeCallback(onDelete, original)}
          icon={<Icon icon="trash-16" iconSize={16} />}
        />
      </Can>
    </Menu>
  );
}
