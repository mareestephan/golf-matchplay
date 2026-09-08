'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import RoundForm from './RoundForm';
import { fetchRound } from '@/lib/rounds';
import { Round } from '@/types';
import { Spinner } from '@/components/ui/spinner';

export default function NewRoundPage() {
  const params = useSearchParams();
  const editId = params.get('edit');
  const [existingRound, setExistingRound] = useState<Round | undefined>();
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;
    let active = true;
    fetchRound(editId)
      .then((round) => {
        if (active) {
          setExistingRound(round);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [editId]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  // Remount the form when the target round changes so its initial state resets.
  return <RoundForm key={editId ?? 'new'} existingRound={existingRound} />;
}
