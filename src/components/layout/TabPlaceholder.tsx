interface Props {
  id: string;
  title: string;
  phase: string;
}

/**
 * Stub shown for tabs that haven't been ported yet. Disappears as each tab
 * is built out in its corresponding fase.
 */
export function TabPlaceholder({ id, title, phase }: Props) {
  return (
    <div id={id} className="tab-content active">
      <div className="chart-row chart-full">
        <div className="chart-box">
          <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
            ⏳ Esta sección se portará en <strong>{phase}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
