import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartTooltip } from "./TrendChart";

export default function SectorChart({ data }) {
  if (!data.length) return <div className="chart-empty">No data for this filter combination</div>;
  const top = data.slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={top}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
        barCategoryGap={6}
      >
        <CartesianGrid stroke="var(--grid-line)" horizontal={false} />
        <XAxis
          type="number"
          stroke="var(--text-faint)"
          tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="sector"
          stroke="var(--text-faint)"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={130}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="avg_relevance" name="Avg relevance" fill="var(--green)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
