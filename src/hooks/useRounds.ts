'use client';

import { useState, useEffect } from 'react';
import { Round } from '@/types';
import { fetchRounds } from '@/lib/rounds';

/**
 * Returns the given seed rounds merged with any persisted rounds (Supabase when
 * configured, otherwise localStorage). On the server / first paint it returns
 * the seed as-is; after mount it folds in persisted edits and new rounds.
 */
export function useRounds(seed: Round[]): Round[] {
  const [rounds, setRounds] = useState<Round[]>(seed);

  useEffect(() => {
    let active = true;
    fetchRounds(seed)
      .then((merged) => {
        if (active) setRounds(merged);
      })
      .catch(() => {
        // Keep showing the seed data if the fetch fails.
      });
    return () => {
      active = false;
    };
  }, [seed]);

  return rounds;
}
