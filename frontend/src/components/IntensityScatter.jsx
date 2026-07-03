import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const SECTOR_COLORS = {};
const PALETTE = ["#e8a33d", "#5b8def", "#3ddc97", "#e8624f", "#b54c8b", "#4fb8e8", "#c9c25f", "#8f7de8"];

function colorFor(sector) {
  if (!SECTOR_COLORS[sector]) {
    const idx = Object.keys(SECTOR_COLORS).length % PALETTE.length;
    SECTOR_COLORS[sector] = PALETTE[idx];
  }
  return SECTOR_COLORS[sector];
}

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title" style={{ maxWidth: 220, whiteSpace: "normal" }}>
        {d.title}
      </div>
      <div className="chart-tooltip-row">
        <span className="chart-tooltip-label">Sector</span>
        <span className="chart-tooltip-value">{d.sector || "—"}</span>
      </div>
      <div className="chart-tooltip-row">
        <span className="chart-tooltip-label">Intensity</span>
        <span className="chart-tooltip-value">{d.intensity}</span>
      </div>
      <div className="chart-tooltip-row">
        <span className="chart-tooltip-label">Likelihood</span>
        <span className="chart-tooltip-value">{d.likelihood}</span>
      </div>
    </div>
  );
}

export default function IntensityScatter({ data }) {
  if (!data.length) return <div className="chart-empty">No data for this filter combination</div>;

  // group by sector so Recharts can color per-series
  const bySector = {};
  data.forEach((d) => {
    const key = d.sector || "Unspecified";
    if (!bySector[key]) bySector[key] = [];
    bySector[key].push(d);
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid-line)" />
        <XAxis
          type="number"
          dataKey="intensity"
          name="Intensity"
          stroke="var(--text-faint)"
          tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
          label={{ value: "Intensity", position: "insideBottom", offset: -2, fill: "var(--text-faint)", fontSize: 11 }}
        />
        <YAxis
          type="number"
          dataKey="likelihood"
          name="Likelihood"
          stroke="var(--text-faint)"
          tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
          label={{ value: "Likelihood", angle: -90, position: "insideLeft", fill: "var(--text-faint)", fontSize: 11 }}
        />
        <ZAxis range={[36, 36]} />
        <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "var(--border)" }} />
        {Object.entries(bySector).map(([sector, points]) => (
          <Scatter key={sector} name={sector} data={points} fill={colorFor(sector)} fillOpacity={0.7} />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
