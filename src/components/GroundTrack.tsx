import { useMemo } from "react";
import { useStore } from "../store/useStore";

interface GroundTrackProps {
  width?: number;
  height?: number;
}

// Maps longitude [-180,180] → SVG x
function lonToX(lon: number, w: number): number {
  return ((lon + 180) / 360) * w;
}
// Maps latitude [90,-90] → SVG y (north = top)
function latToY(lat: number, h: number): number {
  return ((90 - lat) / 180) * h;
}

export default function GroundTrack({ width = 380, height = 160 }: GroundTrackProps) {
  const { telemetry } = useStore();

  const { pathD, dots, latest } = useMemo(() => {
    const pts = telemetry.map((p) => ({
      x: lonToX(p.longitude, width),
      y: latToY(p.latitude, height),
    }));

    // Build path — break if longitude wraps (gap > 50% of width)
    let d = "";
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) {
        d += `M${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`;
      } else {
        const dx = Math.abs(pts[i].x - pts[i - 1].x);
        if (dx > width * 0.4) {
          d += ` M${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`;
        } else {
          d += ` L${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`;
        }
      }
    }

    // Show every 5th point as a small dot
    const dots = pts.filter((_, i) => i % 5 === 0);
    const latest = pts[pts.length - 1];

    return { pathD: d, dots, latest };
  }, [telemetry, width, height]);

  // Grid lines: every 30° lat and 60° lon
  const latLines = [-60, -30, 0, 30, 60].map((lat) => latToY(lat, height));
  const lonLines = [-120, -60, 0, 60, 120].map((lon) => lonToX(lon, width));

  return (
    <div className="w-full overflow-hidden rounded-lg bg-space-bg/60 border border-space-border">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        {/* Background */}
        <rect width={width} height={height} fill="#05070d" />

        {/* Equator and prime meridian highlighted */}
        <line x1={0} y1={latToY(0, height)} x2={width} y2={latToY(0, height)} stroke="#1a2436" strokeWidth="1" />
        <line x1={lonToX(0, width)} y1={0} x2={lonToX(0, width)} y2={height} stroke="#1a2436" strokeWidth="1" />

        {/* Grid lines */}
        {latLines.map((y) => (
          <line key={y} x1={0} y1={y} x2={width} y2={y} stroke="#0d1a2a" strokeWidth="0.5" />
        ))}
        {lonLines.map((x) => (
          <line key={x} x1={x} y1={0} x2={x} y2={height} stroke="#0d1a2a" strokeWidth="0.5" />
        ))}

        {/* Orbit inclination band (±51.6°) */}
        <rect
          x={0}
          y={latToY(51.6, height)}
          width={width}
          height={latToY(-51.6, height) - latToY(51.6, height)}
          fill="rgba(59,130,246,0.04)"
        />

        {/* Ground track path */}
        <path d={pathD} fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Position dots */}
        {dots.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r={1.5} fill="#3b82f6" fillOpacity={0.5} />
        ))}

        {/* Latest position — bright dot with pulse ring */}
        {latest && (
          <>
            <circle cx={latest.x} cy={latest.y} r={6} fill="#22d3ee" fillOpacity={0.12} />
            <circle cx={latest.x} cy={latest.y} r={3.5} fill="#22d3ee" />
            {/* Cross-hair lines */}
            <line x1={latest.x} y1={0} x2={latest.x} y2={height} stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.25" strokeDasharray="2,3" />
            <line x1={0} y1={latest.y} x2={width} y2={latest.y} stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.25" strokeDasharray="2,3" />
          </>
        )}

        {/* Axis labels */}
        <text x={2} y={latToY(60, height) + 10} fill="#334155" fontSize="7" fontFamily="IBM Plex Mono, monospace">60°N</text>
        <text x={2} y={latToY(0, height) - 2} fill="#334155" fontSize="7" fontFamily="IBM Plex Mono, monospace">EQ</text>
        <text x={2} y={latToY(-60, height) - 2} fill="#334155" fontSize="7" fontFamily="IBM Plex Mono, monospace">60°S</text>

        {/* Border */}
        <rect x={0} y={0} width={width} height={height} fill="none" stroke="#1a2436" strokeWidth="1" />
      </svg>
    </div>
  );
}
