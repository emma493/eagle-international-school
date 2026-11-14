import React from "react";
import { BrandMark } from "@/components/ui/BrandMark";
import { Spinner } from "@/components/ui/Spinner";

/** Shown while the sign-in session is being restored, so signed-in users never see a flash of the login page. */
export function SplashScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-neutral-page px-4 text-center">
      <BrandMark size={72} />
      <p className="text-title font-bold text-brand-blue">Eagle International School</p>
      <Spinner size={24} label="Loading your account" className="text-text-secondary" />
    </div>
  );
}

export default SplashScreen;
