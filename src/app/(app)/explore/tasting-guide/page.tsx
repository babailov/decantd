import { Suspense } from 'react';

import { GuidedTasting } from '@/modules/Explore/GuidedTasting/GuidedTasting';

export default function TastingGuidePage() {
  return (
    <Suspense>
      <GuidedTasting />
    </Suspense>
  );
}
