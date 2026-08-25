// @ts-nocheck
import intl from 'react-intl-universal';
import { Alert, Intent } from '@blueprintjs/core';
import React from 'react';
import { AppToaster } from '@/components';
import { withAlertActions } from '@/containers/Alert/withAlertActions';
import { withAlertStoreConnect } from '@/containers/Alert/withAlertStoreConnect';
import { useAssignPdfTemplateAsDefault } from '@/hooks/query/pdf-templates';
import { compose } from '@/utils';

/**
 * Mark default branding template alert.
 */
function MarkDefaultBrandingTemplateAlertInner({
  // #ownProps
  name,

  // #withAlertStoreConnect
  isOpen,
  payload: { templateId },

  // #withAlertActions
  closeAlert,
}) {
  const { mutateAsync: assignPdfTemplateAsDefault } =
    useAssignPdfTemplateAsDefault();

  const handleConfirmDelete = () => {
    assignPdfTemplateAsDefault({ templateId })
      .then(() => {
        AppToaster.show({
          message:
            'The branding template has been marked as a default template.',
          intent: Intent.SUCCESS,
        });
        closeAlert(name);
      })
      .catch((error) => {
        AppToaster.show({
          message: intl.get('something_wentwrong'),
          intent: Intent.DANGER,
        });
        closeAlert(name);
      });
  };

  const handleCancel = () => {
    closeAlert(name);
  };

  return (
    <Alert
      cancelButtonText={intl.get('cancel')}
      confirmButtonText={intl.get('mark_as_default')}
      intent={Intent.WARNING}
      isOpen={isOpen}
      onCancel={handleCancel}
      onConfirm={handleConfirmDelete}
    >
      <p>
        {intl.get(
          'are_you_sure_want_to_mark_the_given_branding_template_as_a_d',
        )}
      </p>
    </Alert>
  );
}

export const MarkDefaultBrandingTemplateAlert = compose(
  withAlertStoreConnect(),
  withAlertActions,
)(MarkDefaultBrandingTemplateAlertInner);
