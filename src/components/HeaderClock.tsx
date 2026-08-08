import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

export default function HeaderClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const utc = now.toISOString().slice(11, 19);
  const date = now.toISOString().slice(0, 10);

  return (
    <div className="flex items-center gap-4">
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-nominal/10 border border-status-nominal/30">
        <span className="status-dot bg-status-nominal animate-pulse" />
        <span className="text-xs font-medium text-status-nominal telemetry-text">LINK OK</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel">
        <Radio className="w-3.5 h-3.5 text-accent-cyan" />
        <div className="text-right leading-none">
          <div className="text-xs font-mono font-medium text-accent-cyan tabular-nums">{utc} <span className="text-slate-500">UTC</span></div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{date}</div>
        </div>
      </div>
    </div>
  );
}
