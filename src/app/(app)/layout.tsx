import type { PropsWithChildren } from 'react';

import { BottomNav, Header, SideNav } from '@/common/components/AppShell';

const AppLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      <main className="vineyard-bg pt-[var(--header-height)] pb-[var(--bottom-nav-height)] md:pb-0 md:pl-[var(--side-nav-width)] min-h-screen">
        {children}
      </main>
      <BottomNav />
      <SideNav />
    </>
  );
};

export default AppLayout;
