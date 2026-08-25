// @ts-nocheck
import intl from 'react-intl-universal';
import { Spinner, Classes } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';

/**
 * Previews the pdf document of the given object url.
 */
export function PdfDocumentPreview({
  url,
  height,
  width,
  isLoading,
  isError = false,
}) {
  const content = isLoading ? (
    <Spinner size={30} />
  ) : isError ? (
    <div className="pdf-preview__error">
      {intl.get('failed_to_load_the_pdf_document_please_try_again')}
    </div>
  ) : (
    <embed src={url} height={height} width={width} />
  );

  return (
    <div
      className={classNames(Classes.DIALOG_BODY, {
        loading: isLoading,
      })}
    >
      {content}
    </div>
  );
}
