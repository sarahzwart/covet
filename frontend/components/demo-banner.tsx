import { FlaskConicalIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DemoBanner() {
  return (
    <Alert>
      <FlaskConicalIcon />
      <AlertTitle>Demo mode</AlertTitle>
      <AlertDescription>
        Products, prices, and stock levels shown here are sample data, not live retailer data. No SMS
        alerts are sent.
      </AlertDescription>
    </Alert>
  );
}
