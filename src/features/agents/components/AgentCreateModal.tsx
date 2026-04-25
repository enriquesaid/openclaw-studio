"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import type { AgentCreateModalSubmitPayload } from "@/features/agents/creation/types";
import { AgentAvatar } from "@/features/agents/components/AgentAvatar";
import { randomUUID } from "@/lib/uuid";

type AgentCreateModalProps = {
  open: boolean;
  suggestedName: string;
  busy?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: AgentCreateModalSubmitPayload) => Promise<void> | void;
};

const fieldClassName =
  "ui-input w-full rounded-md px-3 py-2 text-xs text-foreground outline-none";
const labelClassName =
  "font-mono text-[11px] font-semibold tracking-[0.05em] text-muted-foreground";

const resolveInitialName = (suggestedName: string): string => {
  const trimmed = suggestedName.trim();
  if (!trimmed) return "New Agent";
  return trimmed;
};

const AgentCreateModalContent = ({
  suggestedName,
  busy,
  submitError,
  onClose,
  onSubmit,
}: Omit<AgentCreateModalProps, "open">) => {
  const [name, setName] = useState(() => resolveInitialName(suggestedName));
  const [avatarSeed, setAvatarSeed] = useState(() => randomUUID());

  const canSubmit = name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || busy) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;
    void onSubmit({ name: trimmedName, avatarSeed });
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-background/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Create agent"
      onClick={busy ? undefined : onClose}
    >
      <form
        className="ui-panel w-full max-w-2xl shadow-xs"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
        onClick={(event) => event.stopPropagation()}
        data-testid="agent-create-modal"
      >
        <div className="flex items-center justify-between border-b border-border/40 px-8 py-8">
          <div>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
              Studio
            </div>
            <div className="mt-1 text-xl font-bold tracking-tight text-foreground">Launch new agent</div>
            <div className="mt-1 text-sm text-muted-foreground">Configure your agent's identity and launch it into the fleet.</div>
          </div>
          <button
            type="button"
            className="ui-btn-secondary h-9 px-4 text-[12px] font-semibold"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
        </div>

        <div className="grid gap-6 px-8 py-8">
          <label className={labelClassName}>
            Agent Name
            <input
              aria-label="Agent name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={`mt-2 h-11 text-sm ${fieldClassName}`}
              placeholder="e.g. Research Assistant"
            />
          </label>
          
          <div className="flex flex-col items-center gap-4 border-t border-border/40 pt-8">
            <div className={labelClassName}>Identity Avatar</div>
            <div className="relative">
              <AgentAvatar
                seed={avatarSeed}
                name={name.trim() || "New Agent"}
                size={96}
                isSelected
              />
              <button
                type="button"
                aria-label="Shuffle avatar selection"
                className="ui-btn-icon absolute -bottom-1 -right-1 h-9 w-9 border-4 border-card bg-surface-3 shadow-lg hover:scale-110"
                onClick={() => setAvatarSeed(randomUUID())}
                disabled={busy}
              >
                <Shuffle className="h-4 w-4" />
              </button>
            </div>
            <div className="text-[11px] text-muted-foreground">Shuffle to generate a unique visual identity.</div>
          </div>

          {submitError ? (
            <div className="ui-alert-danger rounded-xl px-4 py-3 text-sm font-medium">
              {submitError}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-border/40 bg-surface-2/30 px-8 py-6">
          <div className="max-w-[240px] text-[11px] leading-relaxed text-muted-foreground">
            You can always modify the name and capabilities later from the agent settings.
          </div>
          <button
            type="submit"
            className="ui-btn-primary h-11 px-8"
            disabled={!canSubmit || busy}
          >
            {busy ? "Launching..." : "Launch Agent"}
          </button>
        </div>
      </form>
    </div>
  );
};

export const AgentCreateModal = ({
  open,
  suggestedName,
  busy = false,
  submitError = null,
  onClose,
  onSubmit,
}: AgentCreateModalProps) => {
  if (!open) return null;
  return (
    <AgentCreateModalContent
      suggestedName={suggestedName}
      busy={busy}
      submitError={submitError}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};
