import intl from 'react-intl-universal';
import { Classes } from '@blueprintjs/core';
import React from 'react';
import { StripeIntegrationEditBoot } from './StripeIntegrationEditBoot';
import { StripeIntegrationEditForm } from './StripeIntegrationEditForm';
import {
  StripeIntegrationEditFormContent,
  StripeIntegrationEditFormFooter,
} from './StripeIntegrationEditFormContent';
import { DrawerBody, DrawerHeaderContent } from '@/components';

export function StripeIntegrationEditContent() {
  return (
    <>
      <DrawerHeaderContent title={intl.get('edit_stripe_integration')} />

      <StripeIntegrationEditBoot>
        <StripeIntegrationEditForm>
          <DrawerBody>
            <StripeIntegrationEditFormContent />
          </DrawerBody>

          <div className={Classes.DRAWER_FOOTER}>
            <StripeIntegrationEditFormFooter />
          </div>
        </StripeIntegrationEditForm>
      </StripeIntegrationEditBoot>
    </>
  );
}
