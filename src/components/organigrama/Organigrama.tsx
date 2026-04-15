import { useDashboard } from "../../context/DashboardContext";
import { fmt } from "../../lib/format";

/**
 * Organigrama Societario — simplified family tree for the "Mendoza Family
 * Office". Mirrors the structure of the original SVG-based chart but drops
 * the drag/zoom/minimap interactivity (which is ~10 KB of imperative DOM
 * code); the nodes themselves are faithful to the data defined in the
 * original `renderOrganigrama` for views `ale` / `both` / `pab`.
 */
const G1 = "#d97706";
const C1 = "#3b82f6";
const C2 = "#8b5cf6";
const C3 = "#10b981";
const S = "#f59e0b";
const FND = "#ef4444";
const G3 = "#60a5fa";
const G3b = "#a78bfa";
const G3c = "#34d399";

interface NodeData {
  id: string;
  label: string;
  subtitle: string;
  accent: string;
  assets?: Record<string, number>;
  isShared?: boolean;
  isRoot?: boolean;
  /** column index in the grid for its row */
  col: number;
  /** row (generation) */
  row: number;
}

interface EdgeData {
  from: string;
  to: string;
  label?: string;
  color?: string;
}

const ASSET_COLORS: Record<string, string> = {
  RV: "#22c55e",
  RF: "#3b82f6",
  Oro: "#eab308",
  "Inv Alt": "#a855f7",
  Cash: "#64748b",
};

