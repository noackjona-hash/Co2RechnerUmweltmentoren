import { Suspense } from 'react';
import { JoinClient } from './join-client';
import JoinLoading from './loading';

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<JoinLoading />}>
      <JoinClient params={params} />
    </Suspense>
  );
}
