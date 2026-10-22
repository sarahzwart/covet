import type { Metadata } from "next";

import { TrackProductFlow } from "@/components/track-product-flow";

export const metadata: Metadata = { title: "Track a product" };

export default function TrackPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Track a product</h1>
        <p className="text-sm text-muted-foreground">
          Paste a link to a product page. We&apos;ll look it up so you can pick your size and target price.
        </p>
      </div>
      <TrackProductFlow />
    </div>
  );
}
