import type { PropsWithChildren } from 'react';

import { BottomNav, Header } from '@/common/components/AppShell';

const AppLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      <main className="pt-[var(--header-height)] pb-[var(--bottom-nav-height)] min-h-screen">
        {children}
      </main>
      <BottomNav />
    </>
  );
};

export default AppLayout;
