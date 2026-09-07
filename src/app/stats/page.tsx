import AppShell from '@/components/layout/AppShell';
import StatsPage from '@/components/pages/StatsPage';
import { HISTORICAL_ROUNDS_2026, HISTORICAL_ROUNDS_2025_2026 } from '@/data/seedData';

export default function Stats() {
  const allRounds = [...HISTORICAL_ROUNDS_2025_2026, ...HISTORICAL_ROUNDS_2026];
  
  return (
    <AppShell>
      <div style={{ padding: '2rem 0' }}>
        <div style={{ marginBottom: '4rem' }}>
          <StatsPage
            rounds={allRounds}
            playerId="stephanmaree"
            playerName="Stephan Maree"
          />
        </div>
        <div>
          <StatsPage
            rounds={allRounds}
            playerId="pauldueplessis"
            playerName="Paul Du Plessis"
          />
        </div>
      </div>
    </AppShell>
  );
}
