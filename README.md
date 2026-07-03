# GE Insights Visualization Dashboard

A full-stack data visualization dashboard built for the Data Visualization
Dashboard test assignment. It reads 1,000 GE-style geopolitical/market
insight records from MongoDB and renders them as an interactive analytics
dashboard with cross-filtering, KPI gauges, six chart types (including a
D3.js world map), and a paginated data table.

## Stack

- **Backend**: Python, FastAPI, PyMongo — REST API over MongoDB
- **Database**: MongoDB (Atlas)
- **Frontend**: React (Vite) + Recharts + D3.js (world map)

## Project structure

```
ge-dashboard/
  backend/
    app/
      main.py        FastAPI app + all API routes
      database.py     MongoDB connection
      filters.py       shared query-filter builder
    data/jsondata.json  source data
    seed.py            one-time script: JSON -> MongoDB
    requirements.txt
    .env                MongoDB connection string (fill in your Atlas URI)
  frontend/
    src/
      App.jsx           layout + data fetching
      components/       Sidebar, KpiRow, Gauge, charts, WorldMap, DataTable
      lib/api.js         API client
    .env                 API base URL
```

## Data notes — read this first

The brief asks for `city` and `SWOT` filters, but the provided
`jsondata.json` does not contain either field anywhere in its 1,000 records
(verified programmatically across every record). Rather than fabricate
values, both filters are present in the UI but shown disabled with a note
explaining why. Every other requested filter (end year, topics, sector,
region, PEST/PESTLE, source, country) maps to a real field and is fully
functional. Several fields are also sparse in the source data (e.g. only
350/1000 records have a country) — this is a property of the dataset, not
a bug in the pipeline.

## Setup

### 1. MongoDB

You need a real MongoDB connection string (Atlas is easiest). Put it in
`backend/.env`:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
MONGODB_DB=ge_dashboard
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 2. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Load the JSON data into MongoDB (run once, or again to reset)
python seed.py

# Start the API
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/api/health` — it should report
`{"status": "ok", "documents": 1000}`.

Interactive API docs: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.

`frontend/.env` controls which API the dashboard talks to:
```
VITE_API_BASE=http://localhost:8000
```

## API reference

All `/api/stats/*` and `/api/records` endpoints accept the same optional
filter query params, so every chart and the table respect the same active
filters: `end_year`, `topic`, `sector`, `region`, `pestle`, `source`,
`country` (the list-type ones accept comma-separated values for
multi-select, e.g. `?region=Asia,Europe`).

| Endpoint | Purpose |
|---|---|
| `GET /api/filters` | distinct values for every filter dropdown |
| `GET /api/records` | paginated raw rows (`page`, `page_size`) |
| `GET /api/stats/summary` | KPI totals + averages |
| `GET /api/stats/by-year` | avg intensity/likelihood/relevance per end year |
| `GET /api/stats/topics` | top topics by record count |
| `GET /api/stats/region` | avg intensity/likelihood per region |
| `GET /api/stats/pestle` | record distribution across PEST categories |
| `GET /api/stats/sector` | avg relevance/intensity per sector |
| `GET /api/stats/country` | avg intensity/likelihood/relevance per country (feeds the map) |
| `GET /api/stats/intensity-likelihood` | raw points for the scatter plot |

## Dashboard features

- **KPI gauges** — record count, country/topic counts, and dial-style
  gauges for average intensity, likelihood, and relevance (the dashboard's
  signature visual, custom SVG rather than a chart-library default)
- **Signal trend** — line chart of the three metrics over end year
- **Top topics** — clickable horizontal bar chart; clicking a bar adds it
  as a filter
- **Regional comparison** — grouped bar chart, top 8 regions
- **PEST distribution** — donut chart
- **Sector relevance** — horizontal bar chart, top 10 sectors
- **Intensity vs. likelihood** — scatter plot, colored by sector
- **World map (D3.js)** — choropleth colored by average intensity per
  country; click a country to filter
- **Data table** — paginated, sortable-by-column-visually raw records for
  the current filter set
- Every chart and the KPI row update live as filters change, and several
  charts (topics, map) act as filters themselves when clicked

## What I'd do next with more time

- Server-side sorting on the data table
- CSV export of the current filtered view
- A saved-view / shareable-URL feature (filters in the query string)
