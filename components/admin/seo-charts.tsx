"use client";

import { useId, useMemo, useState, type ReactNode } from "react";

/**
 * Small hand-drawn SVG charts for the SEO screens: one y-axis, recessive grid, 2px lines, a crosshair tooltip on hover.
 * Colours: the current period is the admin blue; the comparison period is a dashed slate line (named in the legend).
 */
export const CHART_BLUE = "#1a63e8";
export const CHART_PREVIOUS = "#6f7d94";
const GRID = "#e8edf4";
const AXIS_TEXT = "#5b6b85";

export type LinePoint = { label: string; value: number; previous?: number | null };

function niceMax(value: number) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * power >= value / 4) ?? 10;
  return Math.ceil(value / (step * power)) * step * power;
}

/** A line over time, optionally with the previous period drawn dashed behind it. `invert` puts small values on top (for Google position). */
export function LineChart({
  points,
  format,
  name,
  previousName,
  invert = false,
  height = 240,
}: {
  points: LinePoint[];
  format: (value: number) => string;
  name: string;
  previousName?: string;
  invert?: boolean;
  height?: number;
}) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const width = 720;
  const pad = { left: 48, right: 16, y0: 12, bottom: 28 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.y0 - pad.bottom;
  const hasPrevious = points.some((point) => point.previous !== undefined && point.previous !== null);

  const { max, min } = useMemo(() => {
    const values = points.flatMap((point) => [point.value, point.previous ?? point.value]).filter((value) => Number.isFinite(value));
    // Whole-number series (clicks, sessions) get a top divisible by 4, so the five gridlines land on whole numbers.
    const whole = !invert && values.every((value) => Number.isInteger(value));
    const high = whole ? Math.max(4, Math.ceil(niceMax(Math.max(0, ...values)) / 4) * 4) : niceMax(Math.max(0, ...values));
    return { max: high, min: invert ? Math.max(1, Math.floor(Math.min(...values, high))) : 0 };
  }, [points, invert]);

  if (!points.length) return <EmptyChart height={height} />;

  const x = (index: number) => pad.left + (points.length === 1 ? plotW / 2 : (index / (points.length - 1)) * plotW);
  const y = (value: number) => {
    const share = max === min ? 0.5 : (value - min) / (max - min);
    return pad.y0 + (invert ? share : 1 - share) * plotH;
  };
  const path = (pick: (point: LinePoint) => number | null | undefined) => {
    let d = "";
    points.forEach((point, index) => {
      const value = pick(point);
      if (value === null || value === undefined || !Number.isFinite(value)) return;
      d += `${d ? "L" : "M"}${x(index).toFixed(1)} ${y(value).toFixed(1)}`;
    });
    return d;
  };
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((share) => min + (max - min) * share);
  const labelEvery = Math.max(1, Math.ceil(points.length / 7));
  const active = hover === null ? null : points[hover];

  const onMove = (event: React.MouseEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const share = (event.clientX - box.left) / box.width;
    setHover(Math.min(points.length - 1, Math.max(0, Math.round(share * (points.length - 1)))));
  };

  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-[#5b6b85]" aria-hidden={!hasPrevious}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 rounded" style={{ background: CHART_BLUE }} />
          {name}
        </span>
        {hasPrevious ? (
          <span className="flex items-center gap-1.5">
            <svg width="20" height="2" aria-hidden="true">
              <line x1="0" y1="1" x2="20" y2="1" stroke={CHART_PREVIOUS} strokeWidth="2" strokeDasharray="4 3" />
            </svg>
            {previousName}
          </span>
        ) : null}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-labelledby={`${id}-title`}>
        <title id={`${id}-title`}>{name}</title>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke={GRID} />
            <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT}>
              {format(tick)}
            </text>
          </g>
        ))}
        {points.map((point, index) =>
          index % labelEvery === 0 || index === points.length - 1 ? (
            <text key={point.label + index} x={x(index)} y={height - 8} textAnchor="middle" fontSize="11" fill={AXIS_TEXT}>
              {point.label}
            </text>
          ) : null,
        )}
        {hasPrevious ? <path d={path((point) => point.previous)} fill="none" stroke={CHART_PREVIOUS} strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" /> : null}
        <path d={path((point) => point.value)} fill="none" stroke={CHART_BLUE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {active && hover !== null ? (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.y0} y2={pad.y0 + plotH} stroke="#9aa7bb" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(active.value)} r="4.5" fill={CHART_BLUE} stroke="#fff" strokeWidth="2" />
            {hasPrevious && active.previous !== null && active.previous !== undefined ? (
              <circle cx={x(hover)} cy={y(active.previous)} r="4" fill={CHART_PREVIOUS} stroke="#fff" strokeWidth="2" />
            ) : null}
          </g>
        ) : null}
        <rect x={pad.left} y={pad.y0} width={plotW} height={plotH} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
      </svg>
      {active && hover !== null ? (
        <div
          className="pointer-events-none absolute top-8 z-10 min-w-36 rounded-lg border border-[#dfe5ef] bg-white px-3 py-2 text-xs shadow-lg"
          style={{ left: `${Math.min(78, Math.max(4, (x(hover) / width) * 100 - 8))}%` }}
        >
          <p className="font-semibold text-[#14213d]">{active.label}</p>
          <p className="mt-1 flex justify-between gap-4">
            <span className="text-[#5b6b85]">{name}</span>
            <span className="font-semibold">{format(active.value)}</span>
          </p>
          {hasPrevious ? (
            <p className="flex justify-between gap-4">
              <span className="text-[#5b6b85]">{previousName}</span>
              <span className="font-semibold">{active.previous === null || active.previous === undefined ? "—" : format(active.previous)}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Horizontal bars for "top N" lists: name on the left, value at the bar's end. */
export function BarList({ rows, format, empty = "No data yet." }: { rows: { label: ReactNode; value: number; key: string }[]; format: (value: number) => string; empty?: string }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  if (!rows.length) return <p className="py-6 text-center text-sm text-[#5b6b85]">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.key} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm" title={`${format(row.value)}`}>
          <div className="min-w-0">
            <div className="truncate text-[#14213d]">{row.label}</div>
            <div className="mt-1 h-2 rounded-full bg-[#eef2f8]">
              <div className="h-2 rounded-full group-hover:opacity-80" style={{ width: `${Math.max(2, (row.value / max) * 100)}%`, background: CHART_BLUE }} />
            </div>
          </div>
          <span className="tabular-nums font-semibold">{format(row.value)}</span>
        </li>
      ))}
    </ul>
  );
}

export function EmptyChart({ height = 240, text = "No numbers from Google for this period yet." }: { height?: number; text?: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-[#d4dbe7] text-sm text-[#5b6b85]" style={{ height }}>
      {text}
    </div>
  );
}

/** A stat tile with the change against the previous period. `lowerIsBetter` flips the colour (for Google position). */
export function StatTile({ label, value, delta, lowerIsBetter = false, hint }: { label: string; value: string; delta: number | null; lowerIsBetter?: boolean; hint?: string }) {
  const good = delta === null ? null : lowerIsBetter ? delta < 0 : delta > 0;
  return (
    <div className="rounded-2xl border border-[#dfe5ef] bg-white p-4">
      <p className="text-sm font-semibold text-[#5b6b85]">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-[#5b6b85]">
        {delta === null || !Number.isFinite(delta) ? (
          (hint ?? "No earlier period to compare")
        ) : (
          <>
            <span className={`font-semibold ${delta === 0 ? "text-[#5b6b85]" : good ? "text-[#1c7a3e]" : "text-[#a12020]"}`}>
              {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {Math.abs(delta * 100).toFixed(1)}%
            </span>{" "}
            vs previous period
          </>
        )}
      </p>
    </div>
  );
}
