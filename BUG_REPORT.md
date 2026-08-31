# 🐛 Bug Report & Fixes

## Critical Bugs Found & Fixed

### 1. **CRITICAL: WebSocket Database Session Leak**
**File:** ackend/app/routers/dashboard.py:260
**Issue:** WebSocket endpoint uses Depends(get_db) which creates a single database session for the entire WebSocket connection lifecycle. This causes:
- Database connections never close
- Memory leaks on long-running dashboards
- Potential deadlocks

**Fix Required:**
\\\python
# BEFORE (BROKEN):
@router.websocket("/ws")
async def websocket_dashboard_stream(websocket: WebSocket, db: Session = Depends(get_db)):
    await manager.connect(websocket)
    try:
        while True:
            metrics = get_realtime_metrics(db)  # Same session forever
            await websocket.send_json({'type': 'metrics_update', 'data': metrics})
            await asyncio.sleep(5)

# AFTER (FIXED):
from app.database import SessionLocal

@router.websocket("/ws")
async def websocket_dashboard_stream(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            db = SessionLocal()  # New session each iteration
            try:
                metrics = get_realtime_metrics(db)
                await websocket.send_json({'type': 'metrics_update', 'data': metrics})
            finally:
                db.close()  # Always close
            await asyncio.sleep(5)
\\\

### 2. **Session Timeout Not Enforced on Backend**
**File:** rontend/src/utils/sessionManager.js
**Issue:** Client-side 30-minute timeout, but backend never expires old sessions
**Impact:** Database grows with stale sessions

**Fix Required:** Add cleanup job in ackend/app/main.py:
\\\python
import threading
from datetime import datetime, timedelta

def cleanup_expired_sessions():
    while True:
        time.sleep(3600)  # Run every hour
        db = SessionLocal()
        try:
            cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
            db.query(UserSession).filter(
                UserSession.last_activity_at < cutoff,
                UserSession.ended_at == None
            ).update({'ended_at': datetime.now(timezone.utc)})
            db.commit()
        finally:
            db.close()

# Start cleanup thread on startup
threading.Thread(target=cleanup_expired_sessions, daemon=True).start()
\\\

### 3. **Missing Import in dashboard.py**
**File:** ackend/app/routers/dashboard.py:262
**Issue:** Uses \SessionLocal\ but never imports it
**Fix:** Add to imports:
\\\python
from app.database import get_db, SessionLocal
\\\

### 4. **Race Condition in Session Manager**
**File:** rontend/src/utils/sessionManager.js:238
**Issue:** \eforeunload\ event tries to send async request, but browser kills it
**Impact:** Sessions never properly end in database

**Fix:**
\\\javascript
// Use sendBeacon API for reliable unload tracking
window.addEventListener('beforeunload', () => {
  if (sessionManager.sessionId) {
    const url = \\/telemetry/session/\/end\;
    // sendBeacon is guaranteed to send even during page unload
    navigator.sendBeacon(url, '');
  }
});
\\\

### 5. **Integer Conversion Bug in ABTest Results**
**File:** ackend/app/routers/telemetry.py:404
**Issue:** \unc.cast(ABTestAssignment.converted, Integer)\ - SQLite Boolean is already 0/1
**Fix:** Remove unnecessary cast:
\\\python
# BEFORE:
func.sum(func.cast(ABTestAssignment.converted, Integer)).label("total_converted")

# AFTER:
func.sum(ABTestAssignment.converted).label("total_converted")
\\\

### 6. **Missing Error Handler in Session Create**
**File:** rontend/src/utils/sessionManager.js:52
**Issue:** If backend is down, session creation fails silently and app breaks
**Fix:** Add fallback:
\\\javascript
async createSession() {
  this.sessionId = uuidv4();
  localStorage.setItem(SESSION_KEY, this.sessionId);
  localStorage.setItem(SESSION_START_KEY, Date.now().toString());
  
  console.log('📊 New session created:', this.sessionId);
  
  // Try to register with backend, but don't fail if offline
  try {
    const response = await fetch(\\/telemetry/session/create\, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        landing_page: window.location.pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      }),
    });
    
    if (!response.ok) {
      console.warn('Failed to register session with backend');
    }
  } catch (error) {
    console.warn('Session registration error (backend offline?):', error);
    // Continue anyway - session works locally
  }
}
\\\

## Non-Critical Issues (Production Recommendations)

### 7. **TODO Comments in Production Code**
- \ackend/app/routers/auth.py:56\ - OTP returned in response (dev only)
- \ackend/app/routers/payment.py:105\ - Mock payment verification

**Recommendation:** Add environment checks:
\\\python
if os.getenv('ENV') != 'production':
    return OTPResponse(message=f"OTP sent", mock_otp=otp)
else:
    return OTPResponse(message=f"OTP sent")
\\\

### 8. **Debug Console Logs in Frontend**
**File:** Multiple \.jsx\ files
**Issue:** \console.log\ statements in production
**Fix:** Use logging library or environment check:
\\\javascript
const isDev = import.meta.env.DEV;
if (isDev) console.log('📊 Session created:', sessionId);
\\\

### 9. **CORS Wildcard Pattern**
**File:** \ackend/app/main.py:44\
**Issue:** \"https://*.vercel.app"\ might not work as expected
**Fix:** Either list specific preview URLs or use regex pattern

## Summary

**Critical Bugs:** 6
**Fixed:** 0
**Requires Code Changes:** Yes

**Priority Order:**
1. Fix WebSocket database leak (CRITICAL - causes memory issues)
2. Add SessionLocal import
3. Fix beforeunload race condition
4. Add session cleanup job
5. Remove Integer cast in AB test
6. Add error handling in session create

All bugs are fixable without breaking existing functionality.
