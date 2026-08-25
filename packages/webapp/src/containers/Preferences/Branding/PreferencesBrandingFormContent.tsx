import intl from 'react-intl-universal';
import { Button, Classes, Intent, Text } from '@blueprintjs/core';
import { useFormikContext } from 'formik';
import type { PreferencesBrandingFormValues } from './_types';
import styles from './PreferencesBranding.module.scss';
import { FFormGroup, Group, Stack } from '@/components';
import { FColorInput } from '@/components/Forms/FColorInput';
import { CompanyLogoUpload } from '@/containers/ElementCustomize/components/CompanyLogoUpload';
import { useIsDarkMode } from '@/hooks/useDarkMode';

export function PreferencesBrandingFormContent() {
  return (
    <Stack style={{ flex: '1' }} spacing={10}>
      <FFormGroup name={'companyLogo'} label={intl.get('company_logo')}>
        <Group spacing={15} align={'left'}>
          <BrandingCompanyLogoUpload />
          <BrandingCompanyLogoDesc />
        </Group>
      </FFormGroup>

      <FFormGroup
        name={'primaryColor'}
        label={intl.get('primary_color')}
        helperText={intl.get(
          'note_these_preferences_will_be_applied_across_pdf_and_mail_t',
        )}
      >
        <FColorInput name={'primaryColor'} />
      </FFormGroup>
    </Stack>
  );
}

export function PreferencesBrandingFormFooter() {
  const { isSubmitting } = useFormikContext<PreferencesBrandingFormValues>();
  const isDarkMode = useIsDarkMode();

  return (
    <Group
      style={{
        padding: '12px 0',
        borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.25)' : '#e1e1e1'}`,
      }}
    >
      <Button intent={Intent.PRIMARY} type={'submit'} loading={isSubmitting}>
        {intl.get('submit')}
      </Button>
    </Group>
  );
}

export function BrandingCompanyLogoUpload() {
  const { setFieldValue, values } =
    useFormikContext<PreferencesBrandingFormValues>();

  return (
    <CompanyLogoUpload
      initialPreview={values?.logoUri}
      onChange={(file: File | null) => {
        const imageUrl = file ? URL.createObjectURL(file) : '';

        setFieldValue('_logoFile', file);
        setFieldValue('logoUri', imageUrl);
        setFieldValue('logoKey', '');
      }}
      classNames={{
        root: styles.fileUploadRoot,
      }}
    />
  );
}

function BrandingCompanyLogoDesc() {
  return (
    <Stack spacing={10} style={{ fontSize: 12, paddingTop: 12, flex: 1 }}>
      <Text className={Classes.TEXT_MUTED}>
        {intl.get(
          'this_logo_will_be_displayed_in_transaction_pdfs_and_email_no',
        )}
      </Text>
      <Text className={Classes.TEXT_MUTED}>
        {intl.get(
          'preferred_image_dimensions_240_240_pixels_72_dpi_maximum_fil',
        )}
      </Text>
    </Stack>
  );
}
