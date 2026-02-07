'use client';

import { Check, Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/common/components/Button';

interface SharePlanProps {
  planId: string;
}

export function SharePlan({ planId }: SharePlanProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/tasting/${planId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Decantd Tasting Plan',
          url,
        });
      } catch {
        // User cancelled or share failed, fallback to copy
        await copyToClipboard(url);
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      className="gap-xs"
      size="sm"
      variant="outline"
      onClick={handleShare}
    >
      {copied ? (
        <Check className="w-4 h-4" />
      ) : (
        <Share2 className="w-4 h-4" />
      )}
      {copied ? 'Copied!' : 'Share'}
    </Button>
  );
}
