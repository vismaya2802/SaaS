# 📊 PowerBI Push Dataset Integration Guide

This guide explains how to configure real-time PowerBI streaming for VisionFrame telemetry data.

## Overview

VisionFrame streams telemetry events to PowerBI in real-time using **Push Datasets**. This allows you to:

- Build live dashboards with auto-refreshing visualizations
- Monitor AR try-on sessions in real-time
- Analyze conversion funnels and user behavior
- Track product performance and trending items
- No data refresh delays (updates appear within seconds)

---

## Prerequisites

1. **PowerBI Pro or Premium license** (required for Push Datasets)
2. **Azure AD tenant** (for OAuth authentication, optional)
3. **PowerBI workspace** (where your dataset will live)

---

## Step 1: Create PowerBI Push Dataset

### Option A: Using PowerBI REST API (Recommended)

1. **Get your Workspace ID:**
   - Go to [app.powerbi.com](https://app.powerbi.com)
   - Navigate to your workspace
   - Copy the workspace ID from the URL: `https://app.powerbi.com/groups/{workspace-id}/...`

2. **Create Push Dataset using REST API:**

   ```bash
   POST https://api.powerbi.com/v1.0/myorg/groups/{workspace-id}/datasets
   Authorization: Bearer {access-token}
   Content-Type: application/json
   
   {
     "name": "VisionFrame Telemetry Stream",
     "defaultMode": "Push",
     "tables": [
       {
         "name": "TelemetryEvents",
         "columns": [
           { "name": "product_id", "dataType": "String" },
           { "name": "event_type", "dataType": "String" },
           { "name": "dwell_time", "dataType": "Int64" },
           { "name": "user_id", "dataType": "String" },
           { "name": "session_id", "dataType": "String" },
           { "name": "timestamp", "dataType": "DateTime" }
         ]
       }
     ]
   }
   ```

3. **Copy the Push URL:**
   - The response will contain a `pushUrl` field
   - Format: `https://api.powerbi.com/beta/{workspace-id}/datasets/{dataset-id}/rows?key={key}`
   - Save this URL for the next step

### Option B: Using PowerBI UI (Simpler)

1. Go to your PowerBI workspace
2. Click **Create** → **Streaming dataset**
3. Choose **API** as the source
4. Define the schema:
   - `product_id` (Text)
   - `event_type` (Text)
   - `dwell_time` (Number)
   - `user_id` (Text)
   - `session_id` (Text)
   - `timestamp` (DateTime)
5. Enable **Historic data analysis**
6. Copy the **Push URL** provided

---

## Step 2: Configure Authentication

### Option 1: API Key Authentication (Simplest)

The Push URL from PowerBI includes an embedded API key. No additional auth needed!

**Environment Variable:**
```bash
POWERBI_PUSH_URL=https://api.powerbi.com/beta/{workspace-id}/datasets/{dataset-id}/rows?key={your-key}
```

### Option 2: Azure AD OAuth (Production Recommended)

For enterprise deployments, use service principal authentication:

1. **Register an App in Azure AD:**
   - Go to [portal.azure.com](https://portal.azure.com) → Azure Active Directory
   - Navigate to **App registrations** → **New registration**
   - Name: `VisionFrame PowerBI Service`
   - Save the **Application (client) ID** and **Directory (tenant) ID**

2. **Create Client Secret:**
   - In your app registration, go to **Certificates & secrets**
   - Create a new client secret
   - Copy the **Value** (not the Secret ID)

3. **Grant PowerBI API Permissions:**
   - In your app, go to **API permissions**
   - Add permission → **PowerBI Service** → **Delegated permissions**
   - Select: `Dataset.ReadWrite.All`, `Workspace.Read.All`
   - Click **Grant admin consent**

4. **Add Service Principal to Workspace:**
   - Go to your PowerBI workspace settings
   - Add the service principal as a **Member** or **Admin**

**Environment Variables:**
```bash
POWERBI_PUSH_URL=https://api.powerbi.com/beta/{workspace-id}/datasets/{dataset-id}/rows
POWERBI_CLIENT_ID=your-azure-ad-app-client-id
POWERBI_CLIENT_SECRET=your-azure-ad-app-secret
POWERBI_TENANT_ID=your-azure-tenant-id
```

---

## Step 3: Deploy to Railway (Backend)

1. **Add Environment Variables to Railway:**
   - Go to your Railway project
   - Navigate to **Variables** tab
   - Add one of the following configurations:

   **Using API Key (Simpler):**
   ```
   POWERBI_PUSH_URL=https://api.powerbi.com/beta/.../rows?key=...
   ```

   **Using OAuth (More Secure):**
   ```
   POWERBI_PUSH_URL=https://api.powerbi.com/beta/.../rows
   POWERBI_CLIENT_ID=your-client-id
   POWERBI_CLIENT_SECRET=your-client-secret
   POWERBI_TENANT_ID=your-tenant-id
   ```

2. **Redeploy Backend:**
   - Railway will automatically redeploy with new environment variables
   - Check logs for: `[OK] PowerBI connection test completed`

3. **Test Connection:**
   ```bash
   curl https://your-backend-url.railway.app/api/telemetry/powerbi/test
   ```

   Expected response:
   ```json
   {
     "configured": true,
     "auth_method": "oauth",
     "auth_valid": true,
     "test_push_success": true,
     "message": "PowerBI connection test completed."
   }
   ```

---

## Step 4: Verify Data Flow

1. **Trigger Some Events:**
   - Visit your frontend: `https://visionframe-app.vercel.app`
   - Browse products, use AR try-on, add items to cart
   - Each action sends telemetry events

2. **Check PowerBI Dataset:**
   - Go to your PowerBI workspace
   - Open the dataset → **Settings** → **Refresh**
   - Click **View Data** to see recent events

3. **Monitor Backend Logs:**
   ```bash
   # Railway logs
   [OK] PowerBI batch push: 5 events
   ```

---

## Step 5: Build PowerBI Dashboard

### Sample Report Visuals

1. **Real-time Event Stream (Card)**
   - Visual: Card
   - Field: `timestamp` (Count)
   - Title: "Total Events"

2. **Events by Type (Pie Chart)**
   - Visual: Pie Chart
   - Legend: `event_type`
   - Values: `event_type` (Count)

3. **Top Products (Bar Chart)**
   - Visual: Bar Chart
   - Axis: `product_id`
   - Values: `product_id` (Count)
   - Sort: Descending

4. **Dwell Time Over Time (Line Chart)**
   - Visual: Line Chart
   - Axis: `timestamp` (Continuous)
   - Values: `dwell_time` (Average)

5. **Active Sessions (Table)**
   - Visual: Table
   - Columns: `session_id`, `user_id`, `event_type`, `timestamp`
   - Filters: `timestamp` (Last 30 minutes)

### Enable Auto-Refresh

1. Go to **File** → **Options and settings** → **Settings**
2. Under **Report settings**, enable **Automatic page refresh**
3. Set interval to **5 seconds** (minimum for Push Datasets)
4. Publish to PowerBI Service

---

## Troubleshooting

### Issue: "PowerBI push failed: 401 Unauthorized"

**Solution:**
- Check that your API key is correct in `POWERBI_PUSH_URL`
- For OAuth: Verify client secret hasn't expired
- Ensure service principal has workspace access

### Issue: "PowerBI push failed: 403 Forbidden"

**Solution:**
- Check PowerBI Pro/Premium license is active
- Verify service principal has `Dataset.ReadWrite.All` permission
- Confirm workspace allows external data push

### Issue: "No events appearing in PowerBI"

**Solution:**
- Test connection: `GET /api/telemetry/powerbi/test`
- Check backend logs for push errors
- Verify dataset schema matches (column names, types)
- Try manual sync: `POST /api/telemetry/powerbi/batch-sync?limit=10`

### Issue: "Token expired" errors

**Solution:**
- OAuth tokens are cached for 1 hour
- Backend automatically refreshes tokens
- If issues persist, restart Railway service

---

## Performance Considerations

### Push Rate Limits

PowerBI Push Datasets have the following limits:

- **Max rows per push:** 10,000
- **Max pushes per hour:** 120 (for Pro), unlimited (for Premium)
- **Max dataset size:** 1GB (Pro), 100GB (Premium)

### Optimization Tips

1. **Batch Events:**
   - VisionFrame batches events every 5 records
   - Reduces API calls while maintaining real-time feel

2. **Historic Data Analysis:**
   - Enable this when creating dataset
   - Allows PowerBI to store data for complex queries
   - Without it, only recent data (last 30 days) is retained

3. **Use Webhooks:**
   - For critical alerts, set up PowerBI alerts
   - Configure email/Teams notifications for thresholds

---

## Advanced: Custom Metrics

Add custom metrics by extending the dataset schema:

```json
{
  "name": "device_type",
  "dataType": "String"
},
{
  "name": "browser",
  "dataType": "String"
},
{
  "name": "conversion_value",
  "dataType": "Double"
}
```

Update backend to push additional fields:

```python
# backend/app/services/powerbi_stream.py
payload = [
    {
        # ... existing fields
        "device_type": get_device_type(user_agent),
        "browser": get_browser(user_agent),
        "conversion_value": calculate_value(session),
    }
]
```

---

## Security Best Practices

1. **Never commit secrets to Git:**
   - Use Railway environment variables
   - Add `.env` to `.gitignore`

2. **Rotate credentials regularly:**
   - Azure AD client secrets expire (recommend: 6 months)
   - PowerBI API keys can be regenerated in dataset settings

3. **Use OAuth in production:**
   - API key is simpler but less secure
   - OAuth provides better audit trails and granular permissions

4. **Restrict workspace access:**
   - Only grant service principal necessary permissions
   - Use separate workspaces for dev/staging/prod

---

## Cost Estimation

**PowerBI Pro:**
- $9.99/user/month
- 120 pushes/hour per dataset
- 1GB dataset size limit

**PowerBI Premium (P1):**
- $4,995/month
- Unlimited pushes
- 100GB dataset size
- Dedicated capacity for better performance

**Azure AD (optional):**
- Free tier sufficient for service principal
- No additional cost for OAuth tokens

---

## Support Resources

- [PowerBI Push Datasets Documentation](https://docs.microsoft.com/en-us/rest/api/power-bi/push-datasets)
- [Azure AD Authentication](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [PowerBI REST API Reference](https://docs.microsoft.com/en-us/rest/api/power-bi/)

---

## Summary Checklist

- [ ] Create PowerBI Push Dataset with correct schema
- [ ] Copy Push URL from PowerBI
- [ ] Configure authentication (API key or OAuth)
- [ ] Add environment variables to Railway
- [ ] Test connection: `GET /api/telemetry/powerbi/test`
- [ ] Verify events flowing: Check PowerBI dataset
- [ ] Build dashboard with live visualizations
- [ ] Enable auto-refresh (5 seconds)
- [ ] Set up alerts for critical metrics
- [ ] Monitor backend logs for push errors

**Estimated Setup Time:** 30-45 minutes

**Result:** Real-time PowerBI dashboard with live telemetry updates! 🎉
