'use client';

import { format } from 'date-fns';
import { Calendar, KeyRound, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { Button } from '@/common/components/Button';
import { Card } from '@/common/components/Card';
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
      <DrawerPrimitive.Root
        direction="right"
        open={open}
        onOpenChange={onOpenChange}
      >
        <DrawerPrimitive.Portal>
          <DrawerPrimitive.Overlay className="fixed inset-0 z-drawer-overlay bg-black/40 backdrop-blur-sm" />
          <DrawerPrimitive.Content
            className={cn(
              'fixed inset-y-0 right-0 z-drawer',
              'w-[85vw] max-w-sm',
              'flex flex-col bg-surface-elevated rounded-l-2xl',
            )}
          >
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="px-m pt-m pb-s">
                <DrawerPrimitive.Title className="font-display text-heading-s text-primary">
                  Profile
                </DrawerPrimitive.Title>
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
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-heading-s text-primary truncate">
                        {user.displayName}
                      </h2>
                      <p className="text-body-s text-text-secondary truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-text-muted">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-body-xs">
                          Joined{' '}
                          {format(new Date(user.createdAt), 'MMM yyyy')}
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
                {user.authProvider !== 'google' && (
                  <Button
                    className="w-full"
                    size="md"
                    variant="ghost"
                    onClick={() => setChangePasswordOpen(true)}
                  >
                    <KeyRound className="h-4 w-4 mr-xs" />
                    Change Password
                  </Button>
                )}
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
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Portal>
      </DrawerPrimitive.Root>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </>
  );
}
