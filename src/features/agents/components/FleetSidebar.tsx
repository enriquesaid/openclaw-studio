import { ArrowUpRight, ChevronUp, Home, Plus, Plug } from "lucide-react";
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
import { useLayoutEffect, useMemo, useRef } from "react";

type FleetSidebarProps = {
  agents: AgentState[];
  selectedAgentId: string | null;
  filter: FocusFilter;
  gatewayStatus: GatewayStatus;
  onFilterChange: (next: FocusFilter) => void;
  onSelectAgent: (agentId: string) => void;
  onCreateAgent: () => void;
  onConnectionSettings: () => void;
  onAvatarShuffle?: () => void;
  createDisabled?: boolean;
  createBusy?: boolean;
  showConnectionSettings?: boolean;
};

export const FleetSidebar = ({
  agents,
  selectedAgentId,
  filter: _filter,
  gatewayStatus,
  onFilterChange: _onFilterChange,
  onSelectAgent,
  onCreateAgent,
  onConnectionSettings,
  onAvatarShuffle,
  createDisabled = false,
  createBusy = false,
  showConnectionSettings = true,
}: FleetSidebarProps) => {
  const rowRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previousTopByAgentIdRef = useRef<Map<string, number>>(new Map());

  const agentOrderKey = useMemo(() => agents.map((agent) => agent.agentId).join("|"), [agents]);

  useLayoutEffect(() => {
    const nextTopByAgentId = new Map<string, number>();
    const agentIds = agentOrderKey.length === 0 ? [] : agentOrderKey.split("|");
    for (const agentId of agentIds) {
      const node = rowRefs.current.get(agentId);
      if (!node) continue;
      const nextTop = node.getBoundingClientRect().top;
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

  const selectedAgent = useMemo(
    () => agents.find((a) => a.agentId === selectedAgentId) ?? agents[0] ?? null,
    [agents, selectedAgentId]
  );

  return (
    <aside
      className="fade-up-delay relative flex h-full w-full min-w-72 flex-col bg-sidebar xl:max-w-[320px]"
      data-testid="fleet-sidebar"
    >
      {/* Agent profile */}
      <div className="flex flex-col items-center px-6 pt-10 pb-6">
        {selectedAgent ? (
          <>
            <div className="group/avatar relative">
              <AgentAvatar
                seed={selectedAgent.avatarSeed ?? selectedAgent.agentId}
                name={selectedAgent.name}
                avatarUrl={selectedAgent.avatarUrl ?? null}
                size={100}
                isSelected={false}
              />
              {onAvatarShuffle ? (
                <button
                  className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-card/90 text-muted-foreground opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover/avatar:opacity-100 hover:scale-110 hover:text-foreground active:scale-95"
                  type="button"
                  aria-label="Shuffle avatar"
                  data-testid="agent-avatar-shuffle"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAvatarShuffle(); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
                </button>
              ) : null}
            </div>
            <div className="mt-4 text-center">
              {selectedAgent.lastActivityAt ? (
                <p className="font-mono text-[10px] tracking-wide text-muted-foreground">
                  Active{" "}
                  {new Intl.DateTimeFormat(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(selectedAgent.lastActivityAt))}
                </p>
              ) : null}
              <p className="mt-1 font-display text-xl font-bold uppercase tracking-tight text-foreground">
                {selectedAgent.name}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center text-sm text-muted-foreground">No agent selected</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3" aria-label="Sidebar navigation">
        {/* Home – always the active view */}
        <div className="relative flex items-center gap-3 rounded-xl bg-[#EDE9FE] px-4 py-3 text-[#5B21B6] dark:bg-primary/15 dark:text-primary">
          <Home className="h-4 w-4 shrink-0" />
          <span className="text-sm font-semibold">Home</span>
          <span className="absolute right-3 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#7C3AED] dark:bg-primary" aria-hidden="true" />
        </div>

        {showConnectionSettings ? (
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-surface-2 hover:text-foreground"
            onClick={onConnectionSettings}
            data-testid="gateway-settings-toggle"
          >
            <Plug className="h-4 w-4 shrink-0" />
            Connection
          </button>
        ) : null}

        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-surface-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onCreateAgent}
          disabled={createDisabled || createBusy}
          data-testid="fleet-new-agent-button"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {createBusy ? "Creating…" : "New agent"}
        </button>
      </nav>

      {/* Compact agent switcher (only when there are multiple agents) */}
      {agents.length > 1 ? (
        <div className="mt-5 px-3">
          <p className="mb-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Agents <span className="font-mono opacity-60">({agents.length})</span>
          </p>
          <div className="flex max-h-52 flex-col gap-0.5 overflow-y-auto">
            {agents.map((agent) => {
              const selected = agent.agentId === selectedAgentId;
              const avatarSeed = agent.avatarSeed ?? agent.agentId;
              return (
                <button
                  key={agent.agentId}
                  ref={(node) => {
                    if (node) {
                      rowRefs.current.set(agent.agentId, node);
                    } else {
                      rowRefs.current.delete(agent.agentId);
                    }
                  }}
                  type="button"
                  data-testid={`fleet-agent-row-${agent.agentId}`}
                  className={`group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left transition-all ${
                    selected ? "bg-surface-2 font-semibold" : "hover:bg-surface-2"
                  }`}
                  onClick={() => onSelectAgent(agent.agentId)}
                >
                  <AgentAvatar
                    seed={avatarSeed}
                    name={agent.name}
                    avatarUrl={agent.avatarUrl ?? null}
                    size={28}
                    isSelected={selected}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">{agent.name}</p>
                  </div>
                  <span
                    className={`ui-badge shrink-0 text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider ${resolveAgentStatusBadgeClass(agent.status)}`}
                    data-status={agent.status}
                  >
                    {resolveAgentStatusLabel(agent.status)}
                  </span>
                  {agent.awaitingUserInput ? (
                    <span className={`ui-badge shrink-0 text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider ${NEEDS_APPROVAL_BADGE_CLASS}`} data-status="approval">
                      !
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Bottom */}
      <div className="mt-auto px-4 pb-6">
        {/* FAQs link */}
        <button
          type="button"
          className="mb-4 flex items-center gap-1 px-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          onClick={onConnectionSettings}
        >
          FAQs <ArrowUpRight className="h-3 w-3" />
        </button>

        {/* Gateway status card */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground">Gateway</p>
            <p className="text-[10px] text-muted-foreground">
              {resolveGatewayStatusLabel(gatewayStatus)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`ui-badge rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${resolveGatewayStatusBadgeClass(gatewayStatus)}`}
              data-testid="gateway-status-indicator"
              data-status={gatewayStatus}
            >
              {resolveGatewayStatusLabel(gatewayStatus)}
            </span>
            <ThemeToggle />
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </aside>
  );
};
