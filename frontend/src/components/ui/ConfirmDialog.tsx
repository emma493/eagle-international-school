import React, { useEffect, useState } from "react";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Modal } from "@/components/ui/Modal";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** What will happen, in plain words. */
  description?: string;
  /** Extra content between the description and the buttons, for example a summary of amounts. */
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger = destructive (red), success = green, primary = blue. */
  tone?: Extract<ButtonVariant, "danger" | "success" | "primary">;
  loading?: boolean;
  /**
   * When set, the confirm button stays disabled until the person ticks this statement,
   * for example "The parent has agreed to apply this credit."
   */
  requireAcknowledgement?: string;
}

/**
 * Confirmation for destructive or hard-to-undo actions (publish a report, reconcile cash, disable
 * an account, apply credit). Escape and the scrim cancel; both buttons are disabled while `loading`.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  loading = false,
  requireAcknowledgement,
}: ConfirmDialogProps) {
  const [ack, setAck] = useState(false);
  useEffect(() => {
    if (!open) setAck(false);
  }, [open]);
  const blocked = Boolean(requireAcknowledgement) && !ack;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      dismissible={!loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading} disabled={blocked}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
      {requireAcknowledgement ? <Checkbox checked={ack} onChange={(e) => setAck(e.target.checked)} label={requireAcknowledgement} className="mt-2" /> : null}
    </Modal>
  );
}

export default ConfirmDialog;
