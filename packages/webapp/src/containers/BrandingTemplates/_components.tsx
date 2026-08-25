// @ts-nocheck
import intl from 'react-intl-universal';
import { Intent, Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { safeCallback } from '@/utils';

/**
 * Templates table actions menu.
 */
export function ActionsMenu({
  row: { original },
  payload: { onDeleteTemplate, onEditTemplate, onMarkDefaultTemplate },
}) {
  return (
    <Menu>
      {!original.default && (
        <>
          <MenuItem
            text={intl.get('mark_as_default')}
            onClick={safeCallback(onMarkDefaultTemplate, original)}
          />
          <MenuDivider />
        </>
      )}
      <MenuItem
        text={intl.get('edit_template')}
        onClick={safeCallback(onEditTemplate, original)}
      />
      <MenuDivider />
      <MenuItem
        text={intl.get('delete_template')}
        intent={Intent.DANGER}
        onClick={safeCallback(onDeleteTemplate, original)}
      />
    </Menu>
  );
}
