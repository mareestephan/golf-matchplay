'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import RoundDetailPage from '@/components/pages/RoundDetailPage';

function RoundViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  return (
    <AppShell>
      <RoundDetailPage roundId={id} />
    </AppShell>
  );
}

// Static export can't pre-render arbitrary IDs created at runtime, so the round
// id is read from a query param on the client instead of a dynamic [id] segment.
export default function RoundViewPage() {
  return (
    <Suspense fallback={null}>
      <RoundViewContent />
    </Suspense>
  );
}
