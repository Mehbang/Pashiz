import { Button, Callout, Intent } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { AppToaster, Card, Group, Stack } from '@/components';
import { CLASSES } from '@/constants/classes';
import { withDashboardActions } from '@/containers/Dashboard/withDashboardActions';
import type { WithDashboardActionsProps } from '@/containers/Dashboard/withDashboardActions';
import { compose } from '@/utils';
import { localizedDigits } from '@/utils/locale';
import { formatDateLocalized } from '@/utils/locale';
import { useOrganizationBackup } from './useOrganizationBackup';
import type { BackupSummary } from './useOrganizationBackup';

type BackupPreferencesProps = Pick<
  WithDashboardActionsProps,
  'changePreferencesPageTitle'
>;

/**
 * Export and import of this organization's data.
 *
 * Scoped to the organization on purpose: it carries the books to another
 * installation, not the installation itself. The users of wherever the file
 * lands are left alone.
 */
function BackupPreferences({
  changePreferencesPageTitle,
}: BackupPreferencesProps) {
  const { exportBackup, inspectBackup, importBackup } = useOrganizationBackup();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setExporting] = useState(false);
  const [isImporting, setImporting] = useState(false);
  const [pending, setPending] = useState<{
    file: File;
    summary: BackupSummary;
  } | null>(null);

  useEffect(() => {
    changePreferencesPageTitle(intl.get('backup.title'));
  }, [changePreferencesPageTitle]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportBackup();
      AppToaster.show({
        message: intl.get('backup.export.succeeded'),
        intent: Intent.SUCCESS,
      });
    } catch {
      AppToaster.show({
        message: intl.get('backup.export.failed'),
        intent: Intent.DANGER,
      });
    } finally {
      setExporting(false);
    }
  };

  // The file is read first and only described; nothing is replaced until the
  // second, explicit confirmation below.
  const handleFileChosen = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const summary = await inspectBackup(file);
      setPending({ file, summary });
    } catch {
      AppToaster.show({
        message: intl.get('backup.import.invalid_file'),
        intent: Intent.DANGER,
      });
    }
  };

  const handleConfirmImport = async () => {
    if (!pending) return;
    setImporting(true);
    try {
      await importBackup(pending.file);
      AppToaster.show({
        message: intl.get('backup.import.succeeded'),
        intent: Intent.SUCCESS,
      });
      // Every cached list, report and setting in the application now describes
      // data that is gone, so the page is reloaded rather than invalidated
      // piecemeal.
      window.location.reload();
    } catch {
      AppToaster.show({
        message: intl.get('backup.import.failed'),
        intent: Intent.DANGER,
      });
      setImporting(false);
    }
  };

  return (
    <div className={classNames(CLASSES.PREFERENCES_PAGE_INSIDE_CONTENT)}>
      <BackupCard>
        <Stack spacing={24}>
          <section>
            <SectionTitle>{intl.get('backup.export.title')}</SectionTitle>
            <SectionDescription>
              {intl.get('backup.export.description')}
            </SectionDescription>

            <Button
              intent={Intent.PRIMARY}
              onClick={handleExport}
              loading={isExporting}
            >
              {intl.get('backup.export.button')}
            </Button>
          </section>

          <Divider />

          <section>
            <SectionTitle>{intl.get('backup.import.title')}</SectionTitle>
            <SectionDescription>
              {intl.get('backup.import.description')}
            </SectionDescription>

            <Callout intent={Intent.WARNING} style={{ marginBottom: 16 }}>
              {intl.get('backup.import.warning')}
            </Callout>

            {pending ? (
              <Callout intent={Intent.PRIMARY}>
                <SummaryTitle>
                  {pending.summary.organization_name ||
                    intl.get('backup.import.unnamed_organization')}
                </SummaryTitle>
                <SummaryList>
                  <li>
                    {intl.get('backup.import.summary.exported_at', {
                      date: pending.summary.exported_at
                        ? formatDateLocalized(
                            pending.summary.exported_at,
                            'DD MMMM YYYY',
                          )
                        : '—',
                    })}
                  </li>
                  <li>
                    {intl.get('backup.import.summary.rows', {
                      rows: localizedDigits(pending.summary.row_count),
                      tables: localizedDigits(pending.summary.table_count),
                    })}
                  </li>
                  <li>
                    {intl.get('backup.import.summary.attachments', {
                      count: localizedDigits(pending.summary.attachment_count),
                    })}
                  </li>
                </SummaryList>

                <Group spacing={10}>
                  <Button
                    intent={Intent.DANGER}
                    onClick={handleConfirmImport}
                    loading={isImporting}
                  >
                    {intl.get('backup.import.confirm')}
                  </Button>
                  <Button
                    onClick={() => setPending(null)}
                    disabled={isImporting}
                  >
                    {intl.get('cancel')}
                  </Button>
                </Group>
              </Callout>
            ) : (
              <>
                <Button onClick={() => fileInputRef.current?.click()}>
                  {intl.get('backup.import.choose_file')}
                </Button>
                <HiddenFileInput
                  ref={fileInputRef}
                  type="file"
                  accept=".pashiz,application/gzip"
                  onChange={handleFileChosen}
                />
              </>
            )}
          </section>
        </Stack>
      </BackupCard>
    </div>
  );
}

export const Backup = compose(withDashboardActions)(BackupPreferences);

const BackupCard = styled(Card)`
  padding: 25px;
  max-width: 700px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 6px;
`;

const SectionDescription = styled.p`
  color: #5f6b7c;
  margin: 0 0 16px;
  line-height: 1.7;
`;

const Divider = styled.div`
  border-top: 1px solid rgba(17, 20, 24, 0.12);

  .bp4-dark & {
    border-top-color: rgba(255, 255, 255, 0.12);
  }
`;

const SummaryTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
`;

const SummaryList = styled.ul`
  margin: 0 0 16px;
  padding-inline-start: 20px;
  line-height: 1.9;
`;

const HiddenFileInput = styled.input`
  display: none;
`;