// ── View definitions (nodes & edges per orgView) ──
const VIEWS: Record<"ale" | "both" | "pab", { nodes: NodeData[]; edges: EdgeData[] }> = {
  ale: {
    nodes: [
      {
        id: "alfonso",
        label: "ALFONSO MENDOZA (+2018)",
        subtitle: "Fundador · Persona Física",
        accent: G1,
        isRoot: true,
        row: 0,
        col: 2,
      },
      {
        id: "marialuisa",
        label: "MARÍA LUISA VEGA",
        subtitle: "Usufructuaria · " + fmt(22_500_000),
        accent: G1,
        assets: { RV: 8_200_000, RF: 12_500_000, Oro: 1_800_000 },
        isRoot: true,
        row: 0,
        col: 3,
      },
      {
        id: "carlos",
        label: "CARLOS MENDOZA",
        subtitle: "Persona Física · " + fmt(81_700_000),
        accent: C1,
        assets: { RV: 42_000_000, RF: 18_500_000, Oro: 5_200_000, "Inv Alt": 16_000_000 },
        isRoot: true,
        row: 1,
        col: 1,
      },
      {
        id: "holdingMain",
        label: "MENDOZA FAMILY HOLDING SL",
        subtitle: "CIF: B-12345678 · " + fmt(128_500_000),
        accent: S,
        assets: {
          RV: 62_000_000,
          RF: 28_000_000,
          "Inv Alt": 35_000_000,
          Oro: 3_500_000,
        },
        isShared: true,
        row: 1,
        col: 3,
      },
      {
        id: "holdingRE",
        label: "MENDOZA REAL ESTATE SL",
        subtitle: "Inmobiliario · " + fmt(42_000_000),
        accent: S,
        assets: { "Inv Alt": 42_000_000 },
        isShared: true,
        row: 1,
        col: 5,
      },
      {
        id: "alejandro",
        label: "ALEJANDRO MENDOZA",
        subtitle: "Persona Física · " + fmt(20_000_000),
        accent: G3,
        assets: { RV: 12_000_000, RF: 3_200_000, "Inv Alt": 4_800_000 },
        row: 2,
        col: 0,
      },
      {
        id: "sofia",
        label: "SOFÍA MENDOZA",
        subtitle: "Persona Física · " + fmt(14_500_000),
        accent: G3,
        assets: { RV: 8_500_000, RF: 4_800_000, Oro: 1_200_000 },
        row: 2,
        col: 1,
      },
      {
        id: "alfonsoJr",
        label: "ALFONSO MENDOZA JR.",
        subtitle: "Persona Física · " + fmt(2_000_000),
        accent: G3,
        assets: { RV: 1_200_000, RF: 800_000 },
        row: 3,
        col: 0,
      },
      {
        id: "emma",
        label: "EMMA MENDOZA GARCÍA",
        subtitle: "Persona Física · " + fmt(1_200_000),
        accent: G3,
        assets: { RV: 800_000, RF: 400_000 },
        row: 3,
        col: 1,
      },
      {
        id: "lucas",
        label: "LUCAS MENDOZA GARCÍA",
        subtitle: "Persona Física · " + fmt(1_100_000),
        accent: G3,
        assets: { RV: 600_000, RF: 500_000 },
        row: 3,
        col: 2,
      },
    ],
    edges: [
      { from: "alfonso", to: "marialuisa", label: "Matrimonio", color: G1 },
      { from: "alfonso", to: "carlos", label: "Hijo", color: G1 },
      { from: "marialuisa", to: "carlos", color: G1 },
      { from: "carlos", to: "holdingMain", label: "45 %", color: C1 },
      { from: "carlos", to: "holdingRE", label: "50 %", color: C1 },
      { from: "carlos", to: "alejandro", label: "Hijo", color: C1 },
      { from: "carlos", to: "sofia", label: "Hija", color: C1 },
      { from: "alejandro", to: "alfonsoJr", label: "Hijo", color: G3 },
      { from: "sofia", to: "emma", label: "Hija", color: G3 },
      { from: "sofia", to: "lucas", label: "Hijo", color: G3 },
    ],
  },
  pab: {
    nodes: [
      {
        id: "alfonso",
        label: "ALFONSO MENDOZA (+2018)",
        subtitle: "Fundador · Persona Física",
        accent: G1,
        isRoot: true,
        row: 0,
        col: 2,
      },
      {
        id: "marialuisa",
        label: "MARÍA LUISA VEGA",
        subtitle: "Usufructuaria · " + fmt(22_500_000),
        accent: G1,
        assets: { RV: 8_200_000, RF: 12_500_000, Oro: 1_800_000 },
        isRoot: true,
        row: 0,
        col: 3,
      },
      {
        id: "elena",
        label: "ELENA MENDOZA",
        subtitle: "Persona Física · " + fmt(54_600_000),
        accent: C2,
        assets: { RV: 28_000_000, RF: 14_200_000, Oro: 1_600_000, "Inv Alt": 10_800_000 },
        isRoot: true,
        row: 1,
        col: 1,
      },
      {
        id: "holdingMain",
        label: "MENDOZA FAMILY HOLDING SL",
        subtitle: "30 % · " + fmt(128_500_000),
        accent: S,
        isShared: true,
        row: 1,
        col: 3,
      },
      {
        id: "fundacion",
        label: "FUNDACIÓN MENDOZA",
        subtitle: "Filantrópica · " + fmt(11_000_000),
        accent: FND,
        assets: { RF: 8_500_000, "Inv Alt": 2_500_000 },
        isShared: true,
        row: 1,
        col: 5,
      },
      {
        id: "pablo",
        label: "PABLO MARTÍN MENDOZA",
        subtitle: "Persona Física · " + fmt(13_100_000),
        accent: G3b,
        assets: { RV: 7_200_000, RF: 3_100_000, "Inv Alt": 2_800_000 },
        row: 2,
        col: 0,
      },
      {
        id: "isabel",
        label: "ISABEL MARTÍN MENDOZA",
        subtitle: "Persona Física · " + fmt(8_300_000),
        accent: G3b,
        assets: { RV: 5_500_000, RF: 2_800_000 },
        row: 2,
        col: 1,
      },
      {
        id: "lucia",
        label: "LUCÍA MARTÍN MENDOZA",
        subtitle: "Persona Física · " + fmt(7_100_000),
        accent: G3b,
        assets: { RV: 4_200_000, RF: 2_100_000, Oro: 800_000 },
        row: 2,
        col: 2,
      },
    ],
    edges: [
      { from: "alfonso", to: "marialuisa", label: "Matrimonio", color: G1 },
      { from: "alfonso", to: "elena", label: "Hija", color: G1 },
      { from: "marialuisa", to: "elena", color: G1 },
      { from: "elena", to: "holdingMain", label: "30 %", color: C2 },
      { from: "elena", to: "fundacion", label: "Patrona", color: C2 },
      { from: "elena", to: "pablo", label: "Hijo", color: C2 },
      { from: "elena", to: "isabel", label: "Hija", color: C2 },
      { from: "elena", to: "lucia", label: "Hija", color: C2 },
    ],
  },
  both: { nodes: [], edges: [] },
};
// Populate `both` as the union of ale + pab minus duplicates on `id`
{
  const seen = new Set<string>();
  const nodes: NodeData[] = [];
  [...VIEWS.ale.nodes, ...VIEWS.pab.nodes].forEach((n) => {
    if (seen.has(n.id)) return;
    seen.add(n.id);
    // Remap columns to distribute Carlos (left) and Elena (right) branches
    nodes.push({ ...n });
  });
  const edges = [...VIEWS.ale.edges, ...VIEWS.pab.edges];
  VIEWS.both.nodes = nodes;
  VIEWS.both.edges = edges;
}

const NODE_W = 200;
const NODE_H_GAP = 26;
const ROW_GAP = 180;
const COL_GAP = 32;

