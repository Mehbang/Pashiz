import intl from 'react-intl-universal';
import React, { lazy } from 'react';
import styled from 'styled-components';
import { Dialog, DialogSuspense } from '@/components';
import withDialogRedux, {
  DialogBaseProps,
} from '@/components/DialogReduxConnect';
import { compose } from '@/utils';

const TaxRateFormDialogContent = lazy(() =>
  import('./TaxRateFormDialogContent').then((m) => ({
    default: m.TaxRateFormDialogContent,
  })),
);

interface TaxRateFormDialogProps extends DialogBaseProps {
  dialogName: string;
  payload: { action: string; id?: number };
}

function TaxRateFormDialogInner({
  dialogName,
  payload = { action: '' },
  isOpen,
}: TaxRateFormDialogProps) {
  return (
    <TaxRateDialog
      name={dialogName}
      title={
        payload.id ? intl.get('edit_tax_rate') : intl.get('create_tax_rate')
      }
      autoFocus={true}
      canEscapeKeyClose={true}
      isOpen={isOpen}
    >
      <DialogSuspense>
        <TaxRateFormDialogContent
          dialogName={dialogName}
          taxRateId={payload.id as number}
        />
      </DialogSuspense>
    </TaxRateDialog>
  );
}

const TaxRateDialog = styled(Dialog)`
  max-width: 450px;
`;

export const TaxRateFormDialog = compose(withDialogRedux())(
  TaxRateFormDialogInner,
);
