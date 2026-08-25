import intl from 'react-intl-universal';
import { ImportFileMapping } from './ImportFileMapping';
import { ImportFilePreview } from './ImportFilePreview';
import { useImportFileContext } from './ImportFileProvider';
import { ImportFileUploadStep } from './ImportFileUploadStep';
import styles from './ImportStepper.module.scss';
import { Stepper } from '@/components/Stepper';

export function ImportStepper() {
  const { step } = useImportFileContext();

  return (
    <Stepper
      active={step}
      classNames={{
        content: styles.content,
        items: styles.items,
      }}
    >
      <Stepper.Step label={intl.get('file_upload')}>
        <ImportFileUploadStep />
      </Stepper.Step>

      <Stepper.Step label={intl.get('mapping')}>
        <ImportFileMapping />
      </Stepper.Step>

      <Stepper.Step label={intl.get('results')}>
        <ImportFilePreview />
      </Stepper.Step>
    </Stepper>
  );
}