export function Organigrama() {
  const { state, set } = useDashboard();
  const view = VIEWS[state.orgView];

  // Compute grid positions per row
  const byRow = new Map<number, NodeData[]>();
  view.nodes.forEach((n) => {
    if (!byRow.has(n.row)) byRow.set(n.row, []);
    byRow.get(n.row)!.push(n);
  });
  // Sort each row by col
  byRow.forEach((ns) => ns.sort((a, b) => a.col - b.col));

  // Normalise positions to a 0-indexed packed column layout
  const positions = new Map<string, { x: number; y: number }>();
  byRow.forEach((ns, row) => {
    const rowWidth = ns.length * NODE_W + (ns.length - 1) * COL_GAP;
    const rowStart = -rowWidth / 2;
    ns.forEach((n, i) => {
      positions.set(n.id, {
        x: rowStart + i * (NODE_W + COL_GAP),
        y: row * ROW_GAP,
      });
    });
  });

  const maxRow = Math.max(...Array.from(byRow.keys()));
  const chartHeight = (maxRow + 1) * ROW_GAP + NODE_H_GAP + 100;

  return (
    <div id="organigrama" className="tab-content active">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
          Organigrama Societario — Mendoza Family Office 2026
        </h2>
        <div style={{ display: "flex", gap: 0 }}>
          <OrgBtn
            active={state.orgView === "ale"}
            onClick={() => set("orgView", "ale")}
            position="left"
          >
            Carlos Mendoza
          </OrgBtn>
          <OrgBtn
            active={state.orgView === "both"}
            onClick={() => set("orgView", "both")}
            position="mid"
          >
            Ambos
          </OrgBtn>
          <OrgBtn
            active={state.orgView === "pab"}
            onClick={() => set("orgView", "pab")}
            position="right"
          >
            Elena Mendoza
          </OrgBtn>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: chartHeight,
          overflow: "auto",
          border: "1px solid #1e293b",
          borderRadius: 12,
          background: "radial-gradient(circle at 50% 50%,#0f172a 0%,#020617 100%)",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "fit-content",
            margin: "0 auto",
            minWidth: "100%",
            minHeight: chartHeight,
          }}
        >
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: Math.max(...Array.from(byRow.values()).map((ns) => ns.length)) *
                (NODE_W + COL_GAP),
              height: chartHeight,
              pointerEvents: "none",
              overflow: "visible",
            }}
          >
            {view.edges.map((e, i) => {
              const from = positions.get(e.from);
              const to = positions.get(e.to);
              if (!from || !to) return null;
              const x1 = from.x + NODE_W / 2 + NODE_W / 2;
              const y1 = from.y + 70;
              const x2 = to.x + NODE_W / 2 + NODE_W / 2;
              const y2 = to.y;
              const midY = (y1 + y2) / 2;
              return (
                <g key={i}>
                  <path
                    d={`M ${x1},${y1} C ${x1},${midY} ${x2},${midY} ${x2},${y2}`}
                    stroke={e.color || "#475569"}
                    strokeWidth={1.5}
                    fill="none"
                    opacity={0.6}
                  />
                  {e.label && (
                    <text
                      x={(x1 + x2) / 2}
                      y={midY - 4}
                      fill="#94a3b8"
                      fontSize={10}
                      textAnchor="middle"
                      fontWeight={600}
                    >
                      {e.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {view.nodes.map((n) => {
            const pos = positions.get(n.id);
            if (!pos) return null;
            return (
              <div
                key={n.id}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${pos.x}px)`,
                  top: pos.y,
                  width: NODE_W,
                  border: n.isShared ? "2px solid #f59e0b" : `1px solid ${n.accent}55`,
                  borderRadius: 12,
                  background: n.isRoot
                    ? `linear-gradient(145deg,${n.accent}18,${n.accent}06)`
                    : "rgba(15,23,42,0.92)",
                  boxShadow: n.isRoot
                    ? `0 6px 24px ${n.accent}20,0 2px 6px rgba(0,0,0,0.4)`
                    : "0 4px 12px rgba(0,0,0,0.4)",
                  zIndex: 5,
                }}
              >
                <div
                  style={{
                    padding: "10px 12px 6px",
                    borderBottom: `1px solid ${n.accent}22`,
                  }}
                >
                  <div
                    style={{
                      fontSize: n.isRoot ? 12 : 10.5,
                      fontWeight: 700,
                      color: "#f1f5f9",
                      textAlign: "center",
                      lineHeight: 1.3,
                    }}
                  >
                    {n.label}
                  </div>
                  {n.subtitle && (
                    <div
                      style={{
                        fontSize: 9,
                        color: n.accent,
                        textAlign: "center",
                        marginTop: 2,
                        fontWeight: 600,
                      }}
                    >
                      {n.subtitle}
                    </div>
                  )}
                </div>
                {n.assets && (
                  <div style={{ padding: "6px 8px 8px" }}>
                    {Object.entries(n.assets).map(([k, v], i) => (
                      <div
                        key={k}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "2.5px 5px",
                          borderRadius: 4,
                          background: i % 2 === 0 ? "rgba(30,41,59,0.4)" : "transparent",
                          fontSize: 9.5,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: ASSET_COLORS[k] || "#94a3b8",
                          }}
                        />
                        <span style={{ color: "#cbd5e1", flex: 1 }}>{k}</span>
                        <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                          €{(v / 1e6).toFixed(1)}M
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OrgBtn({
  active,
  onClick,
  children,
  position,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  position: "left" | "mid" | "right";
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        fontSize: 12,
        border: "1px solid #334155",
        background: active ? "#3b82f6" : "#1e293b",
        color: active ? "#fff" : "#94a3b8",
        cursor: "pointer",
        borderRadius:
          position === "left" ? "6px 0 0 6px" : position === "right" ? "0 6px 6px 0" : 0,
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}
