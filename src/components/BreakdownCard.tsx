import type { Breakdown } from "@/lib/links";
import { formatCount } from "@/lib/format";

type Props = {
  title: string;
  rows: Breakdown;
  total: number;
  formatLabel?: (label: string) => string;
};

export function BreakdownCard({ title, rows, total, formatLabel = (label) => label }: Props) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <h3 className="text-sm font-medium">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No clicks yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => {
            const share = total ? Math.round((row.count / total) * 100) : 0;
            return (
              <li key={row.label}>
                <div className="flex justify-between text-sm">
                  <span className="truncate pr-3">{formatLabel(row.label)}</span>
                  <span className="font-mono text-muted">
                    {formatCount(row.count)} · {share}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-accent-soft">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${share}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
