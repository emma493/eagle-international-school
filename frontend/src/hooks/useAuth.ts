import { useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signOut,
  User,
  IdTokenResult,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { apiRequest } from "../lib/api";

export type Role = "admin" | "headmaster" | "teacher" | "parent" | null;

interface UseAuthReturn {
  user: User | null;
  role: Role;
  loading: boolean;
  signIn: (emailOrPhone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshClaims: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async (u: User) => {
    try {
      const tokenResult = (await u.getIdToken(true)) as IdTokenResult & {
        role?: string;
      };
      setRole((tokenResult.claims?.role || null) as Role);
    } catch (err) {
      console.error("Failed to refresh claims", err);
      setRole(null);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchRole(u);
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [fetchRole]);

  const signIn = async (emailOrPhone: string, password: string) => {
    const { normalizeLoginIdentifier } = await import("../firebase/config");
    const loginId = normalizeLoginIdentifier(emailOrPhone);

    // Attempt via Firebase Auth
    try {
      await signInWithEmailAndPassword(auth, loginId, password);
    } catch (err: any) {
      // Fallback: try direct email if phone-normalized failed
      if (loginId.includes("@school.local") && !emailOrPhone.includes("@")) {
        try {
          await signInWithEmailAndPassword(auth, emailOrPhone, password);
        } catch (innerErr) {
          throw innerErr;
        }
      } else {
        throw err;
      }
    }

    const u = auth.currentUser;
    if (u) {
      await fetchRole(u);
    }

    // Notify worker of login for live signal registration
    try {
      await apiRequest("/auth/session", {
        method: "POST",
        body: JSON.stringify({ uid: u?.uid, role }),
      });
    } catch {
      // Non-fatal: worker may not be reachable yet
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  const refreshClaims = async () => {
    const u = auth.currentUser;
    if (u) await fetchRole(u);
  };

  return {
    user,
    role,
    loading,
    signIn,
    signOut: handleSignOut,
    refreshClaims,
  };
}
