import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { GatewayStatus } from "@/lib/gateway/gateway-status";
import { Cog, Plug } from "lucide-react";
import { resolveGatewayStatusBadgeClass, resolveGatewayStatusLabel } from "./colorSemantics";

type HeaderBarProps = {
  status: GatewayStatus;
  onConnectionSettings: () => void;
  showConnectionSettings?: boolean;
};

export const HeaderBar = ({
  status,
  onConnectionSettings,
  showConnectionSettings = true,
}: HeaderBarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="ui-topbar relative z-[180] border-b border-border bg-background">
      <div className="flex h-12 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <p className="font-display text-xl font-medium tracking-tight text-foreground">
            OpenClaw
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span
            className={`ui-badge rounded-sm px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${resolveGatewayStatusBadgeClass(status)}`}
            data-testid="gateway-status-indicator"
            data-status={status}
          >
            {resolveGatewayStatusLabel(status)}
          </span>
          
          <ThemeToggle />
          
          {showConnectionSettings ? (
            <div className="relative z-[210]" ref={menuRef}>
              <button
                type="button"
                className="ui-btn-icon h-8 w-8 rounded-md border border-border bg-card transition-all hover:bg-surface-3"
                data-testid="studio-menu-toggle"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <Cog className="h-4 w-4" />
                <span className="sr-only">Open studio menu</span>
              </button>
              {menuOpen ? (
                <div className="ui-card ui-menu-popover absolute right-0 top-10 z-[260] min-w-56 overflow-hidden border border-border p-1 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Management
                  </div>
                  <button
                    className="ui-btn-ghost w-full justify-start gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-foreground transition-all hover:bg-surface-3"
                    type="button"
                    onClick={() => {
                      onConnectionSettings();
                      setMenuOpen(false);
                    }}
                    data-testid="gateway-settings-toggle"
                  >
                    <Plug className="h-3.5 w-3.5" />
                    Gateway connection
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
