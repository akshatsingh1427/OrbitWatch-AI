import { useEffect } from "react";
import { useStore, type TabId } from "../store/useStore";

const TAB_MAP: Record<string, TabId> = {
  "1": "overview",
  "2": "telemetry",
  "3": "comms",
  "4": "timeline",
  "5": "resources",
};

export function useKeyboardShortcuts() {
  const { setActiveTab, setShortcutOverlayOpen, setSearchQuery, setPaletteOpen } = useStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (typing) return;

      if (TAB_MAP[e.key]) {
        setActiveTab(TAB_MAP[e.key]);
        return;
      }
      if (e.key === "?") {
        setShortcutOverlayOpen(!useStore.getState().shortcutOverlayOpen);
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>("[data-search-input]");
        input?.focus();
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setActiveTab, setShortcutOverlayOpen, setSearchQuery, setPaletteOpen]);
}

export function ShortcutOverlay() {
  const { shortcutOverlayOpen, setShortcutOverlayOpen } = useStore();

  useEffect(() => {
    if (!shortcutOverlayOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "?") setShortcutOverlayOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcutOverlayOpen, setShortcutOverlayOpen]);

  if (!shortcutOverlayOpen) return null;

  const shortcuts: { key: string; desc: string }[] = [
    { key: "1–5", desc: "Jump between tabs" },
    { key: "⌘K", desc: "Open command palette" },
    { key: "/", desc: "Focus search filter" },
    { key: "?", desc: "Toggle this overlay" },
    { key: "ESC", desc: "Close overlay / palette" },
  ];

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setShortcutOverlayOpen(false)}
    >
      <div className="glass-panel p-6 max-w-sm w-full mx-4 border-accent-cyan/30">
        <h3 className="text-sm font-semibold tracking-widest text-accent-cyan uppercase mb-4">Keyboard Shortcuts</h3>
        <div className="space-y-2.5">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{s.desc}</span>
              <kbd className="font-mono text-xs px-2 py-1 rounded bg-space-bg/80 border border-space-border text-accent-cyan">{s.key}</kbd>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4">Press <kbd className="font-mono">?</kbd> or <kbd className="font-mono">ESC</kbd> to close.</p>
      </div>
    </div>
  );
}
