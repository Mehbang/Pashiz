import intl from 'react-intl-universal';
import { Classes, Tag } from '@blueprintjs/core';
import clsx from 'classnames';
import { Group } from '@/components';

export const useBrandingTemplatesColumns = () => {
  return [
    {
      Header: intl.get('template_name'),
      accessor: (row: any) => (
        <Group spacing={10}>
          {row.templateName}{' '}
          {row.default && <Tag round>{intl.get('default')}</Tag>}
        </Group>
      ),
      width: 65,
      clickable: true,
    },
    {
      Header: intl.get('created_at'),
      accessor: 'createdAtFormatted',
      width: 35,
      className: clsx(Classes.TEXT_MUTED),
      clickable: true,
    },
  ];
};
