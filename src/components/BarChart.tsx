import { formatCount, formatDay } from "@/lib/format";

type Props = { data: { day: string; count: number }[] };

// Server-rendered SVG chart: no client JavaScript, readable without hover via the table below it.
export function BarChart({ data }: Props) {
  const width = 720;
  const height = 200;
  const gap = 4;
  const max = Math.max(1, ...data.map((d) => d.count));
  const barWidth = (width - gap * (data.length - 1)) / data.length;
  const ticks = [max, Math.round(max / 2), 0];

  return (
    <figure>
      <div className="flex gap-3">
        <div className="flex h-[200px] flex-col justify-between py-0 text-right font-mono text-[11px] text-muted">
          {ticks.map((tick, i) => (
            <span key={i}>{formatCount(tick)}</span>
          ))}
        </div>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-[200px] w-full"
          role="img"
          aria-label={`Clicks per day over the last ${data.length} days`}
        >
          {[0, 0.5, 1].map((f) => (
            <line key={f} x1={0} x2={width} y1={height * f} y2={height * f} className="stroke-line" strokeWidth={1} />
          ))}
          {data.map((d, i) => {
            const h = (d.count / max) * (height - 4);
            return (
              <rect
                key={d.day}
                x={i * (barWidth + gap)}
                y={height - Math.max(h, d.count ? 2 : 0)}
                width={barWidth}
                height={Math.max(h, d.count ? 2 : 0)}
                rx={2}
                className="fill-accent"
              >
                <title>{`${formatDay(d.day)}: ${formatCount(d.count)} clicks`}</title>
              </rect>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 flex justify-between pl-10 text-xs text-muted">
        <span>{formatDay(data[0].day)}</span>
        <span>{formatDay(data[data.length - 1].day)}</span>
      </figcaption>
    </figure>
  );
}
