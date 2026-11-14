import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Alert, type AlertTone } from "@/components/ui/Alert";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/icons";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";

const SCHOOL_NAME = "Eagle International School";
const MOTTO = "A place to grow, learn, and lead.";

interface LoginProblem {
  tone: AlertTone;
  title: string;
  message: string;
}

/** Turns an error message from the sign-in flow into a titled inline message. */
function describeProblem(message: string, offline: boolean): LoginProblem {
  const m = message.toLowerCase();
  if (offline || m.includes("no internet") || m.includes("network")) {
    return { tone: "warning", title: "You are offline", message: "Connect to the internet to sign in. Your saved work stays on this device." };
  }
  if (m.includes("disabled")) {
    return { tone: "error", title: "Account disabled", message: "This account has been disabled. Contact the school office." };
  }
  if (m.includes("too many")) {
    return { tone: "warning", title: "Too many attempts", message: "Wait a few minutes, then try again, or ask the school office to reset your password." };
  }
  if (m.includes("don't match") || m.includes("password")) {
    return { tone: "error", title: "Wrong email, phone or password", message: "Check what you typed and try again." };
  }
  return { tone: "error", title: "Could not sign in", message: message || "Please try again." };
}

export default function LoginPage() {
  const { signIn, notice } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [problem, setProblem] = useState<LoginProblem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const idMissing = touched && !identifier.trim();
  const pwMissing = touched && !password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setProblem(null);
    if (!identifier.trim() || !password) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setProblem(describeProblem("", true));
      return;
    }
    setSubmitting(true);
    try {
      // Phone numbers are normalised behind the scenes (024XXXXXXX -> 23324XXXXXXX@school.local).
      // App.tsx routes to the portal for the user's role once the session is confirmed.
      await signIn(identifier, password);
    } catch (err: any) {
      setProblem(describeProblem(err?.message || "", false));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-neutral-page px-4 pb-safe pt-8 sm:py-12 lg:flex lg:items-center">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 lg:flex-row lg:gap-8">
        {/* Brand column: full size on desktop, compact header on phones */}
        <div className="flex flex-col items-center gap-2 text-center lg:w-1/2 lg:gap-4 lg:px-8">
          <BrandMark size={56} className="lg:hidden" />
          <BrandMark size={96} className="hidden lg:block" />
          <p className="text-title font-bold text-brand-blue lg:hidden">{SCHOOL_NAME}</p>
          <h1 className="hidden text-hero font-bold tracking-tight text-brand-blue lg:block">{SCHOOL_NAME}</h1>
          <p className="hidden max-w-xs text-display font-normal text-text-secondary lg:block">{MOTTO}</p>
        </div>

        <div className="flex w-full justify-center lg:w-1/2">
          <Card padding="lg" className="w-full max-w-md px-4 py-6 sm:p-8 sm:shadow-login">
            <div className="mb-6 text-center">
              <h2 className="mb-1 text-display font-bold text-text-primary">Welcome back</h2>
              <p className="text-body text-text-secondary">Log in to your {SCHOOL_NAME} account</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <Input
                label="Email or phone number"
                placeholder="024XXXXXXX or name@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="email"
                error={idMissing ? "Enter your email or phone number." : undefined}
                helper="If your account has both, log in with your email."
              />
              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                enterKeyHint="go"
                error={pwMissing ? "Enter your password." : undefined}
              />

              {problem ? (
                <Alert tone={problem.tone} title={problem.title} className="mb-4">
                  {problem.message}
                </Alert>
              ) : notice ? (
                <Alert tone="info" className="mb-4">
                  {notice}
                </Alert>
              ) : null}

              <Button type="submit" fullWidth loading={submitting}>
                {submitting ? "Logging in" : "Log in"}
              </Button>
            </form>

            <div className="mt-6 border-t border-divider pt-4 text-center">
              <button
                type="button"
                className="inline-flex min-h-touch items-center gap-1 rounded-input px-2 text-body font-semibold text-brand-blue hover:bg-brand-blue-tint"
                aria-expanded={helpOpen}
                aria-controls="forgot-help"
                onClick={() => setHelpOpen((o) => !o)}
              >
                Forgot password?
                <Icon name={helpOpen ? "chevron-up" : "chevron-down"} size={16} />
              </button>
              {helpOpen ? (
                <div id="forgot-help" className="mt-2 text-left">
                  <Alert tone="info" title="Ask the school to reset it">
                    Passwords are reset by the school. Parents and teachers: contact the headmaster or the school office. Headmasters: contact the system administrator.
                  </Alert>
                </div>
              ) : null}
              <p className="mt-2 text-meta text-text-secondary">Accounts are created by the school office.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
