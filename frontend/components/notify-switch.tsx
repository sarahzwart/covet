"use client";

import { useId, useOptimistic, useState, useTransition } from "react";

import { setNotificationsAction } from "@/app/actions";
import { Switch } from "@/components/ui/switch";

interface NotifySwitchProps {
  itemId: string;
  enabled: boolean;
}

export function NotifySwitch({ itemId, enabled }: NotifySwitchProps) {
  const id = useId();
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(enabled);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    setError(null);
    startTransition(async () => {
      setOptimisticEnabled(checked);
      const result = await setNotificationsAction(itemId, checked);
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-sm">
          SMS alerts
        </label>
        <Switch id={id} checked={optimisticEnabled} onCheckedChange={handleChange} />
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
