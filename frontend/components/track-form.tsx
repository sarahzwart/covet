"use client";

import { useActionState, useState } from "react";
import { BellRingIcon, TriangleAlertIcon } from "lucide-react";

import { trackProductAction, type TrackState } from "@/app/actions";
import { ProductImage } from "@/components/product-image";
import { DemoBadge } from "@/components/status-badges";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AVAILABILITY_LABELS, CATEGORY_LABELS, formatPrice, formatRelativeTime, targetPrice } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import type { ProductSnapshot, TargetRule } from "@/types";

const INITIAL_STATE: TrackState = { status: "idle" };

type TargetType = TargetRule["type"];

const TARGET_OPTIONS: { value: TargetType; label: string; description: string }[] = [
  { value: "any_drop", label: "Any price drop", description: "Alert me when the price goes below today's." },
  { value: "price", label: "Target price", description: "Alert me at or below a specific price." },
  { value: "percent_off", label: "Percent off", description: "Alert me when it's discounted enough." },
];

/** Radio card styling: the native radio stays in the DOM (sr-only) for keyboard and screen-reader support. */
const radioCardClass =
  "flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/50";

export function TrackForm({ product }: { product: ProductSnapshot }) {
  const [state, formAction, pending] = useActionState(trackProductAction, INITIAL_STATE);
  // Controlled fields: React resets uncontrolled inputs after a form action,
  // which would wipe the user's choices whenever validation fails.
  const [sizeId, setSizeId] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("any_drop");
  const [targetValue, setTargetValue] = useState("");
  const [category, setCategory] = useState<string | null>(product.category);

  const fieldErrors = state.status === "error" ? state.fieldErrors : {};
  const formError = state.status === "error" ? state.message : undefined;
  const canTrack = product.price !== null && product.sizes.length > 0;

  return (
    <Card>
      <form action={formAction} noValidate>
        <input type="hidden" name="url" value={product.url} />

        <CardContent className="flex flex-col gap-6">
          <ProductHeader product={product} />

          {!canTrack && (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>Can&apos;t track this product yet</AlertTitle>
              <AlertDescription>
                {product.price === null
                  ? "The retailer didn't report a current price."
                  : "The retailer didn't report any sizes."}
              </AlertDescription>
            </Alert>
          )}

          {canTrack && (
            <>
              <FieldSet>
                <FieldLegend>Your size</FieldLegend>
                <FieldDescription>Out-of-stock sizes can be tracked too — we&apos;ll only alert you when yours is in stock.</FieldDescription>
                <div
                  role="radiogroup"
                  aria-invalid={fieldErrors.sizeId ? true : undefined}
                  className="grid grid-cols-3 gap-2 sm:grid-cols-5"
                >
                  {product.sizes.map((size) => (
                    <label key={size.id} className={cn(radioCardClass, "items-center text-center")}>
                      <input
                        type="radio"
                        name="sizeId"
                        value={size.id}
                        checked={sizeId === size.id}
                        onChange={() => setSizeId(size.id)}
                        className="sr-only"
                        required
                      />
                      <span className="font-medium">{size.label}</span>
                      <span
                        className={cn(
                          "text-xs",
                          size.availability === "in_stock" ? "text-muted-foreground" : "text-amber-700 dark:text-amber-400",
                        )}
                      >
                        {AVAILABILITY_LABELS[size.availability]}
                      </span>
                    </label>
                  ))}
                </div>
                <FieldError>{fieldErrors.sizeId}</FieldError>
              </FieldSet>

              <FieldSet>
                <FieldLegend>When should we alert you?</FieldLegend>
                <div role="radiogroup" className="grid gap-2 sm:grid-cols-3">
                  {TARGET_OPTIONS.map((option) => (
                    <label key={option.value} className={radioCardClass}>
                      <input
                        type="radio"
                        name="targetType"
                        value={option.value}
                        checked={targetType === option.value}
                        onChange={() => setTargetType(option.value)}
                        className="sr-only"
                      />
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </label>
                  ))}
                </div>
                {targetType !== "any_drop" && product.price !== null && (
                  <TargetValueField
                    type={targetType}
                    value={targetValue}
                    onChange={setTargetValue}
                    currentPrice={product.price}
                    currency={product.currency}
                    error={fieldErrors.targetValue}
                  />
                )}
              </FieldSet>

              <Field data-invalid={fieldErrors.category ? true : undefined}>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Select name="category" items={CATEGORY_LABELS} value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category" className="w-full sm:w-56" aria-invalid={fieldErrors.category ? true : undefined}>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError>{fieldErrors.category}</FieldError>
              </Field>
            </>
          )}

          {formError && (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        {canTrack && (
          <CardFooter className="justify-end border-t pt-(--card-spacing)">
            <Button type="submit" disabled={pending}>
              <BellRingIcon aria-hidden />
              {pending ? "Saving…" : "Start tracking"}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}

function ProductHeader({ product }: { product: ProductSnapshot }) {
  return (
    <div className="flex gap-4">
      <ProductImage src={product.imageUrl} alt={product.title} className="w-28 shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-xs text-muted-foreground">{product.retailerName}</p>
        <h2 className="text-lg font-medium leading-snug">{product.title}</h2>
        <p className="text-lg">{formatPrice(product.price, product.currency)}</p>
        <div className="flex flex-wrap items-center gap-2">
          {product.isDemo && <DemoBadge />}
          <span className="text-xs text-muted-foreground">
            Fetched <time dateTime={product.fetchedAt}>{formatRelativeTime(product.fetchedAt)}</time>
          </span>
        </div>
      </div>
    </div>
  );
}

interface TargetValueFieldProps {
  type: "price" | "percent_off";
  value: string;
  onChange: (value: string) => void;
  currentPrice: number;
  currency: string;
  error?: string;
}

function TargetValueField({ type, value, onChange, currentPrice, currency, error }: TargetValueFieldProps) {
  const numeric = Number(value);
  const hasNumber = value.trim() !== "" && Number.isFinite(numeric) && numeric > 0;

  let hint: string;
  if (type === "price") {
    hint =
      hasNumber && numeric >= currentPrice
        ? "The current price already meets this target, so you'll be alerted once your size is confirmed in stock."
        : `Current price is ${formatPrice(currentPrice, currency)}.`;
  } else {
    hint = hasNumber
      ? `That's ${formatPrice(targetPrice({ type, value: numeric }, currentPrice), currency)} or less.`
      : "Between 1% and 90% off today's price.";
  }

  return (
    <Field data-invalid={error ? true : undefined} className="sm:max-w-56">
      <FieldLabel htmlFor="target-value">{type === "price" ? "Target price" : "Percent off"}</FieldLabel>
      <div className="relative">
        {type === "price" && (
          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
        )}
        <Input
          id="target-value"
          name="targetValue"
          type="number"
          inputMode="decimal"
          min={type === "price" ? 0.01 : 1}
          max={type === "price" ? undefined : 90}
          step={type === "price" ? 0.01 : 1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(type === "price" ? "pl-6" : "pr-7")}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "target-value-error" : "target-value-hint"}
          required
        />
        {type === "percent_off" && (
          <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted-foreground">
            %
          </span>
        )}
      </div>
      {error ? (
        <FieldError id="target-value-error">{error}</FieldError>
      ) : (
        <FieldDescription id="target-value-hint">{hint}</FieldDescription>
      )}
    </Field>
  );
}
