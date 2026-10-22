"use client";

import { useActionState, useState } from "react";
import { SearchIcon } from "lucide-react";

import { previewProductAction, type PreviewState } from "@/app/actions";
import { TrackForm } from "@/components/track-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SUPPORTED_RETAILERS } from "@/lib/retailers";

const INITIAL_STATE: PreviewState = { status: "idle" };

export function TrackProductFlow() {
  const [state, formAction, pending] = useActionState(previewProductAction, INITIAL_STATE);
  const [url, setUrl] = useState("");
  const error = state.status === "error" ? state.message : null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-3" noValidate>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="product-url">Product URL</FieldLabel>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="product-url"
                  name="url"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  placeholder="https://www.abercrombie.com/shop/us/p/…"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "product-url-error" : "product-url-hint"}
                  required
                />
                <Button type="submit" disabled={pending} className="sm:w-32">
                  <SearchIcon aria-hidden />
                  {pending ? "Looking up…" : "Look up"}
                </Button>
              </div>
              {error ? (
                <FieldError id="product-url-error">{error}</FieldError>
              ) : (
                <FieldDescription id="product-url-hint">
                  Supported stores: {SUPPORTED_RETAILERS.map((r) => r.name).join(", ")}.
                </FieldDescription>
              )}
            </Field>
          </form>
        </CardContent>
      </Card>

      <div aria-live="polite" aria-busy={pending}>
        {pending ? (
          <PreviewSkeleton />
        ) : (
          state.status === "success" && (
            // Keyed so the form resets when a different product is looked up.
            <TrackForm key={`${state.product.url}|${state.product.fetchedAt}`} product={state.product} />
          )
        )}
      </div>
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <Card>
      <CardContent className="flex gap-4">
        <Skeleton className="aspect-[3/4] w-28 shrink-0 rounded-lg" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-16" />
          <span className="sr-only">Loading product details…</span>
        </div>
      </CardContent>
    </Card>
  );
}
