import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { onIdTokenChanged, signOut as fbSignOut, signInWithEmailAndPassword, User } from "firebase/auth";
import { auth, normalizeLoginIdentifier } from "../firebase/config";
import { apiRequest, MAINTENANCE_EVENT, SESSION_EXPIRED_EVENT } from "../lib/api";
import { db } from "../dexie/db";

export type Role = "admin" | "headmaster" | "teacher" | "parent" | null;
const ROLES = ["admin", "headmaster", "teacher", "parent"];

export interface Profile { id: string; full_name: string; school_name: string | null; logo_url: string | null }

interface AuthState {
  user: User | null;
  role: Role;
  profile: Profile | null;
  /** True while the worker says the school is in maintenance mode (never true for admin). */
  maintenance: boolean;
  loading: boolean;
  /** Why the last session was ended by the system (disabled account, expired session…). Shown on the login page. */
  notice: string;
  /** True after the system ended the session because it expired. Cleared on the next sign-in attempt or with dismissExpired. */
  sessionExpired: boolean;
  dismissExpired: () => void;
  /** Time of the last successful check with the worker (used by the maintenance screen). */
  lastChecked: number | null;
  signIn: (emailOrPhone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Force a token refresh and re-read role + maintenance state from the worker. */
  refreshClaims: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function friendlyAuthError(err: any): string {
  switch (err?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "That email/phone and password don't match. Please check and try again.";
    case "auth/user-disabled": return "This account has been disabled. Contact the school office.";
    case "auth/too-many-requests": return "Too many attempts. Wait a few minutes, or ask the school office to reset your password.";
    case "auth/network-request-failed": return "No internet connection. Connect and try again.";
    default: return err?.message || "Could not sign in. Please try again.";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const endingRef = useRef(false);

  const endSession = useCallback(async (message: string, expired = false) => {
    if (endingRef.current) return;
    endingRef.current = true;
    setNotice(message);
    setSessionExpired(expired);
    try { await fbSignOut(auth); } finally { endingRef.current = false; }
  }, []);

  /** Ask the worker who we are. Returns false if the session was ended. */
  const loadMe = useCallback(async (u: User): Promise<boolean> => {
    try {
      const res = await apiRequest("/api/me");
      if (res.ok) {
        const me = await res.json();
        setRole(me.role as Role);
        setProfile({ id: me.id, full_name: me.full_name, school_name: me.school_name, logo_url: me.logo_url });
        setMaintenance(!!me.maintenance);
        setLastChecked(Date.now());
        return true;
      }
      if (res.status === 401) { await endSession("Your session has expired. Please sign in again.", true); return false; }
      const body = await res.json().catch(() => ({}));
      if (res.status === 403) {
        // Browser-only dev: Firebase sign-in succeeded but no local user record exists yet.
        // Create one from the Firebase custom claim so the user can log in (100% browser storage).
        if (body.code === "no_role") {
          try {
            const claim = String((await u.getIdTokenResult()).claims.role ?? "");
            if (ROLES.includes(claim)) {
              await db.users.add({
                id: u.uid,
                role: claim as Role,
                full_name: u.displayName || u.email || "User",
                email: u.email ?? undefined,
                is_active: 1,
                updated_at: Date.now(),
              });
              const retry = await apiRequest("/api/me");
              if (retry.ok) {
                const me = await retry.json();
                setRole(me.role as Role);
                setProfile({
                  id: me.id,
                  full_name: me.full_name,
                  school_name: me.school_name,
                  logo_url: me.logo_url,
                });
                setMaintenance(!!me.maintenance);
                setLastChecked(Date.now());
                return true;
              }
            }
          } catch {
            // fall through to endSession below
          }
        }
        await endSession(body.error || "You don't have access to this system.");
        return false;
      }
      if (res.status === 429) return true; // transient; keep the claim-based role
    } catch {
      // Offline or worker unreachable: keep working from the cached sign-in and the token's role claim.
    }
    return true;
  }, [endSession]);

  useEffect(() => {
    // onIdTokenChanged fires on sign-in, sign-out and every hourly token refresh, so claim changes are picked up.
    const unsub = onIdTokenChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setRole(null); setProfile(null); setMaintenance(false); setLoading(false);
        return;
      }
      try {
        const claim = (await u.getIdTokenResult()).claims.role;
        setRole(ROLES.includes(String(claim)) ? (claim as Role) : null);
      } catch { setRole(null); }
      await loadMe(u);
      setLoading(false);
    });
    return unsub;
  }, [loadMe]);

  useEffect(() => {
    const onExpired = () => endSession("Your session has expired. Please sign in again.", true);
    const onMaint = () => setMaintenance(true);
    const recheck = () => { if (auth.currentUser && navigator.onLine) loadMe(auth.currentUser); };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    window.addEventListener(MAINTENANCE_EVENT, onMaint);
    window.addEventListener("online", recheck);
    const onVisible = () => { if (!document.hidden) recheck(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
      window.removeEventListener(MAINTENANCE_EVENT, onMaint);
      window.removeEventListener("online", recheck);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [endSession, loadMe]);

  // While in maintenance, poll so users get back in without a manual reload.
  useEffect(() => {
    if (!maintenance || !user) return;
    const t = setInterval(() => loadMe(user), 30_000);
    return () => clearInterval(t);
  }, [maintenance, user, loadMe]);

  const signIn = async (emailOrPhone: string, password: string) => {
    setNotice("");
    setSessionExpired(false);
    try {
      await signInWithEmailAndPassword(auth, normalizeLoginIdentifier(emailOrPhone), password);
    } catch (err) {
      throw new Error(friendlyAuthError(err));
    }
    // role, profile and maintenance state are loaded by the onIdTokenChanged listener
  };

  const signOut = async () => {
    await fbSignOut(auth);
    await db.clearCaches().catch(() => {});
    setUser(null); setRole(null); setProfile(null); setMaintenance(false);
  };

  const dismissExpired = () => { setSessionExpired(false); setNotice(""); };

  const refreshClaims = async () => {
    const u = auth.currentUser;
    if (!u) return;
    await u.getIdToken(true);
    await loadMe(u);
  };

  return (
    <Ctx.Provider value={{ user, role, profile, maintenance, loading, notice, sessionExpired, dismissExpired, lastChecked, signIn, signOut, refreshClaims }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
