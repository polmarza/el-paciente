import { useState } from "react";
import { SLOTS, slotStateAt, type BrainState, type SlotId } from "@el-paciente/shared";
import { FONT, T, SIZE } from "../theme";
import { BrainSlot } from "./BrainSlot";
import { CaseBrief } from "./CaseBrief";
import { EditLog, LOG_HANDLE_HEIGHT } from "./EditLog";
import type { RemoteCursor } from "../hooks/useBrain";

interface BrainPaneProps {
  brain: BrainState;
  cursors: RemoteCursor[];
  now: number;
  /** Durante el relevo entre pacientes no se opera: la mesa está vacía. */
  locked: boolean;
  onEdit: (slot: SlotId, value: string) => Promise<string | null>;
  onCursor: (slot: SlotId | null) => void;
  onReject: (reason: string) => void;
}

/** La mesa de operaciones: siete regiones abiertas al público. */
export function BrainPane({
  brain,
  cursors,
  now,
  locked,
  onEdit,
  onCursor,
  onReject,
}: BrainPaneProps) {
  const [editingSlot, setEditingSlot] = useState<SlotId | null>(null);
  const [draft, setDraft] = useState("");

  const cursorBySlot = new Map<SlotId, RemoteCursor>();
  for (const cursor of cursors) cursorBySlot.set(cursor.slot, cursor);

  function beginEdit(slot: SlotId) {
    if (editingSlot || locked) return;
    setEditingSlot(slot);
    setDraft(brain.snapshot[slot].content);
    onCursor(slot);
  }

  function cancelEdit() {
    setEditingSlot(null);
    setDraft("");
    onCursor(null);
  }

  async function commitEdit() {
    const slot = editingSlot;
    if (!slot) return;
    const value = draft;
    cancelEdit();
    const reason = await onEdit(slot, value);
    if (reason) onReject(reason);
  }

  return (
    <div
      className="paciente-brain"
      style={{
        width: "35%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: T.brainBg,
        // El historial es un cajón absoluto que sube por encima de la mesa.
        position: "relative",
      }}
    >
      <div
        style={{
          flex: "none",
          display: "flex",
          justifyContent: "space-between",
          padding: "13px 22px 11px",
          fontFamily: FONT.mono,
          fontSize: SIZE.micro,
          letterSpacing: ".16em",
          color: T.textDim,
          borderBottom: `1px solid ${T.brainRule}`,
        }}
      >
        <span>MESA DE OPERACIONES</span>
        <span>
          {locked ? "SALA EN PREPARACIÓN" : `${SLOTS.length} REGIONES · ACCESO PÚBLICO`}
        </span>
      </div>

      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 9,
          padding: "16px 22px 12px",
          alignContent: "start",
        }}
      >
        {SLOTS.map((def) => {
          const value = brain.snapshot[def.id];
          return (
            <BrainSlot
              key={def.id}
              def={def}
              value={value}
              state={slotStateAt(value, now)}
              locked={locked}
              cursor={cursorBySlot.get(def.id)}
              editing={editingSlot === def.id}
              draft={draft}
              now={now}
              onBeginEdit={() => beginEdit(def.id)}
              onDraftChange={setDraft}
              onCommit={() => void commitEdit()}
              onCancel={cancelEdit}
            />
          );
        })}
      </div>

      <CaseBrief caso={brain.caso} />

      {/* Hueco para la pestaña cerrada del historial, que va en absoluto: sin él taparía
          el final del parte de ingreso. */}
      <div style={{ flex: "none", height: LOG_HANDLE_HEIGHT }} />

      <EditLog log={brain.log} />
    </div>
  );
}
