"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { SidebarProvider, useSidebar } from "./SidebarContext";

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50/60 flex text-slate-800">
      <Sidebar />
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? "pl-20" : "pl-72"
        }`}
      >
        <Topbar />
        <main className="flex-1 p-6 md:p-8 bg-gradient-to-b from-slate-50/50 via-sky-50/20 to-slate-50/80">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </SidebarProvider>
  );
}
