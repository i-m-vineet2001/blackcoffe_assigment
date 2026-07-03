import { useId } from "react";

/**
 * Instrument-panel style arc gauge. Signature element of the dashboard:
 * reads the three headline metrics (intensity / likelihood / relevance)
 * as dial readouts rather than flat KPI numbers.
 */
export default function Gauge({ label, value, max, color, unit = "", helpText }) {
  const gradId = useId();
  const size = 132;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // 270 degree sweep, starting at -225deg (bottom-left) going clockwise
  const startAngle = -225;
  const sweep = 270;
  const pct = Math.max(0, Math.min(1, (value || 0) / max));
  const valueAngle = startAngle + sweep * pct;

  const polarToCartesian = (angleDeg) => {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const arcPath = (fromAngle, toAngle) => {
    const start = polarToCartesian(fromAngle);
    const end = polarToCartesian(toAngle);
    const largeArc = toAngle - fromAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  // Tick marks every 10% of the range
  const ticks = Array.from({ length: 11 }, (_, i) => startAngle + sweep * (i / 10));

  return (
    <div className="gauge">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* track */}
        <path
          d={arcPath(startAngle, startAngle + sweep)}
          fill="none"
          stroke="var(--grid-line)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        {/* ticks */}
        {ticks.map((a, i) => {
          const inner = polarToCartesian(a);
          const a2 = ((a - 90) * Math.PI) / 180;
          const outerR = r + stroke / 2 + 4;
          const ox = cx + outerR * Math.cos(a2);
          const oy = cy + outerR * Math.sin(a2);
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={ox}
              y2={oy}
              stroke="var(--text-faint)"
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}

        {/* value arc */}
        {pct > 0 && (
          <path
            d={arcPath(startAngle, valueAngle)}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        )}

        {/* needle hub */}
        <circle cx={cx} cy={cy} r={3} fill={color} />

        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="22"
          fontWeight="500"
          fill="var(--text-primary)"
        >
          {value}
          <tspan fontSize="12" fill="var(--text-muted)">{unit}</tspan>
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="9"
          fill="var(--text-faint)"
          letterSpacing="1"
        >
          / {max}
        </text>
      </svg>
      <div className="gauge-label">{label}</div>
      {helpText && <div className="gauge-help">{helpText}</div>}
    </div>
  );
}
