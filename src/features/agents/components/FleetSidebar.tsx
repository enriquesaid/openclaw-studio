import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Cog, Pencil, Plug, Shuffle } from "lucide-react";
import type { AgentState, FocusFilter } from "@/features/agents/state/store";
import type { GatewayStatus } from "@/lib/gateway/gateway-status";
import { ThemeToggle } from "@/components/theme-toggle";
import { AgentAvatar } from "./AgentAvatar";
import {
  NEEDS_APPROVAL_BADGE_CLASS,
  resolveAgentStatusBadgeClass,
  resolveAgentStatusLabel,
  resolveGatewayStatusBadgeClass,
  resolveGatewayStatusLabel,
} from "./colorSemantics";
import { EmptyStatePanel } from "./EmptyStatePanel";

type FleetSidebarProps = {
  agents: AgentState[];
  selectedAgentId: string | null;
  filter: FocusFilter;
  gatewayStatus: GatewayStatus;
  onFilterChange: (next: FocusFilter) => void;
  onSelectAgent: (agentId: string) => void;
  onCreateAgent: () => void;
  onConnectionSettings: () => void;
  createDisabled?: boolean;
  createBusy?: boolean;
  showConnectionSettings?: boolean;
};

const FILTER_OPTIONS: Array<{ value: FocusFilter; label: string; testId: string }> = [
  { value: "all", label: "All", testId: "fleet-filter-all" },
  { value: "running", label: "Running", testId: "fleet-filter-running" },
  { value: "approvals", label: "Approvals", testId: "fleet-filter-approvals" },
];

export const FleetSidebar = ({
  agents,
  selectedAgentId,
  filter,
  gatewayStatus,
  onFilterChange,
  onSelectAgent,
  onCreateAgent,
  onConnectionSettings,
  createDisabled = false,
  createBusy = false,
  showConnectionSettings = true,
}: FleetSidebarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previousTopByAgentIdRef = useRef<Map<string, number>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const agentOrderKey = useMemo(() => agents.map((agent) => agent.agentId).join("|"), [agents]);

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

  useLayoutEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) return;
    const scrollerRect = scroller.getBoundingClientRect();

    const getTopInScrollContent = (node: HTMLElement) =>
      node.getBoundingClientRect().top - scrollerRect.top + scroller.scrollTop;

    const nextTopByAgentId = new Map<string, number>();
    const agentIds = agentOrderKey.length === 0 ? [] : agentOrderKey.split("|");
    for (const agentId of agentIds) {
      const node = rowRefs.current.get(agentId);
      if (!node) continue;
      const nextTop = getTopInScrollContent(node);
      nextTopByAgentId.set(agentId, nextTop);
      const previousTop = previousTopByAgentIdRef.current.get(agentId);
      if (typeof previousTop !== "number") continue;
      const deltaY = previousTop - nextTop;
      if (Math.abs(deltaY) < 0.5) continue;
      if (typeof node.animate !== "function") continue;
      node.animate(
        [{ transform: `translateY(${deltaY}px)` }, { transform: "translateY(0px)" }],
        { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    }
    previousTopByAgentIdRef.current = nextTopByAgentId;
  }, [agentOrderKey]);

  return (
    <aside
      className="fade-up-delay relative flex h-full w-full min-w-72 flex-col bg-background xl:max-w-[320px] xl:border-r xl:border-border"
      data-testid="fleet-sidebar"
    >
      <div className="flex flex-col gap-6 p-6 pb-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-2xl font-medium tracking-tight text-foreground italic">Agents <span className="font-mono text-sm not-italic opacity-40">({agents.length})</span></p>
        </div>

        <button
          type="button"
          data-testid="fleet-new-agent-button"
          className="ui-btn-primary w-full px-4 py-2.5 font-sans text-xs font-bold tracking-wider uppercase disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onCreateAgent}
          disabled={createDisabled || createBusy}
        >
          {createBusy ? "Creating..." : "Launch New Agent"}
        </button>

        <div className="grid grid-cols-3 border-b border-border pb-1">
          {FILTER_OPTIONS.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                data-testid={option.testId}
                aria-pressed={active}
                className={`pb-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${active ? "text-foreground border-b-2 border-foreground -mb-[1px]" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => onFilterChange(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ui-scroll min-h-0 flex-1 overflow-auto">
        {agents.length === 0 ? (
          <EmptyStatePanel title="No agents available." compact className="py-8 px-6 text-xs" />
        ) : (
          <div className="flex flex-col">
            {agents.map((agent) => {
              const selected = selectedAgentId === agent.agentId;
              const avatarSeed = agent.avatarSeed ?? agent.agentId;
              return (
                <button
                  key={agent.agentId}
                  ref={(node) => {
                    if (node) {
                      rowRefs.current.set(agent.agentId, node);
                      return;
                    }
                    rowRefs.current.delete(agent.agentId);
                  }}
                  type="button"
                  data-testid={`fleet-agent-row-${agent.agentId}`}
                  className={`group relative flex w-full items-center gap-4 border-b border-border px-6 py-5 text-left transition-all ${
                    selected
                      ? "bg-white z-10"
                      : "hover:bg-surface-2"
                  }`}
                  onClick={() => onSelectAgent(agent.agentId)}
                >
                  {selected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-foreground" />
                  )}
                  <AgentAvatar
                    seed={avatarSeed}
                    name={agent.name}
                    avatarUrl={agent.avatarUrl ?? null}
                    size={44}
                    isSelected={selected}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-[15px] tracking-tight text-foreground ${selected ? "font-bold" : "font-semibold"}`}>
                      {agent.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`ui-badge text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider ${resolveAgentStatusBadgeClass(agent.status)}`}
                        data-status={agent.status}
                      >
                        {resolveAgentStatusLabel(agent.status)}
                      </span>
                      {agent.awaitingUserInput ? (
                        <span className={`ui-badge text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider ${NEEDS_APPROVAL_BADGE_CLASS}`} data-status="approval">
                          Action Required
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-border p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`ui-badge rounded-sm px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${resolveGatewayStatusBadgeClass(gatewayStatus)}`}
              data-testid="gateway-status-indicator"
              data-status={gatewayStatus}
            >
              {resolveGatewayStatusLabel(gatewayStatus)}
            </span>
            <ThemeToggle />
          </div>

          {showConnectionSettings ? (
            <div className="relative" ref={menuRef}>
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
                <div className="ui-card ui-menu-popover absolute bottom-10 right-0 z-[260] min-w-56 overflow-hidden border border-border p-1 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
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
    </aside>
  );
};
