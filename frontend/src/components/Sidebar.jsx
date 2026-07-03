import MultiSelect from "./MultiSelect";
import { RotateCcw } from "lucide-react";

export default function Sidebar({ filterOptions, filters, setFilters, onReset, resultCount }) {
  const set = (key) => (value) => setFilters((f) => ({ ...f, [key]: value }));

  const activeCount = Object.values(filters).filter((v) =>
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  ).length;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <div className="sidebar-eyebrow">Filters</div>
          <div className="sidebar-count">
            {resultCount !== null ? `${resultCount.toLocaleString()} records` : "—"}
          </div>
        </div>
        {activeCount > 0 && (
          <button className="sidebar-reset" onClick={onReset} type="button">
            <RotateCcw size={12} /> reset ({activeCount})
          </button>
        )}
      </div>

      <div className="sidebar-scroll">
        <div className="filter-field">
          <div className="filter-label-row">
            <label className="filter-label">End year</label>
            {filters.end_year && (
              <button className="filter-clear" onClick={() => set("end_year")(null)}>
                clear
              </button>
            )}
          </div>
          <select
            className="filter-select"
            value={filters.end_year || ""}
            onChange={(e) => set("end_year")(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All</option>
            {filterOptions.end_year.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <MultiSelect
          label="Topics"
          options={filterOptions.topic}
          selected={filters.topic}
          onChange={set("topic")}
        />

        <MultiSelect
          label="Sector"
          options={filterOptions.sector}
          selected={filters.sector}
          onChange={set("sector")}
        />

        <MultiSelect
          label="Region"
          options={filterOptions.region}
          selected={filters.region}
          onChange={set("region")}
        />

        <MultiSelect
          label="PEST category"
          options={filterOptions.pestle}
          selected={filters.pestle}
          onChange={set("pestle")}
        />

        <MultiSelect
          label="Source"
          options={filterOptions.source}
          selected={filters.source}
          onChange={set("source")}
        />

        <MultiSelect
          label="Country"
          options={filterOptions.country}
          selected={filters.country}
          onChange={set("country")}
        />

        <MultiSelect
          label="City"
          options={[]}
          selected={[]}
          onChange={() => {}}
          disabled
          disabledHint="Not present in source data"
        />

        <MultiSelect
          label="SWOT"
          options={[]}
          selected={[]}
          onChange={() => {}}
          disabled
          disabledHint="Not present in source data"
        />
      </div>

      <div className="sidebar-footnote">
        City and SWOT fields don&apos;t exist in the underlying dataset — shown
        disabled rather than faked.
      </div>
    </aside>
  );
}
