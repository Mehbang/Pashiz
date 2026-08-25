import intl from 'react-intl-universal';
import { css } from '@emotion/css';
import { x } from '@xstyled/emotion';
import { SetupCongratsPage } from './SetupCongratsPage';
import { SetupInitializingForm } from './SetupInitializingForm';
import { SetupOrganizationPage } from './SetupOrganizationPage';
import { SetupSubscription } from './SetupSubscription/SetupSubscription';
import { Stepper } from '@/components/Stepper';

interface SetupWizardContentProps {
  stepIndex: number;
  stepId: string;
}

const itemsClassName = css`
  padding: 40px 40px 20px;
`;

/**
 * Setup wizard content.
 */
export function SetupWizardContent({
  stepIndex,
  stepId,
}: SetupWizardContentProps) {
  return (
    <x.div w="100%" overflow="auto">
      <Stepper
        active={stepIndex}
        classNames={{
          items: itemsClassName,
        }}
      >
        <Stepper.Step label={intl.get('subscription')}>
          <SetupSubscription />
        </Stepper.Step>

        <Stepper.Step label={intl.get('organization_2')}>
          <SetupOrganizationPage />
        </Stepper.Step>

        <Stepper.Step label={intl.get('Initializing')}>
          <SetupInitializingForm />
        </Stepper.Step>

        <Stepper.Step label={intl.get('congrats')}>
          <SetupCongratsPage />
        </Stepper.Step>
      </Stepper>
    </x.div>
  );
}
