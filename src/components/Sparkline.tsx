import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}

// Lightweight inline SVG sparkline — no chart lib needed for tiny strips.
export default function Sparkline({ data, color = "#22d3ee", width = 120, height = 32, fill = true }: SparklineProps) {
  const { path, area } = useMemo(() => {
    if (data.length < 2) return { path: "", area: "" };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    const pts = data.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return [x, y] as const;
    });
    const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
    const area = `${path} L${width},${height} L0,${height} Z`;
    return { path, area };
  }, [data, width, height]);

  const gid = useMemo(() => `spark-${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
