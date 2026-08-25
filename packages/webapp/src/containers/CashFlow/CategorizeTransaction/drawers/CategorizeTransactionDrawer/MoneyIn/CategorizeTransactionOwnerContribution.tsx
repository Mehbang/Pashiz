import intl from 'react-intl-universal';
import { Position } from '@blueprintjs/core';
import React from 'react';
import { useCategorizeTransactionBoot } from '../CategorizeTransactionBoot';
import { CategorizeTransactionBranchField } from '../CategorizeTransactionBranchField';
import {
  AccountsSelect,
  FDateInput,
  FFormGroup,
  FInputGroup,
  FTextArea,
  Icon,
} from '@/components';
import { useDateInputFormatter } from '@/hooks';

export function CategorizeTransactionOwnerContribution() {
  const { accounts } = useCategorizeTransactionBoot();
  const dateInputFormatter = useDateInputFormatter();

  if (!accounts) {
    return null;
  }
  return (
    <>
      <FFormGroup name={'date'} label={intl.get('date')} fastField inline>
        <FDateInput
          name={'date'}
          popoverProps={{ position: Position.BOTTOM, minimal: true }}
          {...dateInputFormatter}
          inputProps={{ fill: true, leftElement: <Icon icon={'date-range'} /> }}
        />
      </FFormGroup>

      <FFormGroup
        name={'debitAccountId'}
        label={intl.get('from_account')}
        fastField
        inline
      >
        <AccountsSelect
          name={'debitAccountId'}
          items={accounts}
          fastField
          fill
          allowCreate
          disabled
        />
      </FFormGroup>

      <FFormGroup
        name={'creditAccountId'}
        label={intl.get('equity_account')}
        fastField
        inline
      >
        <AccountsSelect
          name={'creditAccountId'}
          items={accounts}
          filterByRootTypes={['equity']}
          fastField
          fill
          allowCreate
        />
      </FFormGroup>

      <FFormGroup
        name={'referenceNo'}
        label={intl.get('reference_no_2')}
        fastField
        inline
      >
        <FInputGroup name={'referenceNo'} fill />
      </FFormGroup>

      <FFormGroup
        name={'description'}
        label={intl.get('description')}
        fastField
        inline
      >
        <FTextArea name={'description'} growVertically large fill />
      </FFormGroup>

      <CategorizeTransactionBranchField />
    </>
  );
}
