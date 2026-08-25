import intl from 'react-intl-universal';
import { Button, Intent, Radio } from '@blueprintjs/core';
import { x } from '@xstyled/emotion';
import { Form, useFormikContext } from 'formik';
import React from 'react';
import { ExportResources } from './constants';
import type { WithDialogActionsProps } from '@/containers/Dialog/withDialogActions';
import { FFormGroup, FRadioGroup, FSelect, Group } from '@/components';
import { DialogsName } from '@/constants/dialogs';
import { withDialogActions } from '@/containers/Dialog/withDialogActions';
import { compose } from '@/utils';

interface ExportDialogFormContentValues {
  resource: string;
  format: string;
}

interface ExportDialogFormContentProps extends WithDialogActionsProps {}

function ExportDialogFormContentRoot({
  closeDialog,
}: ExportDialogFormContentProps): React.ReactElement {
  const { isSubmitting } = useFormikContext<ExportDialogFormContentValues>();
  const handleCancelBtnClick = () => {
    closeDialog(DialogsName.Export);
  };

  return (
    <Form>
      <x.div p="20px">
        <x.p className="bp4-text-muted" mb="1.2rem">
          {intl.get(
            'you_can_export_data_from_bigcapital_in_csv_or_xlsx_format',
          )}
        </x.p>

        <FFormGroup name={'resource'} label={intl.get('select_resource')}>
          <x.div maxWidth="280px">
            <FSelect
              name={'resource'}
              items={ExportResources}
              popoverProps={{ minimal: true }}
            />
          </x.div>
        </FFormGroup>

        <FRadioGroup label={intl.get('export_as')} name={'format'}>
          <Radio value={'xlsx'}>{intl.get('xlsx_microsoft_excel')}</Radio>
          <Radio value={'csv'}>{intl.get('csv_comma_seperated_value')}</Radio>
        </FRadioGroup>

        <x.div mt="1.6rem">
          <Group position={'right'} spacing={10}>
            <Button intent={Intent.NONE} onClick={handleCancelBtnClick}>
              {intl.get('cancel')}
            </Button>
            <Button
              type={'submit'}
              intent={Intent.PRIMARY}
              loading={isSubmitting}
            >
              {intl.get('export')}
            </Button>
          </Group>
        </x.div>
      </x.div>
    </Form>
  );
}

export const ExportDialogFormContent = compose(withDialogActions)(
  ExportDialogFormContentRoot,
);
