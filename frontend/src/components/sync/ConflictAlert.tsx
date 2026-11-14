import React from "react";
import { Card } from "@/components/ui/Card";

import { Icon } from "@/components/ui/icons";
interface ConflictAlertProps {
  onResolve: () => void;
  conflictCount: number;
}

export function ConflictAlert({ onResolve, conflictCount }: ConflictAlertProps) {
  return (
    <Card className="p-4 shadow-lg border border-alert-red/20">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-8 h-8 bg-alert-red rounded-full flex items-center justify-center text-white text-sm">
          <Icon name="refresh" size={16} />
        </span>
        <div className="flex-1">
          <h4 className="text-text-primary font-semibold text-sm">Sync conflicts resolved</h4>
          <p className="text-text-secondary text-xs">
            {conflictCount} conflict{conflictCount !== 1 ? "s" : ""} were automatically resolved using server data.
          </p>
        </div>
        <button
          onClick={onResolve}
          className="text-xs text-brand-blue hover:text-brand-blue/80 underline"
        >
          Dismiss
        </button>
      </div>
    </Card>
  );
}
