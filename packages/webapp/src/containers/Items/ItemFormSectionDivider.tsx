import { Divider } from '@blueprintjs/core';
import { css } from '@emotion/css';
import React from 'react';

const sectionDividerClass = css`
  margin: 20px 0;
`;

/**
 * The rule between two sections of the item form.
 *
 * Shared so that a section which renders conditionally can carry its own
 * divider — the category fields disappear when the chosen category defines
 * none, and a divider left behind in the parent would be a line with nothing
 * under it.
 */
export function ItemFormSectionDivider(): React.ReactElement {
  return <Divider className={sectionDividerClass} />;
}
