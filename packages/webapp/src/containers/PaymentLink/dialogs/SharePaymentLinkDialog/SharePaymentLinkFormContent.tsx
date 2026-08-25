// @ts-nocheck
import intl from 'react-intl-universal';
import {
  Button,
  Classes,
  DialogBody,
  DialogFooter,
  FormGroup,
  InputGroup,
  Intent,
  Position,
  Tooltip,
} from '@blueprintjs/core';
import { useFormikContext } from 'formik';
import { useSharePaymentLink } from './SharePaymentLinkProvider';
import {
  DialogFooterActions,
  FDateInput,
  FFormGroup,
  FSelect,
  Icon,
  Stack,
} from '@/components';
import { useDialogContext } from '@/components/Dialog/DialogProvider';
import { useDateInputFormatter } from '@/hooks';
import { useDialogActions } from '@/hooks/state';
import { useClipboard } from '@/hooks/utils/useClipboard';

export function SharePaymentLinkFormContent() {
  const { url } = useSharePaymentLink();
  const { closeDialog } = useDialogActions();
  const { name } = useDialogContext();
  const { isSubmitting } = useFormikContext();

  const clipboard = useClipboard();
  const dateInputFormatter = useDateInputFormatter();

  const handleCopyBtnClick = () => {
    clipboard.copy(url);
  };
  const handleCancelBtnClick = () => {
    closeDialog(name);
  };

  return (
    <>
      <DialogBody>
        <Stack spacing={0}>
          <FFormGroup
            name={'publicity'}
            label={intl.get('visibility')}
            style={{ marginBottom: 10 }}
            inline
          >
            <FSelect
              name={'publicity'}
              items={[
                { value: 'private', text: intl.get('private') },
                { value: 'public', text: intl.get('public') },
              ]}
              input={({ activeItem, text, label, value }) => (
                <Button
                  text={text || intl.get('select_an_item')}
                  rightIcon={<Icon icon={'caret-down-16'} iconSize={16} />}
                  minimal
                />
              )}
              searchable={false}
              fastField
            />
          </FFormGroup>

          <p className={Classes.TEXT_MUTED} style={{ marginBottom: 20 }}>
            {intl.get(
              'select_an_expiration_date_and_generate_the_link_to_share_it_',
            )}
          </p>

          <FFormGroup
            name={'expiryDate'}
            label={intl.get('expiration_date')}
            helperText={intl.get(
              'by_default_the_link_is_set_to_expire_90_days_from_today',
            )}
            fastField
          >
            <FDateInput
              name={'expiryDate'}
              popoverProps={{ position: Position.BOTTOM, minimal: true }}
              {...dateInputFormatter}
              inputProps={{
                fill: true,
                style: { minWidth: 260 },
                leftElement: <Icon icon={'date-range'} />,
              }}
              fastField
            />
          </FFormGroup>

          {url && (
            <FormGroup name={'link'} label={intl.get('payment_link')}>
              <InputGroup
                name={'link'}
                value={url}
                disabled
                leftElement={
                  <Tooltip content="Copy to clipboard" position={Position.TOP}>
                    <Button
                      onClick={handleCopyBtnClick}
                      minimal
                      icon={<Icon icon={'clipboard'} iconSize={16} />}
                    />
                  </Tooltip>
                }
              />
            </FormGroup>
          )}
        </Stack>
      </DialogBody>

      <DialogFooter>
        <DialogFooterActions>
          {url ? (
            <Button intent={Intent.PRIMARY} onClick={handleCopyBtnClick}>
              {intl.get('copy_link')}
            </Button>
          ) : (
            <>
              <Button onClick={handleCancelBtnClick}>
                {intl.get('cancel')}
              </Button>
              <Button
                type={'submit'}
                intent={Intent.PRIMARY}
                loading={isSubmitting}
                style={{ minWidth: 100 }}
              >
                {intl.get('generate')}
              </Button>
            </>
          )}
        </DialogFooterActions>
      </DialogFooter>
    </>
  );
}
