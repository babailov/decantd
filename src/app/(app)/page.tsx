'use client';

import { useAuthStore } from '@/common/stores/useAuthStore';

import { HomeView } from '@/modules/Home';
import { LandingHero } from '@/modules/Landing/LandingHero';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (isAuthenticated()) {
    return <HomeView />;
  }

  return <LandingHero />;
}
