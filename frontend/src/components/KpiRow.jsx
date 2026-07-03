import Gauge from "./Gauge";

export default function KpiRow({ summary }) {
  if (!summary) return null;
  return (
    <div className="kpi-row">
      <div className="kpi-card kpi-card-count">
        <div className="kpi-count">{summary.count.toLocaleString()}</div>
        <div className="kpi-count-label">records in view</div>
        <div className="kpi-subrow">
          <div>
            <span className="kpi-subvalue">{summary.country_count}</span>
            <span className="kpi-sublabel">countries</span>
          </div>
          <div>
            <span className="kpi-subvalue">{summary.topic_count}</span>
            <span className="kpi-sublabel">topics</span>
          </div>
        </div>
      </div>

      <div className="kpi-card kpi-card-gauges">
        <Gauge label="Intensity" value={summary.avg_intensity} max={20} color="var(--amber)" />
        <Gauge label="Likelihood" value={summary.avg_likelihood} max={5} color="var(--blue)" />
        <Gauge label="Relevance" value={summary.avg_relevance} max={5} color="var(--green)" />
      </div>
    </div>
  );
}
