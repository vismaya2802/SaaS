"""
powerbi_engine/stream_telemetry.py — Standalone script to stream AR telemetry 
from SQLite to a PowerBI Push Dataset.

Run independently to batch-push historical data or as a scheduled cron job.

Usage:
  python stream_telemetry.py --limit 100
"""

import argparse
import json
import os
import sqlite3
from datetime import datetime, timezone

import httpx

# ─── Config ───────────────────────────────────────────────────────────────────
DB_PATH          = os.getenv("DB_PATH", "../backend/data/lenskart.db")
POWERBI_PUSH_URL = os.getenv("POWERBI_PUSH_URL", "")
POWERBI_TOKEN    = os.getenv("POWERBI_BEARER_TOKEN", "")


def fetch_recent_events(limit: int = 50) -> list[dict]:
    """Fetch the most recent AR telemetry events from SQLite."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(
        """
        SELECT t.id, t.product_id, t.event_type, t.dwell_time_seconds, t.timestamp,
               p.title AS product_title, p.category
        FROM ar_telemetry t
        LEFT JOIN products p ON t.product_id = p.id
        ORDER BY t.timestamp DESC
        LIMIT ?
        """,
        (limit,),
    )
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def push_rows_to_powerbi(rows: list[dict]) -> tuple[int, int]:
    """
    Push a batch of rows to the PowerBI Push Dataset.
    Returns (success_count, fail_count).
    """
    if not POWERBI_PUSH_URL:
        print("⚠️  POWERBI_PUSH_URL not set — dry run mode, printing rows:")
        for r in rows:
            print(json.dumps(r, default=str))
        return len(rows), 0

    payload = [
        {
            "event_id":          r["id"],
            "product_id":        r["product_id"],
            "product_title":     r.get("product_title", ""),
            "category":          r.get("category", ""),
            "event_type":        r["event_type"],
            "dwell_time":        r["dwell_time_seconds"],
            "timestamp":         r["timestamp"],
        }
        for r in rows
    ]

    headers = {"Content-Type": "application/json"}
    if POWERBI_TOKEN:
        headers["Authorization"] = f"Bearer {POWERBI_TOKEN}"

    try:
        resp = httpx.post(
            POWERBI_PUSH_URL,
            content=json.dumps(payload),
            headers=headers,
            timeout=10.0,
        )
        if resp.status_code in (200, 201, 204):
            print(f"✅  Pushed {len(payload)} rows to PowerBI.")
            return len(payload), 0
        else:
            print(f"❌  PowerBI returned {resp.status_code}: {resp.text}")
            return 0, len(payload)
    except httpx.RequestError as e:
        print(f"❌  Network error: {e}")
        return 0, len(payload)


def main():
    parser = argparse.ArgumentParser(description="Stream AR telemetry to PowerBI")
    parser.add_argument("--limit", type=int, default=50, help="Number of rows to push")
    args = parser.parse_args()

    print(f"📊 Fetching last {args.limit} telemetry events from {DB_PATH}…")
    rows = fetch_recent_events(args.limit)
    print(f"   Found {len(rows)} events.")

    if rows:
        ok, fail = push_rows_to_powerbi(rows)
        print(f"   ✅ {ok} pushed  ❌ {fail} failed")
    else:
        print("   No events to push.")


if __name__ == "__main__":
    main()
