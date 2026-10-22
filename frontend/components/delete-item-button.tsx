"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";

import { deleteTrackedItemAction } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteItemButtonProps {
  itemId: string;
  itemTitle: string;
  /** Where to go after deleting, e.g. when deleting from the item's own page. */
  redirectTo?: string;
  showLabel?: boolean;
}

export function DeleteItemButton({ itemId, itemTitle, redirectTo, showLabel = false }: DeleteItemButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTrackedItemAction(itemId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            variant={showLabel ? "outline" : "ghost"}
            size={showLabel ? "default" : "icon-sm"}
            aria-label={showLabel ? undefined : `Stop tracking ${itemTitle}`}
          />
        }
      >
        <Trash2Icon aria-hidden />
        {showLabel && "Stop tracking"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Stop tracking this item?</AlertDialogTitle>
          <AlertDialogDescription>
            {itemTitle} will be removed from your list along with its price history. You won&apos;t get
            alerts for it anymore.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending ? "Removing…" : "Stop tracking"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
