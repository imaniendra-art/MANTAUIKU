"use client";

import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setIsCollapsed: (val: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
  setIsCollapsed: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsedState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mantauiku_sidebar_collapsed") === "true";
    }
    return false;
  });

  const setIsCollapsed = (val: boolean) => {
    setIsCollapsedState(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("mantauiku_sidebar_collapsed", String(val));
    }
  };

  const toggleSidebar = () => {
    setIsCollapsedState((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("mantauiku_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
