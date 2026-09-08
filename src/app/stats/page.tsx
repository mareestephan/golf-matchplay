import AppShell from '@/components/layout/AppShell';
import StatsPage from '@/components/screens/StatsPage';
import { HISTORICAL_ROUNDS_2026, HISTORICAL_ROUNDS_2025_2026 } from '@/data/seedData';

export default function Stats() {
  const allRounds = [...HISTORICAL_ROUNDS_2025_2026, ...HISTORICAL_ROUNDS_2026];

  return (
    <AppShell>
      <StatsPage rounds={allRounds} />
    </AppShell>
  );
}
