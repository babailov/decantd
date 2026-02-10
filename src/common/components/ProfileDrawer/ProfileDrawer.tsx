'use client';

import { format } from 'date-fns';
import { Calendar, KeyRound, LogOut, Wine } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/common/components/Button';
import { Card } from '@/common/components/Card';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from '@/common/components/Drawer';
import { cn } from '@/common/functions/cn';
import { logout } from '@/common/services/auth-api';
import { useAuthStore } from '@/common/stores/useAuthStore';

import { PalateProfileCard } from '@/modules/PalateProfile';
import { ChangePasswordDialog } from '@/modules/Profile/ChangePasswordDialog';

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Always clear auth even if the API call fails
    }
    clearAuth();
    onOpenChange(false);
    router.push('/');
  };

  if (!user) return null;

  return (
    <>
      <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          hideHandle
          className="fixed inset-y-0 right-0 inset-x-auto bottom-auto mt-0 w-[85vw] max-w-sm rounded-t-none rounded-l-2xl"
        >
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="px-m pt-m pb-s">
              <DrawerTitle>Profile</DrawerTitle>
            </div>

            {/* User info card */}
            <div className="px-m pb-s">
              <Card variant="elevated">
                <div className="flex items-center gap-s">
                  <div
                    className={cn(
                      'w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center',
                      'text-primary font-display text-heading-m',
                    )}
                  >
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-heading-s text-primary">
                      {user.displayName}
                    </h2>
                    <p className="text-body-s text-text-secondary">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-text-muted">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-body-xs">
                        Joined {format(new Date(user.createdAt), 'MMM yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Palate Profile */}
            <div className="px-m pb-s">
              <h3 className="font-display text-heading-xs text-primary mb-s">
                My Palate
              </h3>
              <PalateProfileCard />
            </div>

            {/* Actions */}
            <div className="px-m pb-m flex flex-col gap-xs mt-auto">
              <DrawerClose asChild>
                <Link href="/tasting/new">
                  <Button className="w-full" size="lg" variant="primary">
                    <Wine className="h-5 w-5 mr-xs" />
                    Create New Plan
                  </Button>
                </Link>
              </DrawerClose>
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
          </div>
        </DrawerContent>
      </Drawer>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </>
  );
}
