"""
services/powerbi_stream.py — PowerBI Push Dataset streaming service with Azure AD integration.

Pushes telemetry events to a PowerBI Real-Time Push Dataset via the PowerBI REST API.
Supports both API Key authentication and Azure AD OAuth (service principal).

Configuration:
- POWERBI_PUSH_URL: Push Dataset REST API endpoint (required)
- POWERBI_API_KEY: Push Dataset API key (optional, for key-based auth)
- POWERBI_CLIENT_ID: Azure AD service principal client ID (optional, for OAuth)
- POWERBI_CLIENT_SECRET: Azure AD service principal secret (optional, for OAuth)
- POWERBI_TENANT_ID: Azure AD tenant ID (optional, for OAuth)

If no config is provided, streaming silently fails (safe for dev/demo).
"""

import os
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx

# ─── Config (set via environment variables) ────────────────────────────────────
POWERBI_PUSH_URL: str | None = os.getenv("POWERBI_PUSH_URL")
# Format: https://api.powerbi.com/beta/<workspace-id>/datasets/<dataset-id>/rows?key=<optional-key>

# Authentication options
POWERBI_API_KEY: str | None = os.getenv("POWERBI_API_KEY")  # For key-based auth
POWERBI_CLIENT_ID: str | None = os.getenv("POWERBI_CLIENT_ID")  # Azure AD OAuth
POWERBI_CLIENT_SECRET: str | None = os.getenv("POWERBI_CLIENT_SECRET")
POWERBI_TENANT_ID: str | None = os.getenv("POWERBI_TENANT_ID")

# Token cache (in-memory, for demo; use Redis in production)
_oauth_token_cache: Dict[str, Any] = {}


def _get_azure_ad_token() -> Optional[str]:
    """
    Get Azure AD OAuth access token for PowerBI API using service principal.
    Caches token until expiry.
    """
    if not all([POWERBI_CLIENT_ID, POWERBI_CLIENT_SECRET, POWERBI_TENANT_ID]):
        return None
    
    # Check cache
    if "access_token" in _oauth_token_cache:
        expires_at = _oauth_token_cache.get("expires_at", 0)
        if datetime.now(timezone.utc).timestamp() < expires_at:
            return _oauth_token_cache["access_token"]
    
    # Request new token
    token_url = f"https://login.microsoftonline.com/{POWERBI_TENANT_ID}/oauth2/v2.0/token"
    
    try:
        response = httpx.post(
            token_url,
            data={
                "grant_type": "client_credentials",
                "client_id": POWERBI_CLIENT_ID,
                "client_secret": POWERBI_CLIENT_SECRET,
                "scope": "https://analysis.windows.net/powerbi/api/.default",
            },
            timeout=10.0,
        )
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")
            expires_in = token_data.get("expires_in", 3600)
            
            # Cache token (expires in X seconds, minus 60s buffer)
            _oauth_token_cache["access_token"] = access_token
            _oauth_token_cache["expires_at"] = (
                datetime.now(timezone.utc).timestamp() + expires_in - 60
            )
            
            return access_token
    except httpx.RequestError as e:
        print(f"[WARN] Failed to get Azure AD token: {e}")
    
    return None


