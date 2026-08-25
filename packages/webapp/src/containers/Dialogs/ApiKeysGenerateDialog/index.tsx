import React from 'react';
import { compose } from 'redux';
import type { DialogBaseProps } from '@/components/DialogReduxConnect';
import { Dialog, DialogSuspense, FormattedMessage as T } from '@/components';
import withDialogRedux from '@/components/DialogReduxConnect';

// The content is composed through `withDialogActions`, which erases its own
// props from the resulting type; state the props the dialog passes to it.
const ApiKeysGenerateDialogContent = React.lazy(() =>
  import('./ApiKeysGenerateDialog').then((m) => ({
    default: m.ApiKeysGenerateDialogContent as React.ComponentType<{
      dialogName: string;
    }>,
  })),
);

interface ApiKeysGenerateDialogProps extends DialogBaseProps {
  dialogName: string;
}

/**
 * API keys generate dialog.
 *
 * The content used to be mounted straight into the page with no `Dialog`
 * wrapper, so its form rendered inline below the layout on every screen —
 * stray inputs over the page and a second scrollbar on the document.
 */
function ApiKeysGenerateDialog({
  dialogName,
  isOpen,
}: ApiKeysGenerateDialogProps): React.ReactElement {
  return (
    <Dialog
      name={dialogName}
      title={<T id={'api_key.dialog.generate_title'} />}
      isOpen={isOpen}
      canEscapeKeyClose={true}
      autoFocus={true}
    >
      <DialogSuspense>
        <ApiKeysGenerateDialogContent dialogName={dialogName} />
      </DialogSuspense>
    </Dialog>
  );
}

export const index = compose(withDialogRedux())(ApiKeysGenerateDialog);
export { ApiKeysGenerateDialogContent };
