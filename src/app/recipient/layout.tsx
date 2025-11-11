/**
 * Recipient Layout
 * Full-featured dashboard with sidebar and dark mode
 * For recipients tracking their parcels
 */

'use client';

import { ReactNode } from 'react';
import { SidebarProvider } from '@/context/SidebarContext';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';
import Backdrop from '@/layout/Backdrop';
import { useSidebar } from '@/context/SidebarContext';

function RecipientLayoutContent({ children }: { children: ReactNode }) {
  const { isExpanded, isHovered } = useSidebar();
  
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AppSidebar userRole="RECIPIENT" />

        {/* Content Area - with proper margin for sidebar */}
        <div 
          className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300"
          style={{ marginLeft: 0 }}
        >
          {/* Header */}
          <AppHeader userRole="RECIPIENT" userName="Recipient User" />

          {/* Main Content */}
          <main className="flex-1">
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Backdrop for mobile */}
      <Backdrop />
    </>
  );
}

export default function RecipientLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <RecipientLayoutContent>{children}</RecipientLayoutContent>
    </SidebarProvider>
  );
}
