"""
Seeds the MongoDB 'insights' collection from data/jsondata.json.

Usage:
    python seed.py

Requires MONGODB_URI to be set in backend/.env to a real, reachable
MongoDB (Atlas) instance. Run this once after updating .env, and again
any time you want to reset the collection to a clean state.
"""
import json
import os
import sys
from datetime import datetime

from app.database import get_collection, get_db

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "jsondata.json")


def clean_int(value):
    """Coerce blank strings / None into None, otherwise int."""
    if value in (None, "", "NaN"):
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def clean_str(value):
    if value in (None, ""):
        return None
    return str(value).strip()


def parse_date(value):
    """'January, 20 2017 03:51:25' -> datetime, or None."""
    if not value:
        return None
    try:
        return datetime.strptime(value, "%B, %d %Y %H:%M:%S")
    except (ValueError, TypeError):
        return None


def transform(raw: dict) -> dict:
    return {
        "end_year": clean_int(raw.get("end_year")),
        "start_year": clean_int(raw.get("start_year")),
        "intensity": clean_int(raw.get("intensity")),
        "likelihood": clean_int(raw.get("likelihood")),
        "relevance": clean_int(raw.get("relevance")),
        "sector": clean_str(raw.get("sector")),
        "topic": clean_str(raw.get("topic")),
        "insight": clean_str(raw.get("insight")),
        "url": clean_str(raw.get("url")),
        "region": clean_str(raw.get("region")),
        "country": clean_str(raw.get("country")),
        "pestle": clean_str(raw.get("pestle")),
        "source": clean_str(raw.get("source")),
        "title": clean_str(raw.get("title")),
        "impact": clean_str(raw.get("impact")),
        "added": parse_date(raw.get("added")),
        "published": parse_date(raw.get("published")),
    }


def main():
    if not os.path.exists(DATA_PATH):
        print(f"Data file not found at {DATA_PATH}")
        sys.exit(1)

    with open(DATA_PATH, encoding="utf-8") as f:
        raw_records = json.load(f)

    print(f"Loaded {len(raw_records)} raw records from {DATA_PATH}")

    docs = [transform(r) for r in raw_records]

    try:
        collection = get_collection()
        db = get_db()
    except RuntimeError as e:
        print(f"Error: {e}")
        sys.exit(1)

    print("Clearing existing 'insights' collection...")
    collection.delete_many({})

    print(f"Inserting {len(docs)} documents...")
    collection.insert_many(docs)

    print("Creating indexes for common filter fields...")
    for field in ["end_year", "topic", "sector", "region", "pestle",
                  "source", "country", "intensity", "likelihood", "relevance"]:
        collection.create_index(field)

    count = collection.count_documents({})
    print(f"Done. '{db.name}.insights' now has {count} documents.")


if __name__ == "__main__":
    main()
