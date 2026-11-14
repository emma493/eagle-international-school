import React from "react";
import { BrandMark } from "@/components/ui/BrandMark";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/icons";

export interface StatusScreenProps {
  icon: IconName;
  /** Colour of the round icon badge. */
  tone?: "info" | "attention" | "problem" | "good";
  title: string;
  description?: string;
  /** Extra content between the text and the buttons (for example the auto-recheck indicator). */
  children?: React.ReactNode;
  /** Buttons. */
  actions?: React.ReactNode;
  /** Header text with an error code, for example "404". Spoken before the title. */
  code?: string;
  /** Fill the screen (for full-page states) or sit inside the app shell. */
  fullScreen?: boolean;
}

const TONE = {
  info: "bg-status-info-bg text-status-info-text",
  attention: "bg-status-attention-bg text-status-attention-text",
  problem: "bg-status-problem-bg text-status-problem-text",
  good: "bg-status-good-bg text-status-good-text",
} as const;

/** One centred card used by the maintenance, 404, 403 and session-expired screens. */
export function StatusScreen({ icon, tone = "info", title, description, children, actions, code, fullScreen = true }: StatusScreenProps) {
  return (
    <div className={`flex items-center justify-center bg-neutral-page px-4 py-8 pb-safe ${fullScreen ? "min-h-dvh" : "min-h-[60vh]"}`}>
      <Card padding="lg" className="w-full max-w-md text-center sm:shadow-login">
        <BrandMark size={40} className="mx-auto mb-4" title="" />
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${TONE[tone]}`}>
          <Icon name={icon} size={24} />
        </div>
        <h1 className="mb-2 text-display font-bold text-text-primary">
          {code ? <span className="sr-only">{`Error ${code}. `}</span> : null}
          {title}
        </h1>
        {description ? <p className="mb-6 text-body text-text-secondary">{description}</p> : null}
        {children}
        {actions ? <div className="mt-6 space-y-3">{actions}</div> : null}
      </Card>
    </div>
  );
}

export default StatusScreen;
