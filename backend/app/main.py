"""
FastAPI backend for the GE Insights Visualization Dashboard.

Run locally:
    uvicorn app.main:app --reload --port 8000

All endpoints that accept filters share the same query parameters, so the
frontend can apply the same filter set to every chart:
    end_year, topic, sector, region, pestle, source, country
    (topic/sector/region/pestle/source/country accept comma-separated lists
    for multi-select)
"""
import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import get_collection
from app.filters import build_filter

load_dotenv()

app = FastAPI(title="GE Insights Dashboard API", version="1.0.0")

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    try:
        collection = get_collection()
        count = collection.estimated_document_count()
        return {"status": "ok", "documents": count}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@app.get("/api/filters")
def get_filter_options():
    """
    Distinct values for every filterable field, used to populate the
    dashboard's filter sidebar. 'city' and 'swot' are included as empty
    lists since the source dataset does not contain those fields.
    """
    collection = get_collection()
    return {
        "end_year": sorted([y for y in collection.distinct("end_year") if y is not None]),
        "topic": sorted([t for t in collection.distinct("topic") if t]),
        "sector": sorted([s for s in collection.distinct("sector") if s]),
        "region": sorted([r for r in collection.distinct("region") if r]),
        "pestle": sorted([p for p in collection.distinct("pestle") if p]),
        "source": sorted([s for s in collection.distinct("source") if s]),
        "country": sorted([c for c in collection.distinct("country") if c]),
        "city": [],   # not present in source data
        "swot": [],   # not present in source data
    }


@app.get("/api/records")
def get_records(
    page: int = 1,
    page_size: int = 25,
    end_year: Optional[int] = None,
    topic: Optional[str] = None,
    sector: Optional[str] = None,
    region: Optional[str] = None,
    pestle: Optional[str] = None,
    source: Optional[str] = None,
    country: Optional[str] = None,
):
    """Paginated raw records for the data-table view."""
    query = build_filter(
        end_year=end_year, topic=topic, sector=sector, region=region,
        pestle=pestle, source=source, country=country,
    )
    collection = get_collection()
    total = collection.count_documents(query)
    skip = max(page - 1, 0) * page_size
    cursor = (
        collection.find(query, {"_id": 0})
        .sort("added", -1)
        .skip(skip)
        .limit(page_size)
    )
    return {"total": total, "page": page, "page_size": page_size, "results": list(cursor)}


@app.get("/api/stats/summary")
def stats_summary(end_year: Optional[int] = None, topic: Optional[str] = None,
                   sector: Optional[str] = None, region: Optional[str] = None,
                   pestle: Optional[str] = None, source: Optional[str] = None,
                   country: Optional[str] = None):
    """KPI cards: totals + averages for the current filter set."""
    query = build_filter(end_year=end_year, topic=topic, sector=sector,
                          region=region, pestle=pestle, source=source, country=country)
    collection = get_collection()
    pipeline = [
        {"$match": query},
        {"$group": {
            "_id": None,
            "count": {"$sum": 1},
            "avg_intensity": {"$avg": "$intensity"},
            "avg_likelihood": {"$avg": "$likelihood"},
            "avg_relevance": {"$avg": "$relevance"},
            "countries": {"$addToSet": "$country"},
            "topics": {"$addToSet": "$topic"},
        }},
    ]
    result = list(collection.aggregate(pipeline))
    if not result:
        return {"count": 0, "avg_intensity": 0, "avg_likelihood": 0,
                "avg_relevance": 0, "country_count": 0, "topic_count": 0}
    r = result[0]
    return {
        "count": r["count"],
        "avg_intensity": round(r["avg_intensity"] or 0, 2),
        "avg_likelihood": round(r["avg_likelihood"] or 0, 2),
        "avg_relevance": round(r["avg_relevance"] or 0, 2),
        "country_count": len([c for c in r["countries"] if c]),
        "topic_count": len([t for t in r["topics"] if t]),
    }


