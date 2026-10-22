import { CircleCheckIcon, CircleHelpIcon, CircleXIcon, FlaskConicalIcon, TargetIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AVAILABILITY_LABELS } from "@/lib/tracking";
import type { SizeAvailability } from "@/types";

const AVAILABILITY_ICONS = {
  in_stock: CircleCheckIcon,
  out_of_stock: CircleXIcon,
  unknown: CircleHelpIcon,
} as const;

export function AvailabilityBadge({ availability }: { availability: SizeAvailability }) {
  const Icon = AVAILABILITY_ICONS[availability];
  return (
    <Badge variant={availability === "in_stock" ? "secondary" : "outline"}>
      <Icon data-icon="inline-start" aria-hidden />
      {AVAILABILITY_LABELS[availability]}
    </Badge>
  );
}

export function DemoBadge() {
  return (
    <Badge variant="outline" className="border-dashed">
      <FlaskConicalIcon data-icon="inline-start" aria-hidden />
      Demo data
    </Badge>
  );
}

export function TargetMetBadge() {
  return (
    <Badge>
      <TargetIcon data-icon="inline-start" aria-hidden />
      At target price
    </Badge>
  );
}
