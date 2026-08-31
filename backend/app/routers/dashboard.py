"""
routers/dashboard.py — Real-time analytics dashboard with WebSocket streaming
Provides live metrics, KPIs, and analytics data for admin monitoring
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
import json
import asyncio

from app.database import get_db, SessionLocal, SessionLocal
from app.models import (
    User, Product, Order, ARTelemetry, UserSession,
    FunnelEvent, HeatmapData, ABTestExperiment, ABTestAssignment
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


class DashboardConnectionManager:
    """Manages WebSocket connections for real-time dashboard updates"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"📊 Dashboard connected. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"📊 Dashboard disconnected. Total: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict):
        """Broadcast metrics to all connected dashboards"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error broadcasting to dashboard: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            self.disconnect(conn)


manager = DashboardConnectionManager()


def get_realtime_metrics(db: Session) -> Dict[str, Any]:
    """Aggregate real-time metrics for dashboard"""
    now = datetime.now(timezone.utc)
    last_hour = now - timedelta(hours=1)
    last_24h = now - timedelta(hours=24)
    
    # Active sessions (last 30 minutes)
    active_sessions = db.query(func.count(UserSession.session_id))\
        .filter(UserSession.last_activity_at >= now - timedelta(minutes=30))\
        .scalar() or 0
    
    # Total sessions today
    sessions_today = db.query(func.count(UserSession.session_id))\
        .filter(UserSession.started_at >= now.replace(hour=0, minute=0, second=0))\
        .scalar() or 0
    
    # Conversion rate today
    converted_today = db.query(func.count(UserSession.session_id))\
        .filter(UserSession.started_at >= now.replace(hour=0, minute=0, second=0))\
        .filter(UserSession.converted == True)\
        .scalar() or 0
    conversion_rate = (converted_today / sessions_today * 100) if sessions_today > 0 else 0
    
    # Revenue today (mock calculation from orders)
    revenue_today = db.query(func.sum(Order.total_amount))\
        .filter(Order.created_at >= now.replace(hour=0, minute=0, second=0))\
        .filter(Order.payment_status == 'paid')\
        .scalar() or 0
    
    # AR try-on sessions (last hour)
    ar_sessions_hour = db.query(func.count(func.distinct(ARTelemetry.session_id)))\
        .filter(ARTelemetry.timestamp >= last_hour)\
        .filter(ARTelemetry.event_type == 'try_on_start')\
        .scalar() or 0
    
    # Most tried products (last 24h)
    top_products = db.query(
        Product.id,
        Product.title,
        func.count(ARTelemetry.id).label('try_count')
    ).join(ARTelemetry, Product.id == ARTelemetry.product_id)\
    .filter(ARTelemetry.timestamp >= last_24h)\
    .group_by(Product.id, Product.title)\
    .order_by(desc('try_count'))\
    .limit(5)\
    .all()
    
    # Average session duration (seconds)
    avg_duration = db.query(
        func.avg(
            func.julianday(UserSession.last_activity_at) - 
            func.julianday(UserSession.started_at)
        ) * 86400  # Convert days to seconds
    ).filter(UserSession.started_at >= last_24h).scalar() or 0
    
    # Funnel drop-off rates
    funnel_stages = ['landing', 'view_product', 'try_ar', 'add_to_cart', 'checkout', 'payment', 'completed']
    total_sessions_with_funnel = db.query(func.count(func.distinct(FunnelEvent.session_id)))\
        .filter(FunnelEvent.timestamp >= last_24h)\
        .scalar() or 1
    
    funnel_data = []
    for stage in funnel_stages:
        stage_count = db.query(func.count(func.distinct(FunnelEvent.session_id)))\
            .filter(FunnelEvent.funnel_stage == stage)\
            .filter(FunnelEvent.timestamp >= last_24h)\
            .scalar() or 0
        
        funnel_data.append({
            'stage': stage,
            'count': stage_count,
            'percentage': round((stage_count / total_sessions_with_funnel) * 100, 2)
        })
    
    # Active A/B tests
    active_experiments = db.query(func.count(ABTestExperiment.experiment_id))\
        .filter(ABTestExperiment.is_active == True)\
        .scalar() or 0
    
    return {
        'timestamp': now.isoformat(),
        'active_sessions': active_sessions,
        'sessions_today': sessions_today,
        'conversion_rate': round(conversion_rate, 2),
        'revenue_today': round(revenue_today, 2),
        'ar_sessions_hour': ar_sessions_hour,
        'avg_session_duration': round(avg_duration, 2),
        'active_experiments': active_experiments,
        'top_products': [
            {'id': p.id, 'title': p.title, 'try_count': p.try_count}
            for p in top_products
        ],
        'funnel': funnel_data,
    }


# ═════════════════════════════════════════════════════════════════════════════
# DASHBOARD ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════

@router.get("/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Get current dashboard metrics (HTTP endpoint)"""
    return get_realtime_metrics(db)


