# DAX Measures — Lenskart SaaS v3.0 PowerBI Dashboard

This file documents all DAX measures used in the PowerBI report connected to the
AR Telemetry Push Dataset. Import these into your PowerBI Desktop `.pbix` file.

---

## Dataset: `ar_telemetry` (Push Dataset)

| Column | Type | Description |
|---|---|---|
| `event_id` | Whole Number | Auto-incremented event PK |
| `product_id` | Text | FK to products table |
| `product_title` | Text | Denormalized product name |
| `category` | Text | eyeglasses / sunglasses / lenses |
| `event_type` | Text | try_on_start / try_on_end / screenshot / add_to_cart_from_ar |
| `dwell_time` | Whole Number | Seconds user spent in AR session |
| `timestamp` | DateTime | UTC timestamp of event |

---

## Core Measures

### Total AR Sessions
```dax
Total AR Sessions = 
COUNTROWS(
    FILTER(ar_telemetry, ar_telemetry[event_type] = "try_on_start")
)
```

### Average Dwell Time (seconds)
```dax
Avg Dwell Time = 
AVERAGEX(
    FILTER(ar_telemetry, ar_telemetry[event_type] = "try_on_end"),
    ar_telemetry[dwell_time]
)
```

### AR-to-Cart Conversion Rate
```dax
AR Cart Conversion Rate = 
DIVIDE(
    COUNTROWS(FILTER(ar_telemetry, ar_telemetry[event_type] = "add_to_cart_from_ar")),
    COUNTROWS(FILTER(ar_telemetry, ar_telemetry[event_type] = "try_on_start")),
    0
)
```

### Screenshots per Session
```dax
Screenshots Per Session = 
DIVIDE(
    COUNTROWS(FILTER(ar_telemetry, ar_telemetry[event_type] = "screenshot")),
    [Total AR Sessions],
    0
)
```

### Top AR Product (Most Try-ons)
```dax
Top AR Product = 
FIRSTNONBLANK(
    TOPN(
        1,
        SUMMARIZE(
            FILTER(ar_telemetry, ar_telemetry[event_type] = "try_on_start"),
            ar_telemetry[product_title],
            "TryOnCount", COUNTROWS(ar_telemetry)
        ),
        [TryOnCount], DESC
    ),
    ar_telemetry[product_title]
)
```

### 7-Day Rolling AR Sessions
```dax
Rolling 7d AR Sessions = 
CALCULATE(
    [Total AR Sessions],
    DATESINPERIOD(ar_telemetry[timestamp], LASTDATE(ar_telemetry[timestamp]), -7, DAY)
)
```

---

## Suggested Visuals

| Visual | X-Axis | Y-Axis / Values | Legend |
|---|---|---|---|
| Line Chart | timestamp (Day) | Total AR Sessions | — |
| Bar Chart | product_title | Total AR Sessions | category |
| KPI Card | — | AR Cart Conversion Rate | — |
| KPI Card | — | Avg Dwell Time | — |
| Scatter Plot | Avg Dwell Time | AR Cart Conversion Rate | category |
| Funnel | event_type | COUNT(event_id) | — |

---

## Refresh Schedule

For the college demo, use **Real-Time streaming** mode in PowerBI.  
Set the Push Dataset endpoint in `POWERBI_PUSH_URL` environment variable.

For production: configure a **DirectQuery** connection or set a scheduled  
refresh every 30 minutes via the PowerBI REST API.
