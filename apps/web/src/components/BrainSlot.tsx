import {
  MAX_SLOT_CHARS,
  cooldownSecondsLeft,
  type SlotDef,
  type SlotState,
  type SlotValue,
} from "@el-paciente/shared";
import { FONT, T, SIZE } from "../theme";
import { keyClick } from "../lib/sound";
import type { RemoteCursor } from "../hooks/useBrain";

interface BrainSlotProps {
  def: SlotDef;
  value: SlotValue;
  state: SlotState;
  /** Cursor ajeno posado sobre esta región, si lo hay. */
  cursor: RemoteCursor | undefined;
  /** Relevo entre pacientes: nada es editable. */
  locked: boolean;
  editing: boolean;
  draft: string;
  now: number;
  onBeginEdit: () => void;
  onDraftChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

/** Una región de la mente: editable, bloqueable y con el rastro de quien la tocó. */
export function BrainSlot(props: BrainSlotProps) {
  const { def, value, state, cursor, editing, draft, now, locked } = props;

  const cursorColor = cursor?.color ?? T.textMono;
  const secondsLeft = cooldownSecondsLeft(value, now);
  // Dos bloqueos distintos: `onCooldown` es esta región en carne viva (se pinta con la
  // trama diagonal); `locked` es el relevo entre pacientes, que no se pinta pero impide
  // tocar nada.
  const onCooldown = state === "cooldown";
  const clickable = state === "idle" && !editing && !locked;

  const borderColor = cursor
    ? cursorColor
    : state === "flash"
      ? T.slotBorderFlash
      : onCooldown
        ? T.slotBorderCooldown
        : T.slotBorder;

  return (
    <div
      onClick={clickable ? props.onBeginEdit : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                props.onBeginEdit();
              }
            }
          : undefined
      }
      aria-label={`${def.label}: ${value.content}`}
      style={{
        position: "relative",
        gridColumn: `span ${def.span}`,
        border: `1px solid ${borderColor}`,
        background: onCooldown ? T.slotBgCooldown : T.slotBg,
        padding: "10px 13px 9px",
        borderRadius: 2,
        cursor: clickable ? "pointer" : "default",
        fontFamily: FONT.mono,
      }}
    >
      {state === "flash" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            borderRadius: 2,
            animation: "slotFlash 4s ease-out forwards",
          }}
        />
      )}

      {onCooldown && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "repeating-linear-gradient(45deg, transparent 0 7px, rgba(120,150,160,.05) 7px 14px)",
          }}
        />
      )}

      {cursor && (
        <div
          style={{
            position: "absolute",
            top: -11,
            right: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: cursorColor,
            color: T.monitorBg,
            fontSize: SIZE.micro,
            fontWeight: 600,
            letterSpacing: ".04em",
            padding: "2px 8px",
            borderRadius: 2,
            animation: "tagBob 1.2s ease-in-out infinite",
            zIndex: 2,
          }}
        >
          <span>@{cursor.nickname}</span>
          <span
            style={{
              width: 6,
              height: 11,
              background: T.monitorBg,
              animation: "blink .9s steps(1) infinite",
            }}
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          fontSize: SIZE.micro,
          letterSpacing: ".14em",
          marginBottom: 6,
        }}
      >
        <span style={{ color: T.slotLabel }}>{def.label}</span>
        <span
          style={{
            color: cursor ? cursorColor : state === "flash" ? T.amber : T.slotIdleStatus,
            fontWeight: 600,
          }}
        >
          {statusText(state, cursor ? true : false, secondsLeft)}
        </span>
      </div>

      {editing ? (
        <input
          className="slot-input"
          value={draft}
          autoFocus
          maxLength={MAX_SLOT_CHARS}
          aria-label={`Reescribir ${def.label}`}
          onChange={(event) => props.onDraftChange(event.target.value)}
          onBlur={props.onCancel}
          onKeyDown={(event) => {
            if (event.key === "Enter") props.onCommit();
            else if (event.key === "Escape") props.onCancel();
            else if (event.key.length === 1 || event.key === "Backspace") keyClick();
          }}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: T.slotInputBg,
            border: `1px solid ${T.slotInputBorder}`,
            color: "#dff0ee",
            fontFamily: FONT.mono,
            fontSize: SIZE.body,
            padding: "3px 6px",
            borderRadius: 2,
            outline: "none",
          }}
        />
      ) : (
        <div style={{ fontSize: SIZE.body, color: T.slotContent, lineHeight: 1.42, minHeight: 21 }}>
          “{value.content}”
        </div>
      )}

      <div style={{ marginTop: 7, fontSize: SIZE.micro, color: T.textFaint }}>
        {value.editor ? (
          <>
            últ. edición{" "}
            <span style={{ color: value.editorColor || T.textMono }}>@{value.editor}</span> ·{" "}
            {timeAgo(now - value.editedAt)}
          </>
        ) : (
          <>intacto · valor de fábrica</>
        )}
      </div>
    </div>
  );
}

function statusText(state: SlotState, hasCursor: boolean, secondsLeft: number): string {
  if (hasCursor) return "EN EDICIÓN";
  if (state === "flash") return "▲ EDITADO";
  if (state === "cooldown") {
    const m = Math.floor(secondsLeft / 60);
    const s = String(secondsLeft % 60).padStart(2, "0");
    return `BLOQUEADO ${m}:${s}`;
  }
  return "";
}

function timeAgo(ms: number): string {
  const seconds = Math.max(1, Math.round(ms / 1000));
  if (seconds < 60) return `hace ${seconds}s`;
  if (seconds < 3600) return `hace ${Math.round(seconds / 60)} min`;
  return `hace ${Math.round(seconds / 3600)} h`;
}
