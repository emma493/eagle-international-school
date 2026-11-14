import React from "react";
import { Icon } from "@/components/ui/icons";

export interface StepItem {
  id: string;
  label: string;
  /** Short hint shown under the label on wide screens. */
  hint?: string;
}

export interface StepperProps {
  steps: StepItem[];
  /** Index of the current step, starting at 0. */
  current: number;
  /** When set, finished steps become buttons that jump back. */
  onStepClick?: (index: number) => void;
  className?: string;
}

/**
 * Multi-step progress (student registration). Wide screens show every step with a number or a
 * check; phones show "Step 2 of 5" with the step name and a progress bar. Not colour only: done
 * steps carry a check icon and the current step is announced with aria-current="step".
 */
export function Stepper({ steps, current, onStepClick, className = "" }: StepperProps) {
  const total = steps.length;
  const safe = Math.min(Math.max(current, 0), total - 1);
  const pct = total > 1 ? Math.round((safe / (total - 1)) * 100) : 100;

  return (
    <nav aria-label="Progress" className={className}>
      {/* Phone */}
      <div className="md:hidden">
        <p className="text-meta font-semibold text-text-secondary">
          Step {safe + 1} of {total}
        </p>
        <p className="text-body-lg font-bold text-text-primary">{steps[safe]?.label}</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-secondary" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={safe + 1} aria-label="Registration progress">
          <div className="h-full rounded-full bg-brand-blue transition-all duration-200" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Tablet and desktop */}
      <ol className="hidden md:flex">
        {steps.map((s, i) => {
          const done = i < safe;
          const active = i === safe;
          const clickable = done && Boolean(onStepClick);
          const circle = `flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-meta font-bold ${
            done ? "bg-status-good-bg text-status-good-text" : active ? "bg-brand-blue text-white" : "bg-neutral-secondary text-text-secondary"
          }`;
          const body = (
            <>
              <span className={circle}>{done ? <Icon name="check" size={16} title="Completed" /> : i + 1}</span>
              <span className="min-w-0 text-left">
                <span className={`block truncate text-body font-semibold ${active ? "text-brand-blue" : "text-text-primary"}`}>{s.label}</span>
                {s.hint ? <span className="block truncate text-caption text-text-secondary">{s.hint}</span> : null}
              </span>
            </>
          );
          return (
            <li key={s.id} className="flex min-w-0 flex-1 items-center last:flex-none" aria-current={active ? "step" : undefined}>
              {clickable ? (
                <button type="button" onClick={() => onStepClick?.(i)} className="flex min-h-touch min-w-0 items-center gap-2 rounded-input pr-2 hover:bg-neutral-hover">
                  {body}
                </button>
              ) : (
                <div className="flex min-h-touch min-w-0 items-center gap-2 pr-2">{body}</div>
              )}
              {i < total - 1 ? <span aria-hidden="true" className={`mx-2 h-0.5 min-w-4 flex-1 rounded-full ${done ? "bg-status-good-text" : "bg-divider"}`} /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Stepper;
