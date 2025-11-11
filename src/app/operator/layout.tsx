/**
 * Operator Layout
 * Full-featured dashboard with sidebar, dark mode, and expandable menu
 * For operators managing inventory at their hub
 */

'use client';

import { ReactNode } from 'react';
import { SidebarProvider } from '@/context/SidebarContext';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';
import Backdrop from '@/layout/Backdrop';
import { useSidebar } from '@/context/SidebarContext';

function OperatorLayoutContent({ children }: { children: ReactNode }) {
  const { isExpanded, isHovered } = useSidebar();
  
  // Calculate sidebar width for desktop
  const sidebarWidth = isExpanded || isHovered ? '290px' : '90px';

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AppSidebar userRole="OPERATOR" />

        {/* Content Area - with proper margin for sidebar */}
        <div 
          className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300"
          style={{ marginLeft: 0 }}
        >
          {/* Header */}
          <AppHeader userRole="OPERATOR" userName="Operator User" />

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

export default function OperatorLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <OperatorLayoutContent>{children}</OperatorLayoutContent>
    </SidebarProvider>
  );
}
