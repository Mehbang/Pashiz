import intl from 'react-intl-universal';
import { Button, Intent, Position } from '@blueprintjs/core';
import clsx from 'classnames';
import { useFormikContext } from 'formik';
import { useCallback, useMemo } from 'react';
import type { ImportFileMappingFormValues } from './_types';
import { ImportStepperStep } from './_types';
import { getFieldKey } from './_utils';
import { ImportFileContainer } from './ImportFileContainer';
import styles from './ImportFileMapping.module.scss';
import { ImportFileMapBootProvider } from './ImportFileMappingBoot';
import { ImportFileMappingForm } from './ImportFileMappingForm';
import { EntityColumnField, useImportFileContext } from './ImportFileProvider';
import { Box, FSelect, Group, Hint } from '@/components';
import { CLASSES } from '@/constants';

export function ImportFileMapping() {
  const { importId, entityColumns } = useImportFileContext();

  return (
    <ImportFileMapBootProvider importId={importId}>
      <ImportFileMappingForm>
        <ImportFileContainer>
          <p>
            {intl.get(
              'review_and_map_the_column_headers_in_your_csv_xlsx_file_with',
            )}
          </p>

          {entityColumns.map((entityColumn) => (
            <ImportFileMappingGroup
              key={entityColumn.groupKey || entityColumn.groupLabel}
              groupKey={entityColumn.groupKey}
              groupLabel={entityColumn.groupLabel}
              fields={entityColumn.fields}
            />
          ))}
        </ImportFileContainer>
        <ImportFileMappingFloatingActions />
      </ImportFileMappingForm>
    </ImportFileMapBootProvider>
  );
}

interface ImportFileMappingGroupProps {
  groupKey: string;
  groupLabel: string;
  fields: EntityColumnField[];
}

function ImportFileMappingGroup({
  groupKey,
  groupLabel,
  fields,
}: ImportFileMappingGroupProps) {
  return (
    <Box className={styles.group}>
      {groupLabel && <h3 className={styles.groupTitle}>{groupLabel}</h3>}

      <table className={clsx('bp4-html-table', styles.table)}>
        <thead>
          <tr>
            <th className={styles.label}>{intl.get('bigcapital_fields')}</th>
            <th className={styles.field}>{intl.get('sheet_column_headers')}</th>
          </tr>
        </thead>
        <tbody>
          <ImportFileMappingFields fields={fields} />
        </tbody>
      </table>
    </Box>
  );
}

interface ImportFileMappingFieldsProps {
  fields: EntityColumnField[];
}

function ImportFileMappingFields({ fields }: ImportFileMappingFieldsProps) {
  const { sheetColumns } = useImportFileContext();

  const items = useMemo(
    () => sheetColumns.map((column) => ({ value: column, text: column })),
    [sheetColumns],
  );
  const columnMapper = useCallback(
    (column: EntityColumnField, index: number) => (
      <tr key={index}>
        <td className={styles.label}>
          {column.name}{' '}
          {column.required && <span className={styles.requiredSign}>*</span>}
        </td>
        <td className={styles.field}>
          <Group spacing={4}>
            <FSelect
              name={getFieldKey(column.key, column.group)}
              items={items}
              popoverProps={{ minimal: true }}
              minimal={true}
              fill={true}
            />
            {column.hint && (
              <Hint content={column.hint} position={Position.BOTTOM} />
            )}
          </Group>
        </td>
      </tr>
    ),
    [items],
  );
  const columns = useMemo(
    () => fields.map(columnMapper),
    [columnMapper, fields],
  );
  return <>{columns}</>;
}

function ImportFileMappingFloatingActions() {
  const { isSubmitting } = useFormikContext<ImportFileMappingFormValues>();
  const { setStep } = useImportFileContext();

  const handleCancelBtnClick = () => {
    setStep(ImportStepperStep.Upload);
  };

  return (
    <div className={clsx(CLASSES.PAGE_FORM_FLOATING_ACTIONS)}>
      <Group spacing={10}>
        <Button onClick={handleCancelBtnClick}>{intl.get('back')}</Button>
        <Button type="submit" intent={Intent.PRIMARY} loading={isSubmitting}>
          {intl.get('next')}
        </Button>
      </Group>
    </div>
  );
}
