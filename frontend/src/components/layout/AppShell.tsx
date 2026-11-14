import React, { Suspense, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { MQ_MD, useMediaQuery } from "@/hooks/useMediaQuery";
import OfflineCatchUpToast from "@/components/sync/OfflineCatchUpToast";
import PWAInstallPrompt from "@/components/sync/PWAInstallPrompt";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import MobileDrawer from "./MobileDrawer";
import BottomTabBar from "./BottomTabBar";
import PageSkeleton from "./PageSkeleton";
import { TAB_BAR_ROLES } from "./nav";

const SCHOOL = "Eagle International School";

/**
 * Signed-in layout for every role.
 *  phones (<768px): top bar, drawer, bottom tab bar for teacher and parent
 *  tablet (768px+):  top bar + 72px icon rail
 *  desktop (1024px+): top bar + 280px sidebar
 * On navigation the page heading takes focus (and the tab title follows it); the first load does not steal focus.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  const { pathname } = useLocation();
  const isMd = useMediaQuery(MQ_MD);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  const hasTabBar = !!role && TAB_BAR_ROLES.includes(role);

  useEffect(() => {
    if (isMd) setDrawerOpen(false);
  }, [isMd]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const h1 = main.querySelector("h1");
    document.title = h1?.textContent ? `${h1.textContent} | ${SCHOOL}` : SCHOOL;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    if (h1) {
      h1.tabIndex = -1;
      h1.focus({ preventScroll: true });
    } else {
      main.focus({ preventScroll: true });
    }
  }, [pathname]);

  const skipToContent = (e: React.MouseEvent) => {
    e.preventDefault();
    mainRef.current?.focus();
    mainRef.current?.scrollIntoView();
  };

  return (
    <div className="min-h-screen bg-neutral-page">
      <a
        href="#main-content"
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-card focus:bg-brand-blue focus:px-4 focus:py-3 focus:font-bold focus:text-white"
      >
        Skip to main content
      </a>

      <TopBar onMenuClick={() => setDrawerOpen(true)} />
      <Sidebar role={role || ""} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} role={role || ""} />

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className={`min-h-screen pt-topbar focus:outline-none md:ml-rail lg:ml-sidebar ${hasTabBar ? "pb-tabbar-safe md:pb-0" : ""}`}
      >
        <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
      </main>

      {hasTabBar && <BottomTabBar role={role || ""} />}

      {/* Floating cards (offline catch-up, install prompt) sit above the tab bar and never push the page. */}
      <div
        className={`pointer-events-none fixed inset-x-0 z-30 flex flex-col items-center gap-2 p-4 md:bottom-0 ${hasTabBar ? "bottom-tabbar-safe" : "bottom-0"}`}
      >
        <div className="pointer-events-auto relative w-full max-w-md empty:hidden"><OfflineCatchUpToast /></div>
        <div className="pointer-events-auto relative w-full max-w-md empty:hidden"><PWAInstallPrompt /></div>
      </div>
    </div>
  );
}
