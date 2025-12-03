'use client';

import { ProtectedRoute } from '@/components/features/auth/protected-route';
import { useNotificationsStream } from '@/hooks/useNotificationsStream';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Navbar } from './navbar';

export interface AppLayoutProps {
  children: React.ReactNode;
  showProtectedRoute?: boolean;
}

type ActiveTab = 'auctions' | 'profile' | null;

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showProtectedRoute = true,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  useNotificationsStream();

  const getActiveTab = (): ActiveTab => {
    if (pathname === '/profile') {
      return 'profile';
    }
    if (pathname === '/auctions') {
      return 'auctions';
    }
    if (pathname.startsWith('/auctions/') && pathname !== '/auctions') {
      return null;
    }
    return 'auctions';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: 'auctions' | 'profile') => {
    if (tab === 'auctions') {
      router.push('/auctions');
    } else if (tab === 'profile') {
      router.push('/profile');
    }
  };

  const content = (
    <div className="min-h-screen bg-background">
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="h-[calc(100vh-104px)]">{children}</main>
    </div>
  );

  if (showProtectedRoute) {
    return <ProtectedRoute>{content}</ProtectedRoute>;
  }

  return content;
};

export { AppLayout };
