import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { ChartTooltip } from "./TrendChart";

const PALETTE = ["#e8a33d", "#e0954a", "#d78657", "#cf7864", "#c66971", "#be5b7e", "#b54c8b"];

export default function TopicsChart({ data, onBarClick, activeTopics = [] }) {
  if (!data.length) return <div className="chart-empty">No data for this filter combination</div>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
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
          dataKey="topic"
          stroke="var(--text-faint)"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar
          dataKey="count"
          name="Records"
          radius={[0, 4, 4, 0]}
          cursor="pointer"
          onClick={(d) => onBarClick && onBarClick(d.topic)}
        >
          {data.map((entry, i) => (
            <Cell
              key={entry.topic}
              fill={PALETTE[i % PALETTE.length]}
              opacity={
                activeTopics.length === 0 || activeTopics.includes(entry.topic) ? 1 : 0.25
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
