'use client';

import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { useTastingGenerationToastStore } from '@/common/stores/useTastingGenerationToastStore';

const TASTING_GENERATION_TOAST_ID = 'tasting-generation-toast';

export function TastingGenerationToastController() {
  const router = useRouter();
  const pathname = usePathname();

  const status = useTastingGenerationToastStore((s) => s.status);
  const sourcePath = useTastingGenerationToastStore((s) => s.sourcePath);
  const planId = useTastingGenerationToastStore((s) => s.planId);
  const errorMessage = useTastingGenerationToastStore((s) => s.errorMessage);
  const clearGeneration = useTastingGenerationToastStore((s) => s.clearGeneration);

  useEffect(() => {
    if (status === 'idle') {
      toast.dismiss(TASTING_GENERATION_TOAST_ID);
      return;
    }

    if (status === 'loading') {
      const showReturnAction = Boolean(sourcePath && pathname !== sourcePath);

      toast('Generating your tasting plan...', {
        id: TASTING_GENERATION_TOAST_ID,
        duration: Infinity,
        className: 'tasting-generation-toast',
        icon: (
          <Loader2
            aria-hidden
            className="h-4 w-4 animate-spin text-primary"
          />
        ),
        action: showReturnAction && sourcePath
          ? {
              label: 'Return to generator',
              onClick: () => router.push(sourcePath),
            }
          : undefined,
      });
      return;
    }

    if (status === 'success' && planId) {
      toast.success('Your tasting plan is ready.', {
        id: TASTING_GENERATION_TOAST_ID,
        duration: 8000,
        className: 'tasting-generation-toast',
        action: {
          label: 'Open tasting',
          onClick: () => {
            router.push(`/tasting/${planId}`);
            clearGeneration();
          },
        },
        onDismiss: () => clearGeneration(),
        onAutoClose: () => clearGeneration(),
      });
      return;
    }

    if (status === 'error') {
      toast.error(errorMessage || 'Failed to generate tasting plan.', {
        id: TASTING_GENERATION_TOAST_ID,
        onDismiss: () => clearGeneration(),
        onAutoClose: () => clearGeneration(),
      });
    }
  }, [status, sourcePath, pathname, planId, errorMessage, router, clearGeneration]);

  return null;
}
