import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ChartTooltip } from "./TrendChart";

const PALETTE = ["#e8a33d", "#5b8def", "#3ddc97", "#e8624f", "#b54c8b", "#4fb8e8", "#c9c25f", "#8f7de8", "#5fd6c2"];

export default function PestleDonut({ data }) {
  if (!data.length) return <div className="chart-empty">No data for this filter combination</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="pestle"
          innerRadius={62}
          outerRadius={100}
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell key={entry.pestle} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ fontSize: 11, color: "var(--text-muted)" }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
