"""
MongoDB connection handling.
Reads MONGODB_URI / MONGODB_DB from environment (.env file).
"""
import os
from functools import lru_cache

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")
MONGODB_DB = os.getenv("MONGODB_DB", "ge_dashboard")
COLLECTION_NAME = "insights"


@lru_cache
def get_client() -> MongoClient:
    if not MONGODB_URI or "<username>" in MONGODB_URI:
        raise RuntimeError(
            "MONGODB_URI is not configured. Set a real connection string in backend/.env"
        )
    return MongoClient(MONGODB_URI)


def get_db() -> Database:
    return get_client()[MONGODB_DB]


def get_collection() -> Collection:
    return get_db()[COLLECTION_NAME]
