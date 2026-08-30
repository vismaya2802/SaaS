"""
services/powerbi_stream.py — PowerBI Push Dataset streaming service.

Pushes AR telemetry events to a PowerBI Real-Time Push Dataset via the
PowerBI REST API. Requires a valid Bearer token from Azure AD (service principal).

For the college demo the POWERBI_PUSH_URL env var is intentionally left unset,
which causes every push to silently return `streamed=False` — the app still
boots and records events to SQLite normally.
"""

import os
import json
from datetime import datetime, timezone

import httpx

# ─── Config (set via environment variables in production) ─────────────────────
POWERBI_PUSH_URL: str | None = os.getenv("POWERBI_PUSH_URL")
# Format: https://api.powerbi.com/beta/<tenant>/datasets/<dataset-id>/rows?key=<key>
POWERBI_BEARER_TOKEN: str | None = os.getenv("POWERBI_BEARER_TOKEN")


def push_event_to_powerbi(
    product_id: str,
    event_type: str,
    dwell_time_seconds: int,
) -> bool:
    """
    Push a single AR telemetry event row to a PowerBI streaming dataset.

    Returns True if the push succeeds, False otherwise (including when
    POWERBI_PUSH_URL is not configured — safe for local dev).

    Dataset schema expected (columns):
        product_id   (Text)
        event_type   (Text)
        dwell_time   (Number)
        timestamp    (DateTime)
    """
    if not POWERBI_PUSH_URL:
        # Graceful no-op when PowerBI is not configured
        return False

    payload = [
        {
            "product_id": product_id,
            "event_type": event_type,
            "dwell_time": dwell_time_seconds,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    ]

    headers = {"Content-Type": "application/json"}
    if POWERBI_BEARER_TOKEN:
        headers["Authorization"] = f"Bearer {POWERBI_BEARER_TOKEN}"

    try:
        response = httpx.post(
            POWERBI_PUSH_URL,
            content=json.dumps(payload),
            headers=headers,
            timeout=5.0,
        )
        return response.status_code in (200, 201, 204)
    except httpx.RequestError:
        # Network failure — don't crash the main request
        return False
