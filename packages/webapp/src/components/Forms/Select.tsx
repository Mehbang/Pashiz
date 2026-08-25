// @ts-nocheck
import intl from 'react-intl-universal';
import { Button } from '@blueprintjs/core';
import { FormikSelect, Select } from '@blueprintjs-formik/select';
import clsx from 'classnames';
import React from 'react';
import styled from 'styled-components';

/**
 * Translated defaults for the query box a select popover shows.
 *
 * `@blueprintjs-formik/select` falls back to a literal "No results." and
 * Blueprint's own query input to a literal "Filter...", neither of which pass
 * through the translation layer. Applying them here means every select in the
 * application inherits the locale's wording, while a call site that passes its
 * own text still wins.
 */
export const selectLocaleDefaults = (props: Record<string, any> = {}) => ({
  noResultsText: props.noResultsText ?? intl.get('no_results'),
  inputProps: {
    placeholder: intl.get('filter_placeholder'),
    ...props.inputProps,
  },
});

export function FSelect<T extends SelectOptionProps = SelectOptionProps>({
  ...props
}) {
  const input = ({ activeItem, text, label, value }) => (
    <SelectButton
      text={text || props.placeholder || intl.get('select_an_item')}
      disabled={props.disabled || false}
      {...props.buttonProps}
      className={clsx({ 'is-selected': !!text }, props.className)}
    />
  );
  return (
    <FormikSelect<T>
      input={input}
      fill={true}
      {...props}
      {...selectLocaleDefaults(props)}
    />
  );
}

export function BPSelect<T extends SelectOptionProps = SelectOptionProps>({
  ...props
}) {
  const input = ({ activeItem, text, label, value }) => (
    <SelectButton
      text={text || props.placeholder || intl.get('select_an_item')}
      disabled={props.disabled || false}
      {...props.buttonProps}
      className={clsx({ 'is-selected': !!text }, props.className)}
    />
  );
  return (
    <Select<T>
      input={input}
      fill={true}
      {...props}
      {...selectLocaleDefaults(props)}
    />
  );
}

export const SelectButton = styled(Button)`
  --x-color-select-background: #fff;
  --x-color-select-border: #ced4da;
  --x-color-select-caret: #8d8d8d;

  .bp4-dark & {
    --x-color-select-background: rgba(17, 20, 24, 0.3);
    --x-color-select-border: rgba(255, 255, 255, 0.15);
    --x-color-select-caret: rgba(255, 255, 255, 0.25);
  }
  outline: none;
  box-shadow: 0 0 0 transparent;
  border: 1px solid var(--x-color-select-border);
  position: relative;
  padding-right: 30px;

  &.bp4-small {
    padding-right: 24px;
  }
  &:not(.is-selected):not([class*='bp4-intent-']):not(.bp4-minimal) {
    color: #8f99a8;
  }
  &:after {
    content: '';
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid var(--x-color-select-caret);

    position: absolute;
    right: 0;
    top: 50%;
    margin-top: -2px;
    margin-right: 12px;
    border-radius: 1px;
  }
  &:not([class*='bp4-intent-']):not(.bp4-disabled) {
    &,
    &:hover {
      background: var(--x-color-select-background);
    }
  }
  .bp4-intent-danger & {
    border-color: #db3737;
  }
`;