@app.get("/api/stats/by-year")
def stats_by_year(end_year: Optional[int] = None, topic: Optional[str] = None,
                   sector: Optional[str] = None, region: Optional[str] = None,
                   pestle: Optional[str] = None, source: Optional[str] = None,
                   country: Optional[str] = None):
    """Average intensity / likelihood / relevance grouped by end_year, for trend charts."""
    query = build_filter(end_year=end_year, topic=topic, sector=sector,
                          region=region, pestle=pestle, source=source, country=country)
    query["end_year"] = query.get("end_year", {"$ne": None})
    collection = get_collection()
    pipeline = [
        {"$match": query},
        {"$group": {
            "_id": "$end_year",
            "avg_intensity": {"$avg": "$intensity"},
            "avg_likelihood": {"$avg": "$likelihood"},
            "avg_relevance": {"$avg": "$relevance"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
    ]
    results = list(collection.aggregate(pipeline))
    return [
        {
            "year": r["_id"],
            "avg_intensity": round(r["avg_intensity"] or 0, 2),
            "avg_likelihood": round(r["avg_likelihood"] or 0, 2),
            "avg_relevance": round(r["avg_relevance"] or 0, 2),
            "count": r["count"],
        }
        for r in results if r["_id"] is not None
    ]


@app.get("/api/stats/topics")
def stats_topics(limit: int = 15, end_year: Optional[int] = None, topic: Optional[str] = None,
                  sector: Optional[str] = None, region: Optional[str] = None,
                  pestle: Optional[str] = None, source: Optional[str] = None,
                  country: Optional[str] = None):
    """Top N topics by record count, with average intensity."""
    query = build_filter(end_year=end_year, topic=topic, sector=sector,
                          region=region, pestle=pestle, source=source, country=country)
    query["topic"] = query.get("topic", {"$ne": None})
    collection = get_collection()
    pipeline = [
        {"$match": query},
        {"$group": {"_id": "$topic", "count": {"$sum": 1}, "avg_intensity": {"$avg": "$intensity"}}},
        {"$sort": {"count": -1}},
        {"$limit": limit},
    ]
    results = list(collection.aggregate(pipeline))
    return [
        {"topic": r["_id"], "count": r["count"], "avg_intensity": round(r["avg_intensity"] or 0, 2)}
        for r in results if r["_id"]
    ]


@app.get("/api/stats/region")
def stats_region(end_year: Optional[int] = None, topic: Optional[str] = None,
                  sector: Optional[str] = None, region: Optional[str] = None,
                  pestle: Optional[str] = None, source: Optional[str] = None,
                  country: Optional[str] = None):
    """Average intensity / likelihood by region, for a regional comparison chart."""
    query = build_filter(end_year=end_year, topic=topic, sector=sector,
                          region=region, pestle=pestle, source=source, country=country)
    query["region"] = query.get("region", {"$ne": None})
    collection = get_collection()
    pipeline = [
        {"$match": query},
        {"$group": {
            "_id": "$region",
            "count": {"$sum": 1},
            "avg_intensity": {"$avg": "$intensity"},
            "avg_likelihood": {"$avg": "$likelihood"},
            "avg_relevance": {"$avg": "$relevance"},
        }},
        {"$sort": {"count": -1}},
    ]
    results = list(collection.aggregate(pipeline))
    return [
        {
            "region": r["_id"],
            "count": r["count"],
            "avg_intensity": round(r["avg_intensity"] or 0, 2),
            "avg_likelihood": round(r["avg_likelihood"] or 0, 2),
            "avg_relevance": round(r["avg_relevance"] or 0, 2),
        }
        for r in results if r["_id"]
    ]


@app.get("/api/stats/pestle")
def stats_pestle(end_year: Optional[int] = None, topic: Optional[str] = None,
                  sector: Optional[str] = None, region: Optional[str] = None,
                  pestle: Optional[str] = None, source: Optional[str] = None,
                  country: Optional[str] = None):
    """Distribution of records across PEST(LE) categories."""
    query = build_filter(end_year=end_year, topic=topic, sector=sector,
                          region=region, pestle=pestle, source=source, country=country)
    query["pestle"] = query.get("pestle", {"$ne": None})
    collection = get_collection()
    pipeline = [
        {"$match": query},
        {"$group": {"_id": "$pestle", "count": {"$sum": 1}, "avg_relevance": {"$avg": "$relevance"}}},
        {"$sort": {"count": -1}},
    ]
    results = list(collection.aggregate(pipeline))
    return [
        {"pestle": r["_id"], "count": r["count"], "avg_relevance": round(r["avg_relevance"] or 0, 2)}
        for r in results if r["_id"]
    ]


@app.get("/api/stats/sector")
def stats_sector(end_year: Optional[int] = None, topic: Optional[str] = None,
                  sector: Optional[str] = None, region: Optional[str] = None,
                  pestle: Optional[str] = None, source: Optional[str] = None,
                  country: Optional[str] = None):
    """Average relevance / intensity by sector."""
    query = build_filter(end_year=end_year, topic=topic, sector=sector,
                          region=region, pestle=pestle, source=source, country=country)
    query["sector"] = query.get("sector", {"$ne": None})
    collection = get_collection()
    pipeline = [
        {"$match": query},
        {"$group": {
            "_id": "$sector",
            "count": {"$sum": 1},
            "avg_relevance": {"$avg": "$relevance"},
            "avg_intensity": {"$avg": "$intensity"},
        }},
        {"$sort": {"count": -1}},
    ]
    results = list(collection.aggregate(pipeline))
    return [
        {
            "sector": r["_id"],
            "count": r["count"],
            "avg_relevance": round(r["avg_relevance"] or 0, 2),
            "avg_intensity": round(r["avg_intensity"] or 0, 2),
        }
        for r in results if r["_id"]
    ]


@app.get("/api/stats/country")
def stats_country(end_year: Optional[int] = None, topic: Optional[str] = None,
                   sector: Optional[str] = None, region: Optional[str] = None,
                   pestle: Optional[str] = None, source: Optional[str] = None,
                   country: Optional[str] = None):
    """Average intensity / likelihood / relevance by country, for the world map."""
    query = build_filter(end_year=end_year, topic=topic, sector=sector,
                          region=region, pestle=pestle, source=source, country=country)
    query["country"] = query.get("country", {"$ne": None})
    collection = get_collection()
    pipeline = [
        {"$match": query},
        {"$group": {
            "_id": "$country",
            "count": {"$sum": 1},
            "avg_intensity": {"$avg": "$intensity"},
            "avg_likelihood": {"$avg": "$likelihood"},
            "avg_relevance": {"$avg": "$relevance"},
        }},
        {"$sort": {"count": -1}},
    ]
    results = list(collection.aggregate(pipeline))
    return [
        {
            "country": r["_id"],
            "count": r["count"],
            "avg_intensity": round(r["avg_intensity"] or 0, 2),
            "avg_likelihood": round(r["avg_likelihood"] or 0, 2),
            "avg_relevance": round(r["avg_relevance"] or 0, 2),
        }
        for r in results if r["_id"]
    ]


@app.get("/api/stats/intensity-likelihood")
def stats_intensity_likelihood(end_year: Optional[int] = None, topic: Optional[str] = None,
                                sector: Optional[str] = None, region: Optional[str] = None,
                                pestle: Optional[str] = None, source: Optional[str] = None,
                                country: Optional[str] = None):
    """Raw intensity/likelihood/relevance points for a scatter plot (capped for payload size)."""
    query = build_filter(end_year=end_year, topic=topic, sector=sector,
                          region=region, pestle=pestle, source=source, country=country)
    collection = get_collection()
    cursor = collection.find(
        query,
        {"_id": 0, "intensity": 1, "likelihood": 1, "relevance": 1, "sector": 1, "title": 1},
    ).limit(500)
    return [d for d in cursor if d.get("intensity") is not None and d.get("likelihood") is not None]
