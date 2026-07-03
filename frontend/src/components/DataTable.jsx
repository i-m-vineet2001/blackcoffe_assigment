import { ChevronLeft, ChevronRight } from "lucide-react";

const PILL_COLOR = {
  high: "var(--rust)",
  mid: "var(--amber)",
  low: "var(--green)",
};

function intensityTone(v) {
  if (v === null || v === undefined) return null;
  if (v >= 12) return "high";
  if (v >= 6) return "mid";
  return "low";
}

export default function DataTable({ records, total, page, pageSize, onPageChange, loading }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="table-wrap">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Sector</th>
              <th>Country</th>
              <th>Region</th>
              <th>Topic</th>
              <th>PEST</th>
              <th>End year</th>
              <th>Intensity</th>
              <th>Likelihood</th>
              <th>Relevance</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={10} className="table-empty">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && records.length === 0 && (
              <tr>
                <td colSpan={10} className="table-empty">
                  No records match the current filters
                </td>
              </tr>
            )}
            {!loading &&
              records.map((r, i) => {
                const tone = intensityTone(r.intensity);
                return (
                  <tr key={i}>
                    <td className="table-title-cell" title={r.title}>
                      {r.title}
                    </td>
                    <td>{r.sector || "—"}</td>
                    <td>{r.country || "—"}</td>
                    <td>{r.region || "—"}</td>
                    <td>{r.topic || "—"}</td>
                    <td>{r.pestle || "—"}</td>
                    <td className="mono">{r.end_year ?? "—"}</td>
                    <td className="mono">
                      {tone && (
                        <span className="pill" style={{ background: `color-mix(in srgb, ${PILL_COLOR[tone]} 18%, transparent)`, color: PILL_COLOR[tone] }}>
                          {r.intensity}
                        </span>
                      )}
                      {!tone && "—"}
                    </td>
                    <td className="mono">{r.likelihood ?? "—"}</td>
                    <td className="mono">{r.relevance ?? "—"}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span className="table-footer-count">
          Page {page} of {totalPages} · {total.toLocaleString()} total
        </span>
        <div className="table-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
