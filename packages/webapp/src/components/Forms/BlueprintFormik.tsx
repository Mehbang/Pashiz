import {
  FormGroup,
  InputGroup,
  NumericInput,
  Checkbox,
  RadioGroup,
  Switch,
  EditableText,
  TextArea,
  HTMLSelect,
} from '@blueprintjs-formik/core';
import { TimezoneSelect } from '@blueprintjs-formik/datetime';
import {
  MultiSelect,
  Suggest,
  Select,
  FormikMultiSelect,
  FormikSuggest,
  withFormikMultiSelect,
  withFormikSuggest,
  withFormikSelect,
} from '@blueprintjs-formik/select';
import React from 'react';
import { MenuItem } from '@blueprintjs/core';
import intl from 'react-intl-universal';
import { FDateInput } from './FDateInput';
import { FSelect, BPSelect, selectLocaleDefaults } from './Select';

/**
 * The multi-select and the suggest are re-exported straight from
 * `@blueprintjs-formik/select`, so they carry the package's untranslated
 * "No results." and Blueprint's "Filter..." unless told otherwise. Wrapping
 * them applies the same locale defaults `FSelect` gets.
 */
function FMultiSelectLocalised<T>(props: any) {
  const Component = FormikMultiSelect as React.ComponentType<any>;

  return <Component {...props} {...selectLocaleDefaults(props)} />;
}

function FSuggestLocalised<T>(props: any) {
  const Component = FormikSuggest as React.ComponentType<any>;

  // Blueprint's `Suggest` takes a node rather than the package's text prop.
  const noResults = props.noResults ?? (
    <MenuItem disabled={true} text={intl.get('no_results')} />
  );
  const { noResultsText, ...localeDefaults } = selectLocaleDefaults(props);

  return <Component {...props} {...localeDefaults} noResults={noResults} />;
}

export {
  FormGroup as FFormGroup,
  InputGroup as FInputGroup,
  NumericInput as FNumericInput,
  Checkbox as FCheckbox,
  RadioGroup as FRadioGroup,
  Switch as FSwitch,
  FSelect,
  BPSelect,
  FMultiSelectLocalised as FMultiSelect,
  EditableText as FEditableText,
  FSuggestLocalised as FSuggest,
  TextArea as FTextArea,
  FDateInput,
  HTMLSelect as FHTMLSelect,
  TimezoneSelect as FTimezoneSelect,
  Suggest,
  MultiSelect,
  Select,
  withFormikSelect,
  withFormikMultiSelect,
  withFormikSuggest,
};
