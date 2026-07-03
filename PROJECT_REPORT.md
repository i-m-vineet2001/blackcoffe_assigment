# GE Insights Visualization Dashboard

## What this project is

This repository contains a full-stack data visualization dashboard built as a test assignment for a GE-style geopolitical and market insights dataset. The dashboard reads 1,000 records from MongoDB and exposes an interactive analytics UI with cross-filtering, KPI gauges, charts, a D3 world map, and a paginated data table.

## Why it was developed

The project was developed to demonstrate a complete end-to-end analytics experience:

- Backend API design with filtered aggregation queries
- Data modeling and ingestion into MongoDB
- Interactive frontend visualization with React, Recharts, and D3
- Cross-filtering between charts and the data table
- Support for real dataset limitations rather than fabricated fields

This is a portfolio-style assignment to show how a full-stack dashboard can be implemented from JSON source data to a live React/Vite frontend.

## Development motive

The main motive is to build a usable analytical dashboard for a structured insights dataset, while satisfying the assignment requirements for a variety of chart types, filters, and interactive behavior.

Key motives include:

- Surface meaningful business insights from raw insight records
- Build a dashboard that is easy to use and visually informative
- Keep the frontend and backend decoupled through a REST API
- Preserve data fidelity by not inventing missing fields (`city` and `SWOT` are disabled when absent)
- Show real-world data engineering patterns such as seeding, filtering, aggregation, and chart-driven action

## Architecture overview

### Backend

Location: `backend/`

- `backend/app/main.py` — FastAPI application with REST endpoints
- `backend/app/database.py` — MongoDB connection helper using environment variables
- `backend/app/filters.py` — Shared filter builder that converts query params into MongoDB queries
- `backend/seed.py` — Script to load `backend/data/jsondata.json` into MongoDB
- `backend/requirements.txt` — Python dependencies

The backend exposes endpoints for:

- `/api/health` — service health and document count
- `/api/filters` — distinct values for every filter dropdown
- `/api/records` — paginated raw rows for the table
- `/api/stats/summary` — KPIs and averages
- `/api/stats/by-year` — trend metrics by end year
- `/api/stats/topics` — top topics by count
- `/api/stats/region` — average metrics by region
- `/api/stats/pestle` — distribution over PEST/PESTLE categories
- `/api/stats/sector` — sector-level metrics
- `/api/stats/country` — country-level averages for the world map
- `/api/stats/intensity-likelihood` — scatter-plot raw points

The backend uses MongoDB aggregation pipelines to compute the chart and summary data efficiently.

### Frontend

Location: `frontend/`

- `frontend/src/App.jsx` — root application that loads filter values, chart data, and the record table
- `frontend/src/lib/api.js` — Axios client and query serialization logic
- `frontend/src/components/Sidebar.jsx` — filter panel and reset behavior
- `frontend/src/components/*` — reusable UI components for KPI row, charts, world map, and table
- `frontend/package.json` — frontend dependencies and scripts

The frontend is built with React and Vite, with key libraries:

- `react`, `react-dom` — UI framework
- `recharts` — charting library for bar charts, line charts, scatter plots, and donut charts
- `d3`, `d3-geo`, `topojson-client`, `world-atlas` — world map geography and color scaling
- `axios` — API calls
- `lucide-react` — lightweight icons

The UI supports:

- a filter sidebar with multi-select controls
- KPI gauges for count and average metrics
- an interactive line chart for trends over time
- clickable topic bars that add/remove filters
- a choropleth world map with hover tooltips and clickable countries
- a paginated data table that reloads when filters change
- disabled `City` and `SWOT` filters when those fields do not exist in the dataset

## How it was developed

### Data ingestion

- The JSON dataset is stored at `backend/data/jsondata.json`.
- `backend/seed.py` reads the JSON, coerces blank values to `None`, parses dates, and inserts documents into MongoDB.
- It also creates indexes on the most common filter fields to support faster queries.

### Backend implementation

- `backend/app/database.py` reads `MONGODB_URI` and `MONGODB_DB` from `backend/.env`.
- `backend/app/filters.py` turns query parameters into MongoDB filters with support for comma-separated multi-select values.
- `backend/app/main.py` reuses the filter builder across all endpoints so charts and table use the same active filter set.
- The API uses aggregation pipelines to compute grouped summaries and averages for charts.

### Frontend implementation

- `frontend/src/App.jsx` manages the active filter state and issues API calls whenever filters change.
- It uses `useEffect` hooks to load filter options once and to reload all dashboard data on filter updates.
- `frontend/src/lib/api.js` converts arrays to comma-separated query params so the backend can interpret them correctly.
- The world map uses `d3-geo` and `topojson-client` to render an SVG choropleth from `frontend/public/data/world-110m.json`.
- Chart components are contained in `frontend/src/components/` and render based on the values returned by the API.

## Running the project

### 1. Backend

1. Create `backend/.env` with:
   ```text
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
   MONGODB_DB=ge_dashboard
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```
2. Create and activate a Python virtual environment:
   ```bash
   cd backend
   python3.13 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. Seed the database:
   ```bash
   python seed.py
   ```
4. Start the backend:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 2. Frontend

1. Install packages:
   ```bash
   cd frontend
   npm install
   ```
2. Start the frontend:
   ```bash
   npm run dev
   ```
3. Open the site at `http://localhost:5173`.

## Notes and dataset constraints

- The dataset does not contain `city` or `SWOT`, so the UI exposes those fields as disabled rather than inventing values.
- Some source fields are sparse, so filter counts are based on the actual present values.
- The backend requires a real MongoDB connection string to run.
- The backend dependencies were installed successfully using Python 3.13 due to Pydantic wheel compatibility with macOS.

## Summary

This project is a full-stack dashboard designed to showcase how to build an interactive analytics application from a JSON dataset through a MongoDB-backed API to a React/Vite frontend.`