def push_event_to_powerbi(
    product_id: str,
    event_type: str,
    dwell_time_seconds: int,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
) -> bool:
    """
    Push a single telemetry event to PowerBI streaming dataset.
    
    Returns True if the push succeeds, False otherwise.
    Gracefully fails when PowerBI is not configured (safe for dev).
    
    Dataset schema expected (columns):
        - product_id (Text)
        - event_type (Text)
        - dwell_time (Number)
        - user_id (Text, optional)
        - session_id (Text, optional)
        - timestamp (DateTime)
    """
    if not POWERBI_PUSH_URL:
        # Graceful no-op when PowerBI is not configured
        return False
    
    payload = [
        {
            "product_id": product_id or "UNKNOWN",
            "event_type": event_type or "UNKNOWN",
            "dwell_time": dwell_time_seconds or 0,
            "user_id": user_id or "ANONYMOUS",
            "session_id": session_id or "NO_SESSION",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    ]
    
    headers = {"Content-Type": "application/json"}
    
    # Try OAuth first, then API key, then no auth
    if POWERBI_CLIENT_ID and POWERBI_CLIENT_SECRET:
        token = _get_azure_ad_token()
        if token:
            headers["Authorization"] = f"Bearer {token}"
    elif POWERBI_API_KEY:
        headers["Authorization"] = f"Bearer {POWERBI_API_KEY}"
    
    try:
        response = httpx.post(
            POWERBI_PUSH_URL,
            content=json.dumps(payload),
            headers=headers,
            timeout=5.0,
        )
        
        if response.status_code in (200, 201, 204):
            return True
        else:
            print(f"[WARN] PowerBI push failed: {response.status_code} - {response.text}")
            return False
            
    except httpx.RequestError as e:
        # Network failure — don't crash the main request
        print(f"[WARN] PowerBI push network error: {e}")
        return False


def push_batch_to_powerbi(events: list[Dict[str, Any]]) -> bool:
    """
    Push a batch of events to PowerBI streaming dataset.
    More efficient than individual pushes for bulk operations.
    
    Args:
        events: List of event dicts with keys: product_id, event_type, dwell_time_seconds, user_id, session_id
    
    Returns:
        True if batch push succeeds, False otherwise.
    """
    if not POWERBI_PUSH_URL or not events:
        return False
    
    payload = [
        {
            "product_id": e.get("product_id", "UNKNOWN"),
            "event_type": e.get("event_type", "UNKNOWN"),
            "dwell_time": e.get("dwell_time_seconds", 0),
            "user_id": e.get("user_id", "ANONYMOUS"),
            "session_id": e.get("session_id", "NO_SESSION"),
            "timestamp": e.get("timestamp", datetime.now(timezone.utc).isoformat()),
        }
        for e in events
    ]
    
    headers = {"Content-Type": "application/json"}
    
    # Try OAuth first, then API key
    if POWERBI_CLIENT_ID and POWERBI_CLIENT_SECRET:
        token = _get_azure_ad_token()
        if token:
            headers["Authorization"] = f"Bearer {token}"
    elif POWERBI_API_KEY:
        headers["Authorization"] = f"Bearer {POWERBI_API_KEY}"
    
    try:
        response = httpx.post(
            POWERBI_PUSH_URL,
            content=json.dumps(payload),
            headers=headers,
            timeout=10.0,
        )
        
        if response.status_code in (200, 201, 204):
            print(f"[OK] PowerBI batch push: {len(events)} events")
            return True
        else:
            print(f"[WARN] PowerBI batch push failed: {response.status_code}")
            return False
            
    except httpx.RequestError as e:
        print(f"[WARN] PowerBI batch push error: {e}")
        return False


def test_powerbi_connection() -> Dict[str, Any]:
    """
    Test PowerBI connection and authentication.
    Returns status dict with connection details.
    """
    if not POWERBI_PUSH_URL:
        return {
            "configured": False,
            "message": "POWERBI_PUSH_URL not set. PowerBI integration disabled.",
        }
    
    # Test authentication
    auth_method = "none"
    auth_valid = False
    
    if POWERBI_CLIENT_ID and POWERBI_CLIENT_SECRET and POWERBI_TENANT_ID:
        auth_method = "oauth"
        token = _get_azure_ad_token()
        auth_valid = token is not None
    elif POWERBI_API_KEY:
        auth_method = "api_key"
        auth_valid = True
    
    # Test push with dummy data
    test_success = push_event_to_powerbi(
        product_id="TEST_PRODUCT",
        event_type="connection_test",
        dwell_time_seconds=0,
        user_id="TEST_USER",
        session_id="TEST_SESSION",
    )
    
    return {
        "configured": True,
        "push_url": POWERBI_PUSH_URL[:50] + "..." if len(POWERBI_PUSH_URL) > 50 else POWERBI_PUSH_URL,
        "auth_method": auth_method,
        "auth_valid": auth_valid,
        "test_push_success": test_success,
        "message": "PowerBI connection test completed.",
    }

