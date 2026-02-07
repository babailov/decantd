import { Wine } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-s text-center">
      <Wine className="h-12 w-12 text-text-muted mb-s" />
      <h1 className="font-display text-heading-m text-primary mb-xs">
        Dashboard
      </h1>
      <p className="text-body-m text-text-secondary">
        Coming in Phase 2 — track your tastings, earn XP, and level up.
      </p>
    </div>
  );
}
