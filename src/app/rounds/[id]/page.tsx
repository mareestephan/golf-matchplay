import { HISTORICAL_ROUNDS_2025_2026, HISTORICAL_ROUNDS_2026 } from '@/data/seedData';
import AppShell from '@/components/layout/AppShell';
import RoundDetailPage from '@/components/pages/RoundDetailPage';

interface RoundPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  const allRounds = [...HISTORICAL_ROUNDS_2025_2026, ...HISTORICAL_ROUNDS_2026];
  return allRounds.map((round) => ({
    id: round.id,
  }));
}

export default async function RoundPage({ params }: RoundPageProps) {
  const { id } = await params;

  return (
    <AppShell>
      <RoundDetailPage roundId={id} />
    </AppShell>
  );
}
