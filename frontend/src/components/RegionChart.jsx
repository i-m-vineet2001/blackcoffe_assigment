import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartTooltip } from "./TrendChart";

export default function RegionChart({ data }) {
  if (!data.length) return <div className="chart-empty">No data for this filter combination</div>;

  const top = data.slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={top} margin={{ top: 8, right: 12, left: -12, bottom: 32 }} barGap={2}>
        <CartesianGrid stroke="var(--grid-line)" vertical={false} />
        <XAxis
          dataKey="region"
          stroke="var(--text-faint)"
          tick={{ fill: "var(--text-muted)", fontSize: 10 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
          angle={-30}
          textAnchor="end"
          interval={0}
          height={60}
        />
        <YAxis
          stroke="var(--text-faint)"
          tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }} iconType="circle" iconSize={8} />
        <Bar dataKey="avg_intensity" name="Avg intensity" fill="var(--amber)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="avg_likelihood" name="Avg likelihood" fill="var(--blue)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
