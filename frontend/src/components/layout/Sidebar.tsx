import React from "react";
import { NavList } from "./NavList";

/**
 * Desktop navigation. 280px sidebar from 1024px, 72px icon rail from 768px.
 * Hidden on phones, where MobileDrawer (and the tab bar) take over.
 */
export default function Sidebar({ role }: { role: string }) {
  return (
    <aside className="fixed bottom-0 left-0 top-topbar z-20 hidden w-rail overflow-y-auto border-r border-divider bg-card md:block lg:w-sidebar">
      <nav aria-label="Main navigation" className="p-3">
        <NavList role={role} responsive />
      </nav>
    </aside>
  );
}
