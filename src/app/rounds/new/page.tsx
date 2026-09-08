'use client';

import { Suspense } from 'react';
import AppShell from '@/components/layout/AppShell';
import NewRoundPage from '@/components/screens/NewRoundPage';

export default function NewRound() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <NewRoundPage />
      </Suspense>
    </AppShell>
  );
}
