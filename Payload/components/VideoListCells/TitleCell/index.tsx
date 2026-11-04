'use client';

import { useConfig } from '@payloadcms/ui';
import Link from 'next/link';

export const TitleCell: React.FC<any> = ({ cellData, rowData }) => {
  const { config } = useConfig();
  const adminRoute = config.routes.admin;
  const editUrl = `${adminRoute}/collections/videos/${rowData.id}`;

  return (
    <Link
      href={editUrl}
      style={{ color: 'inherit', textDecoration: 'none' }}
    >
      {cellData}
    </Link>
  );
};

export default TitleCell;
