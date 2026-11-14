import React from "react";
import { DialogShell, type DialogBaseProps } from "@/components/ui/Dialog";

/** Always a bottom sheet (drag handle, 16px top corners), on every screen size. */
export function BottomSheet(props: DialogBaseProps) {
  return <DialogShell {...props} mode="sheet" />;
}

export default BottomSheet;
