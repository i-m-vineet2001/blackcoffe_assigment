import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";

// A handful of country-name mismatches between the dataset (Natural Earth
// long-form names) and the bundled world-atlas topojson (Natural Earth
// short-form names).
const NAME_ALIASES = {
  "South Sudan": "S. Sudan",
};

export default function WorldMap({ countryStats, onCountryClick, activeCountries = [] }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [geographies, setGeographies] = useState(null);
  const [dims, setDims] = useState({ width: 600, height: 340 });
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    fetch("/data/world-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        const geo = feature(topo, topo.objects.countries);
        setGeographies(geo.features);
      });
  }, []);

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setDims({ width: w, height: Math.round(w * 0.52) });
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  if (!geographies) {
    return <div className="chart-empty">Loading map…</div>;
  }

  const statsByCountry = {};
  countryStats.forEach((c) => {
    statsByCountry[c.country] = c;
  });

  const values = countryStats.map((c) => c.avg_intensity).filter((v) => v > 0);
  const maxIntensity = values.length ? Math.max(...values) : 1;
  const colorScale = d3
    .scaleSequential()
    .domain([0, maxIntensity])
    .interpolator(d3.interpolateRgbBasis(["#182543", "#8a6a2f", "#e8a33d", "#e8624f"]));

  const projection = geoNaturalEarth1().fitSize([dims.width, dims.height], {
    type: "FeatureCollection",
    features: geographies,
  });
  const path = geoPath(projection);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <svg ref={svgRef} width={dims.width} height={dims.height}>
        <g>
          {geographies.map((geo) => {
            const rawName = geo.properties.name;
            const reverseAlias = Object.entries(NAME_ALIASES).find(([, v]) => v === rawName);
            const dataName = reverseAlias ? reverseAlias[0] : rawName;
            const stat = statsByCountry[dataName] || statsByCountry[rawName];
            const hasData = Boolean(stat);
            const isActive =
              activeCountries.length === 0 || activeCountries.includes(dataName);
            const fill = hasData ? colorScale(stat.avg_intensity) : "#182029";

            return (
              <path
                key={geo.id || rawName}
                d={path(geo)}
                fill={fill}
                stroke="var(--bg)"
                strokeWidth={0.6}
                opacity={hasData ? (isActive ? 1 : 0.3) : 0.5}
                style={{ cursor: hasData ? "pointer" : "default", transition: "opacity 0.15s" }}
                onMouseEnter={() => hasData && setHovered({ name: dataName, stat })}
                onMouseLeave={() => setHovered(null)}
                onClick={() => hasData && onCountryClick && onCountryClick(dataName)}
              />
            );
          })}
        </g>
      </svg>

      {hovered && (
        <div className="map-tooltip">
          <div className="chart-tooltip-title">{hovered.name}</div>
          <div className="chart-tooltip-row">
            <span className="chart-tooltip-label">Records</span>
            <span className="chart-tooltip-value">{hovered.stat.count}</span>
          </div>
          <div className="chart-tooltip-row">
            <span className="chart-tooltip-label">Avg intensity</span>
            <span className="chart-tooltip-value">{hovered.stat.avg_intensity}</span>
          </div>
          <div className="chart-tooltip-row">
            <span className="chart-tooltip-label">Avg likelihood</span>
            <span className="chart-tooltip-value">{hovered.stat.avg_likelihood}</span>
          </div>
        </div>
      )}

      <div className="map-legend">
        <span>Low intensity</span>
        <div className="map-legend-gradient" />
        <span>High intensity</span>
      </div>
    </div>
  );
}
