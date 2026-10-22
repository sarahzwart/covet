"use client";

import { useEffect } from "react";
import { TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border px-6 py-16 text-center">
      <TriangleAlertIcon className="size-10 text-destructive" aria-hidden />
      <h1 className="font-medium">We couldn&apos;t load this page</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Something went wrong while loading your tracked items. Your data is safe — try again in a moment.
      </p>
      <Button variant="outline" onClick={() => retry()} className="mt-2">
        Try again
      </Button>
    </div>
  );
}
