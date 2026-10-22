import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function ItemNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
      <h1 className="font-medium">Item not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This item isn&apos;t in your tracked list. It may have been removed.
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline", className: "mt-2" })}>
        Back to tracked items
      </Link>
    </div>
  );
}
