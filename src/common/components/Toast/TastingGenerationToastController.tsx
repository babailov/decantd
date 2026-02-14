'use client';

import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { copy } from '@/common/content';
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
    const isGeneratingPage = pathname === '/tasting/generating';

    if (status === 'idle') {
      toast.dismiss(TASTING_GENERATION_TOAST_ID);
      return;
    }

    if (status === 'loading') {
      if (isGeneratingPage) {
        toast.dismiss(TASTING_GENERATION_TOAST_ID);
        return;
      }

      const showReturnAction = Boolean(sourcePath && pathname !== sourcePath);

      toast(copy.toasts.generationLoading, {
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
              label: copy.toasts.generationReturnAction,
              onClick: () => router.push(sourcePath),
            }
          : undefined,
      });
      return;
    }

    if (status === 'success' && planId) {
      toast(copy.toasts.generationReady, {
        id: TASTING_GENERATION_TOAST_ID,
        duration: 8000,
        className: 'tasting-generation-toast',
        icon: null,
        action: {
          label: copy.toasts.generationOpenAction,
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
      toast.error(errorMessage || copy.toasts.generationErrorFallback, {
        id: TASTING_GENERATION_TOAST_ID,
        onDismiss: () => clearGeneration(),
        onAutoClose: () => clearGeneration(),
      });
    }
  }, [status, sourcePath, pathname, planId, errorMessage, router, clearGeneration]);

  return null;
}
