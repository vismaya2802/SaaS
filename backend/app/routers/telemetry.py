"""
routers/telemetry.py — Real-time AR telemetry with rolling CSV buffer for Power BI auto-refresh.
Supports WebSocket streaming and fallback HTTP POST.
Enhanced with session tracking, funnel analytics, heatmaps, and A/B testing.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
import csv
import os
import json
import random
from datetime import datetime, timezone
from typing import Optional, List

from app.database import get_db
from app.models import (
    ARTelemetry, UserSession, FunnelEvent, HeatmapData,
    ABTestExperiment, ABTestAssignment
)
from app.schemas import (
    TelemetryEventRequest, TelemetryEventResponse,
    SessionCreateRequest, SessionCreateResponse, SessionUpdateRequest,
    FunnelEventRequest, FunnelEventResponse, FunnelAnalyticsResponse,
    HeatmapEventRequest, HeatmapEventResponse, HeatmapAnalyticsResponse, HeatmapDataPoint,
    ABTestExperimentCreateRequest, ABTestExperimentResponse, ABTestVariantConfig,
    ABTestAssignmentRequest, ABTestAssignmentResponse
)

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry"])

# Local Fallback Configuration
LOCAL_STREAM_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "telemetry_stream.csv")
MAX_RECORDS = 100  # Keep file lightweight for PowerBI auto-refresh

# Ensure CSV header exists
if not os.path.exists(LOCAL_STREAM_FILE):
    with open(LOCAL_STREAM_FILE, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["userId", "productId", "eventType", "dwellTimeSeconds", "sessionId", "timestamp"])


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
            data.get("session_id", "NO_SESSION"),
            datetime.now(timezone.utc).isoformat()
        ]
        
        self.buffer.append(record)
        
        # Flush to CSV when buffer hits 5 records (prevents file-locking issues)
        if len(self.buffer) >= 5:
            self._flush_to_csv()

    def record_single_sync(self, user_id: Optional[str], product_id: str, event_type: str, dwell_time_seconds: int, session_id: Optional[str] = None):
        """Synchronously queue a record and flush if needed"""
        record = [
            user_id or "ANONYMOUS",
            product_id or "UNKNOWN",
            event_type or "UNKNOWN",
            dwell_time_seconds or 0,
            session_id or "NO_SESSION",
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
                writer.writerow(["userId", "productId", "eventType", "dwellTimeSeconds", "sessionId", "timestamp"])
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
    Enhanced with session tracking support.
    """
    event = ARTelemetry(
        user_id=body.user_id,
        product_id=body.product_id,
        event_type=body.event_type,
        dwell_time_seconds=body.dwell_time_seconds,
        session_id=body.session_id,
        page_url=body.page_url,
        referrer=body.referrer,
        user_agent=body.user_agent,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Update session event count
    if body.session_id:
        session = db.query(UserSession).filter(UserSession.session_id == body.session_id).first()
        if session:
            session.events_count += 1
            session.last_activity_at = datetime.now(timezone.utc)
            db.commit()

    manager.record_single_sync(
        user_id=body.user_id,
        product_id=body.product_id,
        event_type=body.event_type,
        dwell_time_seconds=body.dwell_time_seconds,
        session_id=body.session_id,
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


# ═════════════════════════════════════════════════════════════════════════════
# SESSION TRACKING ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/session/create", response_model=SessionCreateResponse)
def create_session(
    body: SessionCreateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a new user session for analytics tracking."""
    session = UserSession(
        user_id=body.user_id,
        landing_page=body.landing_page,
        referrer=body.referrer or request.headers.get("referer"),
        user_agent=body.user_agent or request.headers.get("user-agent"),
        ip_address=body.ip_address or request.client.host if request.client else None,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return SessionCreateResponse(
        session_id=session.session_id,
        started_at=session.started_at
    )


@router.patch("/session/update")
def update_session(
    body: SessionUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update session activity and metrics."""
    session = db.query(UserSession).filter(UserSession.session_id == body.session_id).first()
    if not session:
        return {"success": False, "message": "Session not found"}
    
    if body.last_activity_at:
        session.last_activity_at = body.last_activity_at
    if body.page_views is not None:
        session.page_views = body.page_views
    if body.events_count is not None:
        session.events_count = body.events_count
    if body.converted is not None:
        session.converted = body.converted
        if body.converted:
            session.ended_at = datetime.now(timezone.utc)
    
    db.commit()
    return {"success": True, "session_id": session.session_id}


@router.post("/session/{session_id}/end")
def end_session(session_id: str, db: Session = Depends(get_db)):
    """Mark a session as ended."""
    session = db.query(UserSession).filter(UserSession.session_id == session_id).first()
    if not session:
        return {"success": False, "message": "Session not found"}
    
    session.ended_at = datetime.now(timezone.utc)
    db.commit()
    return {"success": True, "session_id": session_id, "ended_at": session.ended_at}


# ═════════════════════════════════════════════════════════════════════════════
# FUNNEL TRACKING ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/funnel/track", response_model=FunnelEventResponse)
def track_funnel_event(
    body: FunnelEventRequest,
    db: Session = Depends(get_db)
):
    """Record a conversion funnel event."""
    event = FunnelEvent(
        session_id=body.session_id,
        user_id=body.user_id,
        funnel_stage=body.funnel_stage,
        product_id=body.product_id,
        metadata=body.metadata,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    
    return FunnelEventResponse(recorded=True, event_id=event.id)


@router.get("/funnel/analytics", response_model=List[FunnelAnalyticsResponse])
def get_funnel_analytics(db: Session = Depends(get_db)):
    """Get conversion funnel analytics with drop-off rates."""
    stages = [
        "landing", "browse_products", "view_product", "try_ar",
        "add_to_cart", "checkout", "payment", "completed"
    ]
    
    results = []
    total_sessions = db.query(func.count(func.distinct(FunnelEvent.session_id))).scalar() or 1
    
    for stage in stages:
        stage_count = db.query(func.count(func.distinct(FunnelEvent.session_id)))\
            .filter(FunnelEvent.funnel_stage == stage)\
            .scalar() or 0
        
        conversion_rate = (stage_count / total_sessions) * 100 if total_sessions > 0 else 0
        
        results.append(FunnelAnalyticsResponse(
            funnel_stage=stage,
            total_users=stage_count,
            conversion_rate=round(conversion_rate, 2),
            drop_off_rate=round(100 - conversion_rate, 2)
        ))
    
    return results


# ═════════════════════════════════════════════════════════════════════════════
# HEATMAP TRACKING ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/heatmap/track", response_model=HeatmapEventResponse)
def track_heatmap_event(
    body: HeatmapEventRequest,
    db: Session = Depends(get_db)
):
    """Record a heatmap interaction event."""
    event = HeatmapData(
        session_id=body.session_id,
        page_path=body.page_path,
        event_type=body.event_type,
        x_coordinate=body.x_coordinate,
        y_coordinate=body.y_coordinate,
        viewport_width=body.viewport_width,
        viewport_height=body.viewport_height,
        element_id=body.element_id,
        element_class=body.element_class,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    
    return HeatmapEventResponse(recorded=True, event_id=event.id)


@router.get("/heatmap/analytics/{page_path:path}", response_model=HeatmapAnalyticsResponse)
def get_heatmap_analytics(page_path: str, db: Session = Depends(get_db)):
    """Get heatmap data for a specific page path."""
    # Get all click events for this page
    events = db.query(HeatmapData)\
        .filter(HeatmapData.page_path == f"/{page_path}")\
        .filter(HeatmapData.event_type == "click")\
        .filter(HeatmapData.x_coordinate.isnot(None))\
        .filter(HeatmapData.y_coordinate.isnot(None))\
        .all()
    
    # Aggregate by coordinates
    coord_map = {}
    for event in events:
        key = (event.x_coordinate, event.y_coordinate)
        coord_map[key] = coord_map.get(key, 0) + 1
    
    data_points = [
        HeatmapDataPoint(x=x, y=y, intensity=intensity)
        for (x, y), intensity in coord_map.items()
    ]
    
    return HeatmapAnalyticsResponse(
        page_path=f"/{page_path}",
        total_events=len(events),
        data_points=data_points
    )


# ═════════════════════════════════════════════════════════════════════════════
# A/B TESTING ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/ab-test/create", response_model=ABTestExperimentResponse)
def create_ab_test(
    body: ABTestExperimentCreateRequest,
    db: Session = Depends(get_db)
):
    """Create a new A/B test experiment."""
    # Validate variant weights sum to 100
    total_weight = sum(v.weight for v in body.variants)
    if total_weight != 100:
        return {"error": "Variant weights must sum to 100"}
    
    variants_json = json.dumps([{"name": v.name, "weight": v.weight} for v in body.variants])
    
    experiment = ABTestExperiment(
        name=body.name,
        description=body.description,
        variants_config=variants_json,
        started_at=datetime.now(timezone.utc),
    )
    db.add(experiment)
    db.commit()
    db.refresh(experiment)
    
    return ABTestExperimentResponse(
        experiment_id=experiment.experiment_id,
        name=experiment.name,
        description=experiment.description,
        is_active=experiment.is_active,
        variants=body.variants
    )


@router.post("/ab-test/assign", response_model=ABTestAssignmentResponse)
def assign_ab_test_variant(
    body: ABTestAssignmentRequest,
    db: Session = Depends(get_db)
):
    """Assign a user session to an A/B test variant using weighted random selection."""
    # Get experiment by name
    experiment = db.query(ABTestExperiment)\
        .filter(ABTestExperiment.name == body.experiment_name)\
        .filter(ABTestExperiment.is_active == True)\
        .first()
    
    if not experiment:
        return {"error": "Experiment not found or inactive"}
    
    # Check if already assigned
    existing = db.query(ABTestAssignment)\
        .filter(ABTestAssignment.experiment_id == experiment.experiment_id)\
        .filter(ABTestAssignment.session_id == body.session_id)\
        .first()
    
    if existing:
        return ABTestAssignmentResponse(
            experiment_id=existing.experiment_id,
            variant_name=existing.variant_name,
            assigned_at=existing.assigned_at
        )
    
    # Parse variants and perform weighted random selection
    variants = json.loads(experiment.variants_config)
    variant_name = random.choices(
        population=[v["name"] for v in variants],
        weights=[v["weight"] for v in variants],
        k=1
    )[0]
    
    # Create assignment
    assignment = ABTestAssignment(
        experiment_id=experiment.experiment_id,
        session_id=body.session_id,
        user_id=body.user_id,
        variant_name=variant_name,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    
    return ABTestAssignmentResponse(
        experiment_id=assignment.experiment_id,
        variant_name=assignment.variant_name,
        assigned_at=assignment.assigned_at
    )


@router.get("/ab-test/{experiment_name}/results")
def get_ab_test_results(experiment_name: str, db: Session = Depends(get_db)):
    """Get A/B test results with conversion rates by variant."""
    experiment = db.query(ABTestExperiment)\
        .filter(ABTestExperiment.name == experiment_name)\
        .first()
    
    if not experiment:
        return {"error": "Experiment not found"}
    
    # Get assignments grouped by variant
    assignments = db.query(
        ABTestAssignment.variant_name,
        func.count(ABTestAssignment.id).label("total_assigned"),
        func.sum(func.cast(ABTestAssignment.converted, Integer)).label("total_converted")
    ).filter(ABTestAssignment.experiment_id == experiment.experiment_id)\
    .group_by(ABTestAssignment.variant_name)\
    .all()
    
    results = []
    for variant_name, total, converted in assignments:
        conversion_rate = (converted / total * 100) if total > 0 else 0
        results.append({
            "variant_name": variant_name,
            "total_assigned": total,
            "total_converted": converted or 0,
            "conversion_rate": round(conversion_rate, 2)
        })
    
    return {
        "experiment_name": experiment.name,
        "is_active": experiment.is_active,
        "variants": results
    }
