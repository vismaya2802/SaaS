# VisionFrame Telemetry System

## Overview

The VisionFrame telemetry system tracks user interactions with AR try-on features and streams analytics data for Power BI integration. It supports both **WebSocket (real-time)** and **HTTP POST (fallback)** endpoints.

## Architecture

### Components

1. **WebSocket Endpoint** (`/api/telemetry/ws/{user_id}`)
   - Real-time bidirectional communication
   - Ideal for live AR sessions
   - Automatic server acknowledgments

2. **HTTP POST Endpoint** (`/api/telemetry/`)
   - Fallback for clients that cannot use WebSocket
   - Synchronous request/response
   - Suitable for event batching

3. **CSV Rolling Buffer** (`telemetry_stream.csv`)
   - Local CSV file with 100-record limit (configurable)
   - Auto-flushes when buffer reaches 5 records
   - Lightweight, optimized for Power BI auto-refresh

4. **SQLite Database** (`visionframe.db`)
   - Persistent storage of all telemetry events
   - Foreign key relationships to users and products
   - Query-ready for analytics

## Event Types

- `try_on_start` — User initiates AR try-on session
- `try_on_update` — Dwell time update during AR session
- `try_on_end` — User ends AR session
- `screenshot` — User captures screenshot (future)
- `add_to_cart_from_ar` — Add product to cart from AR view (future)

## API Endpoints

### WebSocket: Real-Time AR Session

**Endpoint:** `ws://localhost:8000/api/telemetry/ws/{user_id}`

**Client → Server:**
```json
{
  "product_id": "PROD_8675309",
  "event_type": "try_on_start",
  "dwell_time_seconds": 0
}
```

**Server → Client (Acknowledgment):**
```json
{
  "status": "received",
  "event": "try_on_start",
  "timestamp": "2026-08-31T10:30:45.123456+00:00"
}
```

### HTTP POST: Fallback Event Recording

**Endpoint:** `POST /api/telemetry/`

**Request Body:**
```json
{
  "user_id": "usr_abc123",
  "product_id": "PROD_8675309",
  "event_type": "try_on_end",
  "dwell_time_seconds": 45
}
```

**Response:**
```json
{
  "recorded": true,
  "event_id": 12345,
  "streamed_to_powerbi": true
}
```

## Usage Examples

### WebSocket (Real-Time AR Session)

```javascript
// Frontend (React)
useEffect(() => {
  const ws = new WebSocket(`ws://localhost:8000/api/telemetry/ws/${userId}`);
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      product_id: "PROD_12345",
      event_type: "try_on_start",
      dwell_time_seconds: 0
    }));
  };
  
  ws.onmessage = (event) => {
    console.log("Server ACK:", event.data);
  };
  
  return () => ws.close();
}, [userId]);
```

### HTTP POST (Fallback)

```python
# Backend/Batch Processing
import requests

payload = {
    "user_id": "usr_abc123",
    "product_id": "PROD_8675309",
    "event_type": "try_on_end",
    "dwell_time_seconds": 45
}

response = requests.post(
    "http://localhost:8000/api/telemetry/",
    json=payload
)
print(response.json())  # {"recorded": true, "event_id": 12345, ...}
```

## Testing

### Run Automated Telemetry Test

```bash
cd backend/
python test_telemetry.py
```

**Test Coverage:**
- ✅ Backend health check
- ✅ WebSocket connection
- ✅ Multi-event simulation (5 events)
- ✅ CSV file creation and population
- ✅ Data persistence verification

**Expected Output:**
```
✅ Backend healthy: visionframe-backend v3.0.0
✅ WebSocket connected!
✅ Found 10 telemetry records in CSV
✅ All telemetry endpoints working correctly!
```

## CSV Format

**File:** `telemetry_stream.csv` (in backend directory)

```csv
userId,productId,eventType,dwellTimeSeconds,timestamp
test_user_001,PROD_8675309,try_on_start,0,2026-08-31T10:30:45.123456+00:00
test_user_001,PROD_8675309,try_on_update,2,2026-08-31T10:30:47.456789+00:00
test_user_001,PROD_8675309,try_on_update,4,2026-08-31T10:30:49.789012+00:00
```

### Power BI Integration

1. **Data Source:** Connect Power BI to `telemetry_stream.csv`
2. **Auto-Refresh:** Set refresh schedule (e.g., every 5 minutes)
3. **Visualizations:**
   - Average dwell time by product
   - Try-on conversion rates
   - User engagement heatmaps
   - Time-series analytics

## Configuration

**Backend Settings** (`app/routers/telemetry.py`):

```python
LOCAL_STREAM_FILE = "telemetry_stream.csv"  # Path to CSV
MAX_RECORDS = 100                          # Max rows in CSV (auto-trim)
BUFFER_FLUSH_THRESHOLD = 5                 # Records before CSV flush
```

## Database Schema

**Table:** `ar_telemetry`

```sql
CREATE TABLE ar_telemetry (
  id INTEGER PRIMARY KEY,
  user_id TEXT FOREIGN KEY,
  product_id TEXT FOREIGN KEY,
  event_type TEXT NOT NULL,
  dwell_time_seconds INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT NOW()
);
```

## Performance Notes

- **CSV Buffer:** Limited to 100 records to prevent file bloat
- **Flush Threshold:** 5 records trigger CSV write (prevents frequent disk I/O)
- **WebSocket:** Handles multiple concurrent connections
- **Database:** Indexed on `user_id` and `product_id` for fast queries

## Troubleshooting

### WebSocket Not Connecting

```bash
# Check backend is running
curl http://localhost:8000/health

# Verify telemetry router is loaded
# (check backend logs for "[OK] Database tables created")
```

### CSV File Not Updating

```bash
# Verify backend has write permissions to backend/ directory
ls -la telemetry_stream.csv

# Check backend logs for CSV write errors
# Look for: "[WARN] Local CSV write error:"
```

### Empty CSV File

- CSV is cleared and recreated on each backend restart
- Run `test_telemetry.py` to populate with test data
- Check telemetry_stream.csv exists in backend directory

## Future Enhancements

- [ ] Real-time Power BI Push Dataset API integration
- [ ] PostgreSQL/Cloud database option
- [ ] Webhook notifications for high-engagement events
- [ ] Rate limiting for WebSocket connections
- [ ] Event encryption for sensitive user data
- [ ] Batch export to S3/Azure Blob Storage

---

**Version:** 1.0.0  
**Last Updated:** August 31, 2026  
**Tested Endpoints:** WebSocket + HTTP POST ✅
