import { AVAILABILITY_LABELS, formatPrice } from "@/lib/tracking";
import type { PricePoint } from "@/types";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

interface PriceHistoryTableProps {
  history: PricePoint[];
  currency: string;
  sizeLabel: string;
}

export function PriceHistoryTable({ history, currency, sizeLabel }: PriceHistoryTableProps) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">No price checks recorded yet.</p>;
  }

  const newestFirst = [...history].sort((a, b) => b.observedAt.localeCompare(a.observedAt));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Price and size {sizeLabel} availability over time, newest first</caption>
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th scope="col" className="py-2 pr-4 font-normal">Checked</th>
            <th scope="col" className="py-2 pr-4 font-normal">Price</th>
            <th scope="col" className="py-2 font-normal">Size {sizeLabel}</th>
          </tr>
        </thead>
        <tbody>
          {newestFirst.map((point) => (
            <tr key={point.observedAt} className="border-b last:border-0">
              <td className="py-2 pr-4">
                <time dateTime={point.observedAt}>{dateFormat.format(new Date(point.observedAt))}</time>
              </td>
              <td className="py-2 pr-4 tabular-nums">{formatPrice(point.price, currency)}</td>
              <td className="py-2">{AVAILABILITY_LABELS[point.availability]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
