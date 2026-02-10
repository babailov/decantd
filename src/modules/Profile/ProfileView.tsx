'use client';

import { format } from 'date-fns';
import { Calendar, KeyRound, LogOut, Wine } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/common/components/Button';
import { Card } from '@/common/components/Card';
import { cn } from '@/common/functions/cn';
import { logout } from '@/common/services/auth-api';
import { useAuthStore } from '@/common/stores/useAuthStore';

import { PalateProfileCard } from '@/modules/PalateProfile';

import { ChangePasswordDialog } from './ChangePasswordDialog';

export function ProfileView() {
  const { user, isAuthenticated, clearAuth, isLoading } = useAuthStore();
  const router = useRouter();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    clearAuth();
    toast.success('Signed out');
    router.push('/');
  };

  return (
    <div className="px-s py-m max-w-lg mx-auto">
      {/* Profile header */}
      <Card className="mb-m" variant="elevated">
        <div className="flex items-center gap-s">
          <div className={cn(
            'w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center',
            'text-primary font-display text-heading-m',
          )}>
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-heading-s text-primary">
              {user.displayName}
            </h1>
            <p className="text-body-s text-text-secondary">{user.email}</p>
            <div className="flex items-center gap-1 mt-1 text-text-muted">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-body-xs">
                Joined {format(new Date(user.createdAt), 'MMM yyyy')}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Palate Profile */}
      <div className="mb-m">
        <h2 className="font-display text-heading-xs text-primary mb-s">
          My Palate
        </h2>
        <PalateProfileCard />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-xs">
        <Link href="/tasting/new">
          <Button className="w-full" size="lg" variant="primary">
            <Wine className="h-5 w-5 mr-xs" />
            Create New Plan
          </Button>
        </Link>
        <Button
          className="w-full"
          size="md"
          variant="ghost"
          onClick={() => setChangePasswordOpen(true)}
        >
          <KeyRound className="h-4 w-4 mr-xs" />
          Change Password
        </Button>
        <Button
          className="w-full"
          size="md"
          variant="ghost"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-xs" />
          Sign Out
        </Button>
      </div>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </div>
  );
}
