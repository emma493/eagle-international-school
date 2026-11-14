import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { StatusScreen } from "@/components/shared/StatusScreen";

const HOME: Record<string, string> = { admin: "/admin", headmaster: "/headmaster", teacher: "/teacher", parent: "/parent" };
const PORTALS = ["admin", "headmaster", "teacher", "parent"];

/** 404: the address does not exist. */
export function NotFoundPage({ fullScreen = false }: { fullScreen?: boolean }) {
  const { role } = useAuth();
  const nav = useNavigate();
  return (
    <StatusScreen
      fullScreen={fullScreen}
      code="404"
      icon="search"
      title="Page not found"
      description="We could not find that page. It may have moved, or the address may be wrong."
      actions={
        <>
          <Button fullWidth onClick={() => nav(HOME[role || ""] || "/login", { replace: true })}>
            Go to your home page
          </Button>
          <Button variant="secondary" fullWidth onClick={() => nav(-1)}>
            Go back
          </Button>
        </>
      }
    />
  );
}

/** 403: the address belongs to another portal. */
export function ForbiddenPage({ fullScreen = false }: { fullScreen?: boolean }) {
  const { role } = useAuth();
  const nav = useNavigate();
  return (
    <StatusScreen
      fullScreen={fullScreen}
      code="403"
      tone="attention"
      icon="lock"
      title="You do not have access"
      description="This page is for a different kind of account. If you think this is a mistake, contact the school office."
      actions={
        <Button fullWidth onClick={() => nav(HOME[role || ""] || "/login", { replace: true })}>
          Go to your home page
        </Button>
      }
    />
  );
}

/** Catch-all route: another portal's path is 403, anything else is 404. */
export function NotFoundOrForbidden() {
  const { role } = useAuth();
  const { pathname } = useLocation();
  const first = pathname.split("/")[1] ?? "";
  return PORTALS.includes(first) && first !== role ? <ForbiddenPage /> : <NotFoundPage />;
}

/** Shown on the login route after the system ended the session (token expired or rejected). */
export function SessionExpiredScreen() {
  const { dismissExpired } = useAuth();
  return (
    <StatusScreen
      tone="attention"
      icon="clock"
      title="Your session has ended"
      description="For your safety you were signed out. Work saved on this device is kept. Log in again to carry on."
      actions={
        <Button fullWidth onClick={dismissExpired}>
          Log in again
        </Button>
      }
    />
  );
}
