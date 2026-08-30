"""
routers/telemetry.py — Real-time AR telemetry with rolling CSV buffer for Power BI auto-refresh.
Supports WebSocket streaming and fallback HTTP POST.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
import csv
import os
from datetime import datetime, timezone
from typing import Optional

from app.database import get_db
from app.models import ARTelemetry
from app.schemas import TelemetryEventRequest, TelemetryEventResponse

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry"])

# Local Fallback Configuration
LOCAL_STREAM_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "telemetry_stream.csv")
MAX_RECORDS = 100  # Keep file lightweight for PowerBI auto-refresh

# Ensure CSV header exists
if not os.path.exists(LOCAL_STREAM_FILE):
    with open(LOCAL_STREAM_FILE, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["userId", "productId", "eventType", "dwellTimeSeconds", "timestamp"])


class LocalConnectionManager:
    def __init__(self):
        self.active_connections = {}
        self.buffer = []

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def process_telemetry(self, user_id: str, data: dict):
        """Process and write telemetry to local rolling CSV"""
        record = [
            user_id or "ANONYMOUS",
            data.get("product_id", "UNKNOWN"),
            data.get("event_type", "UNKNOWN"),
            data.get("dwell_time_seconds", 0),
            datetime.now(timezone.utc).isoformat()
        ]
        
        self.buffer.append(record)
        
        # Flush to CSV when buffer hits 5 records (prevents file-locking issues)
        if len(self.buffer) >= 5:
            self._flush_to_csv()

    def record_single_sync(self, user_id: Optional[str], product_id: str, event_type: str, dwell_time_seconds: int):
        """Synchronously queue a record and flush if needed"""
        record = [
            user_id or "ANONYMOUS",
            product_id or "UNKNOWN",
            event_type or "UNKNOWN",
            dwell_time_seconds or 0,
            datetime.now(timezone.utc).isoformat()
        ]
        self.buffer.append(record)
        self._flush_to_csv()

    def _flush_to_csv(self):
        """Write to CSV and trim to MAX_RECORDS to prevent file bloat"""
        try:
            # Read existing records
            existing_records = []
            if os.path.exists(LOCAL_STREAM_FILE):
                with open(LOCAL_STREAM_FILE, mode='r', newline='', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    try:
                        next(reader)  # Skip header
                        existing_records = list(reader)
                    except StopIteration:
                        pass
            
            # Append new buffer and keep only the last MAX_RECORDS
            all_records = existing_records + self.buffer
            trimmed_records = all_records[-MAX_RECORDS:]
            
            # Write back to file
            with open(LOCAL_STREAM_FILE, mode='w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(["userId", "productId", "eventType", "dwellTimeSeconds", "timestamp"])
                writer.writerows(trimmed_records)
                
            self.buffer.clear()
        except Exception as e:
            print(f"[WARN] Local CSV write error: {e}")


manager = LocalConnectionManager()


# ─── HTTP POST Fallback Endpoint ─────────────────────────────────────────────
@router.post("", response_model=TelemetryEventResponse)
@router.post("/", response_model=TelemetryEventResponse)
def record_telemetry_http(
    body: TelemetryEventRequest,
    db: Session = Depends(get_db)
):
    """
    HTTP POST fallback: records event to SQLite DB and appends to rolling CSV for Power BI.
    """
    event = ARTelemetry(
        user_id=body.user_id,
        product_id=body.product_id,
        event_type=body.event_type,
        dwell_time_seconds=body.dwell_time_seconds,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    manager.record_single_sync(
        user_id=body.user_id,
        product_id=body.product_id,
        event_type=body.event_type,
        dwell_time_seconds=body.dwell_time_seconds
    )

    return TelemetryEventResponse(
        recorded=True,
        event_id=event.id,
        streamed_to_powerbi=True,
    )


# ─── WebSocket Endpoints ──────────────────────────────────────────────────────
@router.websocket("/ws/{user_id}")
async def websocket_telemetry_user(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.process_telemetry(user_id, data)
            
            # Echo acknowledgment to frontend
            await websocket.send_json({
                "status": "received",
                "event": data.get("event_type"),
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        print(f"[WARN] WebSocket error: {e}")
        manager.disconnect(user_id)


@router.websocket("/ws")
async def websocket_telemetry_default(websocket: WebSocket):
    await websocket_telemetry_user(websocket, "ANONYMOUS")
