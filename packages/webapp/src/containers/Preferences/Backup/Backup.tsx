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
import { isBundle, useOrganizationBackup } from './useOrganizationBackup';
import type {
  BackupSummary,
  BundleContents,
  OrganizationArchive,
} from './useOrganizationBackup';

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
  const {
    exportBackup,
    inspectBackup,
    importBackup,
    listArchives,
    downloadArchive,
    restoreArchive,
  } = useOrganizationBackup();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setExporting] = useState(false);
  const [isImporting, setImporting] = useState(false);
  const [pending, setPending] = useState<{
    file: File;
    summary: BackupSummary;
    entryIndex?: number;
  } | null>(null);
  // A user bundle holds several organizations; which one lands here is a
  // decision only the reader can make, so it is asked before anything else.
  const [bundle, setBundle] = useState<{
    file: File;
    contents: BundleContents;
  } | null>(null);

  const [archives, setArchives] = useState<OrganizationArchive[]>([]);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    changePreferencesPageTitle(intl.get('backup.title'));
  }, [changePreferencesPageTitle]);

  // Best-effort: an installation that takes no automatic backups simply shows
  // no list, and that is not an error worth a toast.
  useEffect(() => {
    listArchives()
      .then(setArchives)
      .catch(() => setArchives([]));
  }, [listArchives]);

  const handleRestoreArchive = async (name: string) => {
    setRestoring(name);
    try {
      await restoreArchive(name);
      AppToaster.show({
        message: intl.get('backup.import.succeeded'),
        intent: Intent.SUCCESS,
      });
      window.location.reload();
    } catch {
      AppToaster.show({
        message: intl.get('backup.import.failed'),
        intent: Intent.DANGER,
      });
      setRestoring(null);
    }
  };

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
      const described = await inspectBackup(file);

      if (isBundle(described)) {
        setBundle({ file, contents: described });
      } else {
        setPending({ file, summary: described });
      }
    } catch {
      AppToaster.show({
        message: intl.get('backup.import.invalid_file'),
        intent: Intent.DANGER,
      });
    }
  };

  // Describing the chosen entry moves it onto the same confirmation step a
  // single-organization file goes through, so nothing is replaced without the
  // reader seeing what it is first.
  const handleChooseEntry = async (entryIndex: number) => {
    if (!bundle) return;
    try {
      const summary = (await inspectBackup(
        bundle.file,
        entryIndex,
      )) as BackupSummary;
      setPending({ file: bundle.file, summary, entryIndex });
      setBundle(null);
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
      await importBackup(pending.file, pending.entryIndex);
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

            {bundle ? (
              <Callout intent={Intent.PRIMARY}>
                <SummaryTitle>
                  {intl.get('backup.import.bundle.title', {
                    email: bundle.contents.user_email ?? '',
                  })}
                </SummaryTitle>
                <SummaryList>
                  {bundle.contents.entries.map((entry) => (
                    <li key={entry.index}>
                      <Button
                        minimal
                        intent={Intent.PRIMARY}
                        onClick={() => handleChooseEntry(entry.index)}
                      >
                        {entry.name ||
                          intl.get('backup.import.unnamed_organization')}
                      </Button>
                    </li>
                  ))}
                </SummaryList>
                <Button onClick={() => setBundle(null)}>
                  {intl.get('cancel')}
                </Button>
              </Callout>
            ) : pending ? (
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
                  accept=".pashiz,.pashizbundle,application/gzip"
                  onChange={handleFileChosen}
                />
              </>
            )}
          </section>

          <Divider />

          <section>
            <SectionTitle>{intl.get('backup.archives.title')}</SectionTitle>
            <SectionDescription>
              {intl.get('backup.archives.description')}
            </SectionDescription>

            {archives.length ? (
              <ArchiveList>
                {archives.map((archive) => (
                  <li key={archive.name}>
                    <ArchiveRow>
                      <ArchiveWhen>
                        {formatDateLocalized(
                          archive.created_at,
                          'DD MMMM YYYY — HH:mm',
                        )}
                      </ArchiveWhen>
                      <Group spacing={8}>
                        <Button
                          minimal
                          small
                          onClick={() => downloadArchive(archive.name)}
                        >
                          {intl.get('backup.archives.download')}
                        </Button>
                        <Button
                          minimal
                          small
                          intent={Intent.DANGER}
                          loading={restoring === archive.name}
                          onClick={() => handleRestoreArchive(archive.name)}
                        >
                          {intl.get('backup.archives.restore')}
                        </Button>
                      </Group>
                    </ArchiveRow>
                  </li>
                ))}
              </ArchiveList>
            ) : (
              <SectionDescription>
                {intl.get('backup.archives.empty')}
              </SectionDescription>
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

const ArchiveList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ArchiveRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(17, 20, 24, 0.1);

  .bp4-dark & {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
`;

const ArchiveWhen = styled.span`
  font-variant-numeric: tabular-nums;
`;
