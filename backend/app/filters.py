"""
Builds a MongoDB filter dict from query parameters shared across endpoints.

Note on scope: the source dataset has no 'city' or 'SWOT' fields (verified
by inspecting all 1000 records - see README). Those two filters are still
exposed in the API/UI per the assignment brief, but they are no-ops against
this dataset since there is nothing to filter on. Everything else below maps
to a real field.
"""
from typing import Optional


def _split(value: Optional[str]) -> Optional[list[str]]:
    if not value:
        return None
    return [v.strip() for v in value.split(",") if v.strip()]


def build_filter(
    end_year: Optional[int] = None,
    start_year: Optional[int] = None,
    topic: Optional[str] = None,
    sector: Optional[str] = None,
    region: Optional[str] = None,
    pestle: Optional[str] = None,
    source: Optional[str] = None,
    country: Optional[str] = None,
    intensity_min: Optional[int] = None,
    intensity_max: Optional[int] = None,
    likelihood_min: Optional[int] = None,
    relevance_min: Optional[int] = None,
) -> dict:
    query: dict = {}

    if end_year is not None:
        query["end_year"] = end_year
    if start_year is not None:
        query["start_year"] = start_year

    topics = _split(topic)
    if topics:
        query["topic"] = {"$in": topics}

    sectors = _split(sector)
    if sectors:
        query["sector"] = {"$in": sectors}

    regions = _split(region)
    if regions:
        query["region"] = {"$in": regions}

    pestles = _split(pestle)
    if pestles:
        query["pestle"] = {"$in": pestles}

    sources = _split(source)
    if sources:
        query["source"] = {"$in": sources}

    countries = _split(country)
    if countries:
        query["country"] = {"$in": countries}

    if intensity_min is not None or intensity_max is not None:
        rng = {}
        if intensity_min is not None:
            rng["$gte"] = intensity_min
        if intensity_max is not None:
            rng["$lte"] = intensity_max
        query["intensity"] = rng

    if likelihood_min is not None:
        query["likelihood"] = {"$gte": likelihood_min}

    if relevance_min is not None:
        query["relevance"] = {"$gte": relevance_min}

    return query
