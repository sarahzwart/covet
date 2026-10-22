import Image from "next/image";
import { ShirtIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

/**
 * Product photo, or a neutral placeholder when the data source has no image.
 * Retailer image hosts must be added to `images.remotePatterns` in next.config.ts.
 */
export function ProductImage({ src, alt, className }: ProductImageProps) {
  return (
    <div className={cn("relative aspect-[3/4] overflow-hidden rounded-lg bg-muted", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes="(min-width: 640px) 200px, 40vw" className="object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <ShirtIcon className="size-1/3" aria-hidden />
          <span className="sr-only">No image available</span>
        </div>
      )}
    </div>
  );
}
