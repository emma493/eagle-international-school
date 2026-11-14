import React from "react";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/icons";

/**
 * EmptyState, ErrorState and OfflineState: one centred layout (illustration, title, text, action).
 * Illustrations are inline SVG in palette colours; each pairs with a headline, so meaning is
 * never colour only.
 */

type Art = "empty" | "error" | "offline";

function Illustration({ kind }: { kind: Art }) {
  const badge: IconName = kind === "empty" ? "inbox" : kind === "error" ? "alert-triangle" : "wifi-off";
  const tone =
    kind === "empty" ? "text-brand-blue" : kind === "error" ? "text-status-problem-text" : "text-status-attention-text";
  const wash = kind === "empty" ? "text-brand-blue-tint" : kind === "error" ? "text-status-problem-bg" : "text-status-attention-bg";
  return (
    <div className="relative mx-auto h-24 w-24" aria-hidden="true">
      <svg viewBox="0 0 96 96" className={`absolute inset-0 h-full w-full ${wash}`} fill="currentColor">
        <circle cx="48" cy="48" r="44" />
        <circle cx="16" cy="22" r="4" opacity="0.6" />
        <circle cx="82" cy="70" r="5" opacity="0.6" />
        <circle cx="78" cy="18" r="3" opacity="0.6" />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center ${tone}`}>
        <Icon name={badge} size={40} strokeWidth={1.75} />
      </span>
    </div>
  );
}

interface ViewProps {
  art: Art;
  title: string;
  description?: string;
  /** Action buttons or links under the text. */
  children?: React.ReactNode;
  /** Role for the live region: "alert" for errors, "status" for the rest. */
  role?: "alert" | "status";
  /** Smaller padding for use inside a card or table. */
  compact?: boolean;
  className?: string;
}

function View({ art, title, description, children, role = "status", compact = false, className = "" }: ViewProps) {
  return (
    <div role={role} className={`mx-auto flex max-w-sm flex-col items-center text-center ${compact ? "py-6" : "py-12"} px-4 ${className}`}>
      <Illustration kind={art} />
      <h2 className="mt-4 text-title font-bold text-text-primary">{title}</h2>
      {description ? <p className="mt-1 text-body text-text-secondary">{description}</p> : null}
      {children ? <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{children}</div> : null}
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Primary action, for example "Add student". */
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: IconName;
  compact?: boolean;
  className?: string;
}

export function EmptyState({ title, description, actionLabel, onAction, actionIcon = "plus", compact, className }: EmptyStateProps) {
  return (
    <View art="empty" title={title} description={description} compact={compact} className={className}>
      {actionLabel && onAction ? (
        <Button onClick={onAction} leadingIcon={actionIcon}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  compact?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this. Try again in a moment.",
  onRetry,
  retrying = false,
  compact,
  className,
}: ErrorStateProps) {
  return (
    <View art="error" role="alert" title={title} description={description} compact={compact} className={className}>
      {onRetry ? (
        <Button variant="secondary" leadingIcon="refresh" onClick={onRetry} loading={retrying}>
          Try again
        </Button>
      ) : null}
    </View>
  );
}

export interface OfflineStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}

/** For screens that need the network and have nothing saved on this device. */
export function OfflineState({
  title = "You are offline",
  description = "This needs a connection and is not saved on this device yet. It will load when you are back online.",
  onRetry,
  compact,
  className,
}: OfflineStateProps) {
  return (
    <View art="offline" title={title} description={description} compact={compact} className={className}>
      {onRetry ? (
        <Button variant="secondary" leadingIcon="refresh" onClick={onRetry}>
          Check again
        </Button>
      ) : null}
    </View>
  );
}

/** Slim inline banner for cached screens: data is shown, but may be old. */
export function OfflineBanner({ pending = 0, className = "" }: { pending?: number; className?: string }) {
  return (
    <div role="status" className={`flex items-center gap-2 rounded-card bg-status-attention-bg px-4 py-3 text-body font-semibold text-status-attention-text ${className}`}>
      <Icon name="wifi-off" size={20} />
      <span>Offline, showing saved data{pending > 0 ? `. ${pending} change${pending === 1 ? "" : "s"} waiting to sync.` : "."}</span>
    </div>
  );
}

export default EmptyState;
