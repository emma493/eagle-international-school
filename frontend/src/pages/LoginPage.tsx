import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { normalizeLoginIdentifier } from "../firebase/config";
import { useNavigate } from "react-router-dom";

const SCHOOL_NAME = "Eagle International School";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Normalize behind the scenes: Ghanaian phone -> 233...@school.local
      const loginId = normalizeLoginIdentifier(identifier);
      await signIn(loginId, password);
      // RoleRouter handles redirection based on custom claim
    } catch (err: any) {
      setError(
        err?.message || "Invalid email/phone or password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-page min-h-screen flex items-center justify-center px-4 py-12">
      {/* Desktop: brand left, card right */}
      <div className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-8 items-center">
        <div className="lg:w-1/2 hidden lg:flex flex-col items-center justify-center text-center gap-4 px-8">
          <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center text-white text-3xl mb-4">
            FL
          </div>
          <h1 className="text-[60px] font-bold text-brand-blue tracking-tight sentence-case">
            Future Leaders
          </h1>
          <p className="text-[28px] font-normal text-text-secondary max-w-xs leading-snug">
            A place to grow, learn, and lead.
          </p>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <Card padding="lg" className="w-full max-w-md shadow-login">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                FL
              </div>
              <h2 className="text-28 font-bold text-text-primary sentence-case mb-2">
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
              {error && (
                <div className="p-3 bg-status-problem-bg rounded-input border border-status-problem-text/20">
                  <p className="text-status-problem-text text-sm font-500">
                    {error}
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

            <div className="mt-6 pt-4 border-t border-divider">
              <Button
                variant="success"
                fullWidth
                className="text-17 h-48"
              >
                Create account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
