import React from "react";
import { DialogShell, type DialogBaseProps } from "@/components/ui/Dialog";
import { MQ_MD, useMediaQuery } from "@/hooks/useMediaQuery";

export interface ModalProps extends DialogBaseProps {
  /** Width of the centred card. */
  size?: "sm" | "md" | "lg";
  /**
   * "responsive" (default): bottom sheet below 768px, centred card from 768px up.
   * "center": always a centred card.
   */
  layout?: "responsive" | "center";
}

/** Dialog that is a bottom sheet on phones and a centred card on larger screens. */
export function Modal({ layout = "responsive", size = "md", ...rest }: ModalProps) {
  const wide = useMediaQuery(MQ_MD);
  const mode = layout === "center" || wide ? "center" : "sheet";
  return <DialogShell {...rest} size={size} mode={mode} />;
}

export default Modal;
