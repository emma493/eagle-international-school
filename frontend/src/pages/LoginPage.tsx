import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

import { BrandMark } from "@/components/ui/BrandMark";
const SCHOOL_NAME = "Eagle International School";

export default function LoginPage() {
  const { signIn, notice } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Phone numbers are normalised behind the scenes (024XXXXXXX -> 23324XXXXXXX@school.local).
      // App.tsx routes to the portal for the user's role once the worker confirms it.
      await signIn(identifier, password);
    } catch (err: any) {
      setError(err?.message || "Could not sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-page min-h-screen flex items-center justify-center px-4 py-12">
      {/* Desktop: brand left, card right */}
      <div className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-8 items-center">
        <div className="lg:w-1/2 hidden lg:flex flex-col items-center justify-center text-center gap-4 px-8">
          <BrandMark size={96} />
          <h1 className="text-hero font-bold text-brand-blue tracking-tight sentence-case">
            {SCHOOL_NAME}
          </h1>
          <p className="text-display font-normal text-text-secondary max-w-xs leading-snug">
            A place to grow, learn, and lead.
          </p>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <Card padding="lg" className="w-full max-w-md shadow-login">
            <div className="text-center mb-8">
              <BrandMark size={56} className="mx-auto mb-4 lg:hidden" />
              <h2 className="text-display font-bold text-text-primary sentence-case mb-2">
                Welcome back
              </h2>
              <p className="text-text-secondary text-sm">
                Sign in to your {SCHOOL_NAME} account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email or phone number"
                placeholder="e.g. 024XXXXXXX or name@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                autoFocus
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {(error || notice) && (
                <div role="alert" className="p-3 bg-status-problem-bg rounded-input border border-status-problem-text/20">
                  <p className="text-status-problem-text text-sm font-medium">
                    {error || notice}
                  </p>
                </div>
              )}
              <Button
                variant="primary"
                fullWidth
                disabled={submitting}
                type="submit"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 pt-4 border-t border-divider text-center text-sm text-text-secondary">
              Accounts are created by the school office. Forgot your password? Ask the office to reset it.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
