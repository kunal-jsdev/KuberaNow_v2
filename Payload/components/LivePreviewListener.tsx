'use client';

import { FC } from 'react';

import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react';
import { useRouter } from 'next/navigation';

import { getClientSideURL } from '@/Payload/lib/utilities/getURL';

const LivePreviewListener: FC = () => {
  const router = useRouter();

  return (
    <PayloadLivePreview
      refresh={() => router.refresh()}
      serverURL={getClientSideURL()}
    />
  );
};

export default LivePreviewListener;
