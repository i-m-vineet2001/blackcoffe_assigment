import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const client = axios.create({ baseURL: API_BASE });

// Turn { region: ["Asia","Europe"], end_year: 2020 } into query params,
// joining array values with commas to match the backend's comma-separated
// multi-select convention.
function toParams(filters = {}) {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    if (Array.isArray(value)) {
      if (value.length) params[key] = value.join(",");
    } else {
      params[key] = value;
    }
  });
  return params;
}

export const api = {
  health: () => client.get("/api/health").then((r) => r.data),
  filterOptions: () => client.get("/api/filters").then((r) => r.data),
  records: (filters, page = 1, pageSize = 25) =>
    client
      .get("/api/records", { params: { ...toParams(filters), page, page_size: pageSize } })
      .then((r) => r.data),
  summary: (filters) =>
    client.get("/api/stats/summary", { params: toParams(filters) }).then((r) => r.data),
  byYear: (filters) =>
    client.get("/api/stats/by-year", { params: toParams(filters) }).then((r) => r.data),
  topics: (filters, limit = 12) =>
    client
      .get("/api/stats/topics", { params: { ...toParams(filters), limit } })
      .then((r) => r.data),
  region: (filters) =>
    client.get("/api/stats/region", { params: toParams(filters) }).then((r) => r.data),
  pestle: (filters) =>
    client.get("/api/stats/pestle", { params: toParams(filters) }).then((r) => r.data),
  sector: (filters) =>
    client.get("/api/stats/sector", { params: toParams(filters) }).then((r) => r.data),
  country: (filters) =>
    client.get("/api/stats/country", { params: toParams(filters) }).then((r) => r.data),
  intensityLikelihood: (filters) =>
    client
      .get("/api/stats/intensity-likelihood", { params: toParams(filters) })
      .then((r) => r.data),
};
