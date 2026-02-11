'use client';

import { Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/common/components/Button';
import { Input } from '@/common/components/Input';
import { trackEvent } from '@/common/services/analytics-api';

interface EmailShareFormProps {
  planId: string;
}

export function EmailShareForm({ planId }: EmailShareFormProps) {
  const [email, setEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/share/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          recipientEmail: email,
          senderName: senderName || undefined,
        }),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send');
      }

      setSent(true);
      toast.success('Email sent!');
      trackEvent('plan_shared_email', { planId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-xs">
        <p className="text-body-s text-success font-medium">
          Sent to {email}
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-xs" onSubmit={handleSubmit}>
      <Input
        required
        id="share-email"
        placeholder="friend@example.com"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        id="share-name"
        placeholder="Your name (optional)"
        type="text"
        value={senderName}
        onChange={(e) => setSenderName(e.target.value)}
      />
      <Button
        className="w-full gap-xs"
        disabled={!email || sending}
        size="sm"
        type="submit"
        variant="primary"
      >
        {sending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {sending ? 'Sending...' : 'Send'}
      </Button>
    </form>
  );
}
