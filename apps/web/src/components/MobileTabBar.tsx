import { FONT, T, SIZE } from "../theme";

/** Las cuatro zonas de la sala, como pestañas. El orden es el del quirófano físico. */
export type MobileTab = "pasillo" | "chat" | "mente" | "historial";

const TABS: { id: MobileTab; label: string }[] = [
  { id: "pasillo", label: "PASILLO" },
  { id: "chat", label: "CHAT" },
  { id: "mente", label: "MENTE" },
  { id: "historial", label: "HISTORIAL" },
];

interface MobileTabBarProps {
  active: MobileTab;
  onSelect: (tab: MobileTab) => void;
  /** Novedades desde la última visita a cada pestaña. 0 = sin badge. */
  badges: Record<MobileTab, number>;
  /** Aforo. Se enseña junto al PASILLO, que es la sala de los vivos. */
  online: number;
}

/**
 * La navbar inferior del shell móvil. En flujo flex, no fija: con el teclado
 * virtual abierto queda tapada mientras escribes, que es exactamente lo que debe
 * pasar — una barra `fixed` peleándose con el teclado de iOS pierde siempre.
 */
export function MobileTabBar({ active, onSelect, badges, online }: MobileTabBarProps) {
  return (
    <div
      role="tablist"
      style={{
        flex: "none",
        display: "flex",
        alignItems: "stretch",
        background: T.monitorBg,
        borderTop: `1px solid ${T.monitorBorder}`,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const badge = badges[tab.id];
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.id)}
            style={{
              flex: 1,
              minWidth: 0,
              height: 52,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              background: "transparent",
              border: "none",
              borderTop: `2px solid ${isActive ? T.vital : "transparent"}`,
              color: isActive ? T.textBright : T.textDim,
              fontFamily: FONT.mono,
              fontSize: SIZE.micro,
              letterSpacing: ".1em",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span>
              {tab.label}
              {badge > 0 && (
                <span
                  style={{
                    marginLeft: 4,
                    color: T.amber,
                    fontWeight: 600,
                    verticalAlign: "super",
                    fontSize: 9,
                  }}
                >
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </span>
            {tab.id === "pasillo" && (
              <span style={{ fontSize: 9, color: T.online }}>● {online}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
