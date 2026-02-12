'use client';

import { Check, Copy, Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/common/components/Button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/common/components/Drawer';
import { trackEvent } from '@/common/services/analytics-api';
import { TastingPlan } from '@/common/types/tasting';

import { OgPreview } from './OgPreview';
import { ShareAsImage } from './ShareAsImage';

interface ShareDrawerProps {
  plan: TastingPlan;
}

export function ShareDrawer({ plan }: ShareDrawerProps) {
  const [copied, setCopied] = useState(false);

  const planUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/tasting/${plan.id}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(planUrl);
    setCopied(true);
    toast.success('Link copied!');
    trackEvent('plan_shared_copy', { planId: plan.id });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: plan.title,
        text: plan.description,
        url: planUrl,
      });
      trackEvent('plan_shared_native', { planId: plan.id });
    } catch {
      // User cancelled — do nothing
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="gap-xs" size="sm" variant="outline">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="px-l pb-l pt-xs">
          <DrawerTitle className="px-0">Share this plan</DrawerTitle>
          <DrawerDescription className="px-0">
            Send your tasting plan to friends
          </DrawerDescription>

          {/* OG Preview */}
          <div className="mt-s mb-m">
            <OgPreview plan={plan} />
          </div>

          {/* Share options */}
          <div className="space-y-1">
            {/* Copy Link */}
            <button
              className="flex items-center gap-s w-full text-left px-s py-xs rounded-xl hover:bg-surface-elevated transition-colors"
              onClick={handleCopy}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {copied ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : (
                  <Copy className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <p className="text-body-m font-medium text-text-primary">
                  {copied ? 'Copied!' : 'Copy Link'}
                </p>
                <p className="text-body-xs text-text-muted">
                  Share via any app
                </p>
              </div>
            </button>

            {/* Native Share (only when available) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                className="flex items-center gap-s w-full text-left px-s py-xs rounded-xl hover:bg-surface-elevated transition-colors"
                onClick={handleNativeShare}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-body-m font-medium text-text-primary">
                    Share
                  </p>
                  <p className="text-body-xs text-text-muted">
                    iMessage, WhatsApp, and more
                  </p>
                </div>
              </button>
            )}

            {/* Save as Image */}
            <ShareAsImage plan={plan} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
