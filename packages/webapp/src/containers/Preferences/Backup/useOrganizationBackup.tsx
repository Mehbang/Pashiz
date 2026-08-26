import React from 'react';
import useApiRequest from '@/hooks/useRequest';

export interface BackupSummary {
  organization_name?: string;
  exported_at?: string;
  source_version?: string;
  table_count: number;
  row_count: number;
  attachment_count: number;
}

/**
 * Export and import of the organization's own data.
 *
 * Not written as react-query hooks: neither call has a result worth caching —
 * one streams a file to disk, the other rewrites the books and invalidates
 * every cache in the application anyway.
 */
export function useOrganizationBackup() {
  const { http } = useApiRequest();

  /**
   * Downloads the export and hands it to the browser to save.
   */
  const exportBackup = React.useCallback(async () => {
    const response = await http.get('/api/organization/backup/export', {
      responseType: 'blob',
    });
    // The real, Persian filename rides in `filename*` per RFC 5987; the plain
    // `filename` beside it is the ASCII fallback and is usually stripped bare.
    const disposition = response.headers['content-disposition'] ?? '';
    const encoded = /filename\*=UTF-8''([^;]+)/.exec(disposition)?.[1];
    const filename = encoded
      ? decodeURIComponent(encoded)
      : 'organization.pashiz';

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return filename;
  }, [http]);

  /**
   * Reads a file and reports what it holds, without changing anything.
   */
  const inspectBackup = React.useCallback(
    async (file: File): Promise<BackupSummary> => {
      const form = new FormData();
      form.append('file', file);

      const response = await http.post(
        '/api/organization/backup/inspect',
        form,
      );
      return response.data;
    },
    [http],
  );

  /**
   * Replaces the organization's data with the file's.
   */
  const importBackup = React.useCallback(
    async (file: File): Promise<BackupSummary> => {
      const form = new FormData();
      form.append('file', file);

      const response = await http.post('/api/organization/backup/import', form);
      return response.data;
    },
    [http],
  );

  return { exportBackup, inspectBackup, importBackup };
}
