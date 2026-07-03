import { useEffect, useMemo, useState } from "react";
import { Radar } from "lucide-react";
import "./App.css";
import { api } from "./lib/api";
import Sidebar from "./components/Sidebar";
import KpiRow from "./components/KpiRow";
import Panel from "./components/Panel";
import TrendChart from "./components/TrendChart";
import TopicsChart from "./components/TopicsChart";
import RegionChart from "./components/RegionChart";
import PestleDonut from "./components/PestleDonut";
import SectorChart from "./components/SectorChart";
import IntensityScatter from "./components/IntensityScatter";
import WorldMap from "./components/WorldMap";
import DataTable from "./components/DataTable";

const EMPTY_FILTERS = {
  end_year: null,
  topic: [],
  sector: [],
  region: [],
  pestle: [],
  source: [],
  country: [],
};

export default function App() {
  const [filterOptions, setFilterOptions] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [summary, setSummary] = useState(null);
  const [byYear, setByYear] = useState([]);
  const [topics, setTopics] = useState([]);
  const [region, setRegion] = useState([]);
  const [pestle, setPestle] = useState([]);
  const [sector, setSector] = useState([]);
  const [countryStats, setCountryStats] = useState([]);
  const [scatter, setScatter] = useState([]);
  const [apiError, setApiError] = useState(null);

  const [page, setPage] = useState(1);
  const [records, setRecords] = useState({ results: [], total: 0 });
  const [tableLoading, setTableLoading] = useState(false);

  // Load filter option lists once.
  useEffect(() => {
    api
      .filterOptions()
      .then(setFilterOptions)
      .catch((e) => setApiError(e.message));
  }, []);

  // Reload all chart data whenever filters change.
  useEffect(() => {
    setApiError(null);
    Promise.all([
      api.summary(filters),
      api.byYear(filters),
      api.topics(filters),
      api.region(filters),
      api.pestle(filters),
      api.sector(filters),
      api.country(filters),
      api.intensityLikelihood(filters),
    ])
      .then(([s, by, t, r, p, sec, c, sc]) => {
        setSummary(s);
        setByYear(by);
        setTopics(t);
        setRegion(r);
        setPestle(p);
        setSector(sec);
        setCountryStats(c);
        setScatter(sc);
      })
      .catch((e) => setApiError(e.message));
    setPage(1);
  }, [filters]);

  // Reload table when filters or page change.
  useEffect(() => {
    setTableLoading(true);
    api
      .records(filters, page, 20)
      .then(setRecords)
      .catch((e) => setApiError(e.message))
      .finally(() => setTableLoading(false));
  }, [filters, page]);

  const toggleTopic = (topic) => {
    setFilters((f) => {
      const has = f.topic.includes(topic);
      return { ...f, topic: has ? f.topic.filter((t) => t !== topic) : [...f.topic, topic] };
    });
  };

  const toggleCountry = (country) => {
    setFilters((f) => {
      const has = f.country.includes(country);
      return { ...f, country: has ? f.country.filter((c) => c !== country) : [...f.country, country] };
    });
  };

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.end_year) chips.push({ key: "end_year", label: `Year: ${filters.end_year}` });
    ["topic", "sector", "region", "pestle", "source", "country"].forEach((k) => {
      filters[k].forEach((v) => chips.push({ key: k, value: v, label: v }));
    });
    return chips;
  }, [filters]);

  if (apiError) {
    return (
      <div className="error-screen">
        <Radar size={28} />
        <h2>Can&apos;t reach the API</h2>
        <p>{apiError}</p>
        <p className="error-hint">
          Make sure the FastAPI backend is running and <code>MONGODB_URI</code> in{" "}
          <code>backend/.env</code> points to a real, reachable MongoDB instance.
        </p>
      </div>
    );
  }

  if (!filterOptions) {
    return <div className="loading-screen">Loading dashboard…</div>;
  }

  return (
    <div className="app-shell">
      <Sidebar
        filterOptions={filterOptions}
        filters={filters}
        setFilters={setFilters}
        onReset={resetFilters}
        resultCount={summary ? summary.count : null}
      />

      <main className="main">
        <header className="topbar">
          <div className="topbar-title-block">
            <div className="topbar-eyebrow">
              <Radar size={14} /> Global Signals
            </div>
            <h1 className="topbar-title">Insights Dashboard</h1>
          </div>
          <p className="topbar-subtitle">
            Intensity, likelihood, and relevance across {filterOptions.topic.length} topics and{" "}
            {filterOptions.country.length} countries.
          </p>
        </header>

        {activeFilterChips.length > 0 && (
          <div className="active-chips">
            {activeFilterChips.map((c, i) => (
              <span key={`${c.key}-${c.value || i}`} className="active-chip">
                {c.label}
              </span>
            ))}
          </div>
        )}

        <KpiRow summary={summary} />

        <div className="grid">
          <Panel title="Signal trend" subtitle="Averages by end year" span={2}>
            <TrendChart data={byYear} />
          </Panel>

          <Panel title="PEST distribution" subtitle="Share of records by category">
            <PestleDonut data={pestle} />
          </Panel>

          <Panel
            title="Top topics"
            subtitle="Click a bar to filter"
          >
            <TopicsChart data={topics} onBarClick={toggleTopic} activeTopics={filters.topic} />
          </Panel>

          <Panel title="Regional comparison" subtitle="Intensity vs. likelihood, top 8 regions">
            <RegionChart data={region} />
          </Panel>

          <Panel title="Sector relevance" subtitle="Average relevance, top 10 sectors">
            <SectorChart data={sector} />
          </Panel>

          <Panel
            title="Intensity vs. likelihood"
            subtitle="Each point is one record, colored by sector"
            span={2}
          >
            <IntensityScatter data={scatter} />
          </Panel>

          <Panel
            title="Intensity by country"
            subtitle="Click a country to filter · darker = higher intensity"
            span={2}
          >
            <WorldMap
              countryStats={countryStats}
              onCountryClick={toggleCountry}
              activeCountries={filters.country}
            />
          </Panel>

          <Panel title="Records" subtitle="Underlying rows for the current filter set" span={3}>
            <DataTable
              records={records.results}
              total={records.total}
              page={page}
              pageSize={20}
              onPageChange={setPage}
              loading={tableLoading}
            />
          </Panel>
        </div>
      </main>
    </div>
  );
}
