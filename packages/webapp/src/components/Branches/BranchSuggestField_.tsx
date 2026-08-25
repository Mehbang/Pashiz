import intl from 'react-intl-universal';
import React from 'react';
import { FSuggest } from '../Forms';

type BranchSuggestFieldProps = React.ComponentProps<typeof FSuggest> & {
  items: unknown[];
};

export function BranchSuggestField(props: BranchSuggestFieldProps) {
  return (
    <FSuggest
      valueAccessor={'id'}
      labelAccessor={'code'}
      textAccessor={'name'}
      inputProps={{ placeholder: intl.get('select_a_branch') }}
      {...props}
    />
  );
}
