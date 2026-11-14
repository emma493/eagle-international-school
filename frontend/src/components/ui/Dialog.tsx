import React, { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/icons";
import { useFocusTrap } from "@/hooks/useFocusTrap";

/** Props shared by Modal and BottomSheet. */
export interface DialogBaseProps {
  open: boolean;
  onClose: () => void;
  /** Dialog heading. Always required: it is the dialog's accessible name. */
  title: string;
  description?: string;
  children?: React.ReactNode;
  /** Action row pinned under the content (buttons). */
  footer?: React.ReactNode;
  /** When false the scrim click, Escape and the close button are ignored (use for a step that must finish). */
  dismissible?: boolean;
}

export type DialogMode = "sheet" | "center";

const DRAG_CLOSE_PX = 96;

/**
 * Shared dialog shell: portal, scrim, focus trap, Escape, scroll lock, return of focus.
 * "sheet" is a bottom sheet with a drag handle and 16px top corners; "center" is a centred card.
 */
export function DialogShell({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  dismissible = true,
  mode,
  size = "md",
}: DialogBaseProps & { mode: DialogMode; size?: "sm" | "md" | "lg" }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const [dragY, setDragY] = useState(0);
  const dragStart = useRef<number | null>(null);
  const close = dismissible ? onClose : undefined;
  useFocusTrap(panelRef, open, close);
  if (!open || typeof document === "undefined") return null;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!dismissible) return;
    dragStart.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    setDragY(Math.max(0, e.clientY - dragStart.current));
  };
  const onPointerUp = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    if (dragY > DRAG_CLOSE_PX) onClose();
    setDragY(0);
  };

  const sheet = mode === "sheet";
  const width = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-modal-lg" : "max-w-modal";
  const panelClass = sheet
    ? "w-full max-h-full rounded-t-sheet animate-slide-up pb-safe"
    : `w-full ${width} max-h-full rounded-card animate-pop-in`;

  return createPortal(
    <div className={`fixed inset-0 z-50 flex justify-center ${sheet ? "items-end pt-topbar" : "items-center p-4"}`}>
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={close} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        // The only inline style: the live drag offset, which cannot be a class.
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: "none" } : undefined}
        className={`relative flex flex-col bg-card shadow-login ${panelClass}`}
      >
        {sheet ? (
          <div
            className="flex-shrink-0 cursor-grab touch-none py-2"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-hidden="true"
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-divider" />
          </div>
        ) : null}

        <div className={`flex flex-shrink-0 items-start justify-between gap-3 px-4 ${sheet ? "pb-3" : "py-3"}`}>
          <div className="min-w-0">
            <h2 id={titleId} className="text-title font-bold text-text-primary">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-1 text-meta text-text-secondary">
                {description}
              </p>
            ) : null}
          </div>
          {dismissible ? (
            <button type="button" className="icon-btn bg-neutral-secondary" onClick={onClose} aria-label="Close">
              <Icon name="close" size={20} />
            </button>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>

        {footer ? <div className="flex flex-shrink-0 flex-col-reverse gap-2 border-t border-divider p-4 md:flex-row md:justify-end">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}

export default DialogShell;