@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    """Get comprehensive dashboard overview with historical data"""
    now = datetime.now(timezone.utc)
    last_7_days = now - timedelta(days=7)
    last_30_days = now - timedelta(days=30)
    
    # Total users
    total_users = db.query(func.count(User.id)).scalar() or 0
    
    # Total products
    total_products = db.query(func.count(Product.id)).scalar() or 0
    
    # Total orders
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    paid_orders = db.query(func.count(Order.id))\
        .filter(Order.payment_status == 'paid')\
        .scalar() or 0
    
    # Total revenue
    total_revenue = db.query(func.sum(Order.total_amount))\
        .filter(Order.payment_status == 'paid')\
        .scalar() or 0
    
    # Average order value
    avg_order_value = (total_revenue / paid_orders) if paid_orders > 0 else 0
    
    # Sessions (7-day trend)
    sessions_7d = []
    for i in range(7):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0)
        day_end = day_start + timedelta(days=1)
        count = db.query(func.count(UserSession.session_id))\
            .filter(UserSession.started_at >= day_start)\
            .filter(UserSession.started_at < day_end)\
            .scalar() or 0
        sessions_7d.insert(0, {
            'date': day_start.strftime('%Y-%m-%d'),
            'count': count
        })
    
    # Revenue (7-day trend)
    revenue_7d = []
    for i in range(7):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0)
        day_end = day_start + timedelta(days=1)
        amount = db.query(func.sum(Order.total_amount))\
            .filter(Order.created_at >= day_start)\
            .filter(Order.created_at < day_end)\
            .filter(Order.payment_status == 'paid')\
            .scalar() or 0
        revenue_7d.insert(0, {
            'date': day_start.strftime('%Y-%m-%d'),
            'amount': float(amount)
        })
    
    # Top products by revenue
    top_revenue_products = db.query(
        Product.id,
        Product.title,
        Product.price,
        func.count(Order.id).label('order_count')
    ).join(ARTelemetry, Product.id == ARTelemetry.product_id)\
    .join(UserSession, ARTelemetry.session_id == UserSession.session_id)\
    .join(Order, UserSession.user_id == Order.user_id)\
    .filter(Order.payment_status == 'paid')\
    .filter(Order.created_at >= last_30_days)\
    .group_by(Product.id, Product.title, Product.price)\
    .order_by(desc('order_count'))\
    .limit(10)\
    .all()
    
    return {
        'overview': {
            'total_users': total_users,
            'total_products': total_products,
            'total_orders': total_orders,
            'paid_orders': paid_orders,
            'total_revenue': round(total_revenue, 2),
            'avg_order_value': round(avg_order_value, 2),
        },
        'trends': {
            'sessions_7d': sessions_7d,
            'revenue_7d': revenue_7d,
        },
        'top_products': [
            {
                'id': p.id,
                'title': p.title,
                'price': float(p.price),
                'order_count': p.order_count,
            }
            for p in top_revenue_products
        ],
    }


@router.websocket("/ws")
async def websocket_dashboard_stream(websocket: WebSocket):
    """
    WebSocket endpoint for real-time dashboard metrics streaming.
    Sends updated metrics every 5 seconds.
    """
    await manager.connect(websocket)
    
    try:
        while True:
            # Create new database session for each iteration
            db = SessionLocal()
            try:
                # Get fresh metrics from database
                metrics = get_realtime_metrics(db)
                
                # Send to this specific connection
                await websocket.send_json({
                    'type': 'metrics_update',
                    'data': metrics
                })
            finally:
                db.close()
            
            # Wait 5 seconds before next update
            await asyncio.sleep(5)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"Dashboard WebSocket error: {e}")
        manager.disconnect(websocket)


@router.get("/sessions/active")
def get_active_sessions(db: Session = Depends(get_db)):
    """Get list of currently active sessions (last 30 minutes)"""
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(minutes=30)
    
    sessions = db.query(UserSession)\
        .filter(UserSession.last_activity_at >= cutoff)\
        .order_by(desc(UserSession.last_activity_at))\
        .limit(50)\
        .all()
    
    return {
        'active_count': len(sessions),
        'sessions': [
            {
                'session_id': s.session_id,
                'user_id': s.user_id,
                'started_at': s.started_at.isoformat(),
                'last_activity_at': s.last_activity_at.isoformat(),
                'page_views': s.page_views,
                'events_count': s.events_count,
                'converted': s.converted,
                'landing_page': s.landing_page,
            }
            for s in sessions
        ]
    }


@router.get("/products/trending")
def get_trending_products(limit: int = 10, db: Session = Depends(get_db)):
    """Get trending products based on recent AR try-ons"""
    last_24h = datetime.now(timezone.utc) - timedelta(hours=24)
    
    products = db.query(
        Product.id,
        Product.title,
        Product.price,
        Product.category,
        func.count(ARTelemetry.id).label('try_count')
    ).join(ARTelemetry, Product.id == ARTelemetry.product_id)\
    .filter(ARTelemetry.timestamp >= last_24h)\
    .group_by(Product.id, Product.title, Product.price, Product.category)\
    .order_by(desc('try_count'))\
    .limit(limit)\
    .all()
    
    return {
        'trending_products': [
            {
                'id': p.id,
                'title': p.title,
                'price': float(p.price),
                'category': p.category,
                'try_count': p.try_count,
            }
            for p in products
        ]
    }
