import React from "react";

/** Centres page content at 1200px max. 16px gutters on phones, 24px from 768px. "narrow" (576px) suits teacher and parent phone screens. */
export function PageContainer({
  children,
  size = "default",
  className = "",
}: {
  children: React.ReactNode;
  size?: "default" | "narrow";
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full px-4 py-4 md:px-6 md:py-6 ${size === "narrow" ? "max-w-xl" : "max-w-page"} ${className}`}>
      {children}
    </div>
  );
}

export default PageContainer;
