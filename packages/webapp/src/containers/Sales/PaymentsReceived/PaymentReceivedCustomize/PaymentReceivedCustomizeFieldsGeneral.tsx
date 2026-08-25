// @ts-nocheck
import intl from 'react-intl-universal';
import { Classes } from '@blueprintjs/core';
import { Overlay } from '../../Invoices/InvoiceCustomize/Overlay';
import {
  FFormGroup,
  FieldRequiredHint,
  FInputGroup,
  FSwitch,
  Stack,
} from '@/components';
import { FColorInput } from '@/components/Forms/FColorInput';
import { useIsTemplateNamedFilled } from '@/containers/BrandingTemplates/utils';
import { BrandingCompanyLogoUploadField } from '@/containers/ElementCustomize/components/BrandingCompanyLogoUploadField';

export function PaymentReceivedCustomizeGeneralField() {
  const isTemplateNameFilled = useIsTemplateNamedFilled();

  return (
    <Stack style={{ padding: 20, flex: '1 1 auto' }}>
      <Stack spacing={0}>
        <h2 style={{ fontSize: 16, marginBottom: 10, fontWeight: 600 }}>
          {intl.get('general_branding')}
        </h2>

        <p className={Classes.TEXT_MUTED}>
          {intl.get(
            'set_your_company_logo_and_branding_colors_to_be_automaticall_4',
          )}
        </p>
      </Stack>

      <FFormGroup
        name={'templateName'}
        label={intl.get('template_name')}
        labelInfo={<FieldRequiredHint />}
        style={{ marginBottom: 10 }}
        fastField
      >
        <FInputGroup name={'templateName'} fastField />
      </FFormGroup>

      <Overlay visible={!isTemplateNameFilled}>
        <Stack spacing={0}>
          <FFormGroup
            name={'primaryColor'}
            label={intl.get('primary_color')}
            style={{ justifyContent: 'space-between' }}
            inline
            fastField
          >
            <FColorInput
              name={'primaryColor'}
              inputProps={{ style: { maxWidth: 120 } }}
              fastField
            />
          </FFormGroup>

          <FFormGroup
            name={'secondaryColor'}
            label={intl.get('secondary_color')}
            style={{ justifyContent: 'space-between' }}
            inline
            fastField
          >
            <FColorInput
              name={'secondaryColor'}
              inputProps={{ style: { maxWidth: 120 } }}
              fastField
            />
          </FFormGroup>

          <Stack spacing={10}>
            <FFormGroup
              name={'showCompanyLogo'}
              label={intl.get('logo')}
              fastField
              style={{ marginBottom: 0 }}
            >
              <FSwitch
                name={'showCompanyLogo'}
                label={intl.get('display_company_logo_in_the_paper')}
                style={{ fontSize: 14 }}
                fastField
              />
            </FFormGroup>

            <BrandingCompanyLogoUploadField />
          </Stack>
        </Stack>
      </Overlay>
    </Stack>
  );
}
