import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight">
          Covet
        </Link>
        <nav aria-label="Main" className="flex items-center gap-2">
          <Link href="/" className={buttonVariants({ variant: "ghost" })}>
            Tracked items
          </Link>
          <Link href="/track" className={buttonVariants()}>
            <PlusIcon aria-hidden />
            Track a product
          </Link>
        </nav>
      </div>
    </header>
  );
}
