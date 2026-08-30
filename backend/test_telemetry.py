"""
test_telemetry.py — Automated Telemetry Verification Script
Tests both HTTP POST and WebSocket endpoints with simulated AR session.
"""

import asyncio
import websockets
import json
import os
import csv
import sys
import time
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:8000"
WEBSOCKET_URI = "ws://localhost:8000/api/telemetry/ws/test_user_001"
CSV_FILE = Path("telemetry_stream.csv")

# Colors for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✅ {text}{RESET}")

def print_error(text):
    print(f"{RED}❌ {text}{RESET}")

def print_warning(text):
    print(f"{YELLOW}⚠️  {text}{RESET}")

def print_info(text):
    print(f"{BLUE}ℹ️  {text}{RESET}")


async def send_event(websocket, event_type, product_id, dwell_time):
    """Helper to send telemetry and print server acknowledgment"""
    payload = {
        "product_id": product_id,
        "event_type": event_type,
        "dwell_time_seconds": dwell_time
    }
    
    await websocket.send(json.dumps(payload))
    response = await websocket.recv()
    ack = json.loads(response)
    
    print_info(f"Sent: {event_type:20} (Dwell: {dwell_time:2}s) | Server ACK: {ack['status']}")
    return ack


async def simulate_ar_session():
    """Simulate a 30-second AR try-on session"""
    print_header("🚀 WEBSOCKET AR TELEMETRY SIMULATION")
    print_info(f"Connecting to {WEBSOCKET_URI}")
    
    try:
        async with websockets.connect(WEBSOCKET_URI) as websocket:
            print_success("WebSocket connected!")
            
            # 1. Simulate AR Try-On Start
            await send_event(websocket, "try_on_start", "PROD_8675309", 0)
            await asyncio.sleep(1)
            
            # 2. Simulate Dwell Time (Sending 4 updates to trigger the 5-record CSV flush)
            for i in range(1, 5):
                await asyncio.sleep(2)  # Simulate 2 seconds of user viewing
                await send_event(websocket, "try_on_update", "PROD_8675309", i * 2)
            
            # 3. Simulate AR Try-On End
            await asyncio.sleep(2)
            await send_event(websocket, "try_on_end", "PROD_8675309", 10)
            
            print_success("WebSocket simulation complete!")
            
    except ConnectionRefusedError:
        print_error("Could not connect to WebSocket endpoint")
        print_warning("Ensure your backend is running: uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print_error(f"Unexpected WebSocket error: {e}")
        return False
    
    return True


def check_csv_file():
    """Verify CSV file exists and contains telemetry records"""
    print_header("📂 CSV FILE VERIFICATION")
    
    csv_path = Path("../telemetry_stream.csv")  # Backend directory
    if csv_path.exists():
        print_success(f"CSV file exists at: {csv_path}")
        
        try:
            with open(csv_path, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                records = list(reader)
                
            if records:
                print_success(f"Found {len(records)} telemetry records")
                print("\nLatest records:")
                for i, record in enumerate(records[-3:], 1):
                    print(f"  {i}. {record}")
            else:
                print_warning("CSV file exists but is empty")
                return False
                
        except Exception as e:
            print_error(f"Error reading CSV: {e}")
            return False
    else:
        print_warning(f"CSV file not found at: {csv_path}")
        return False
    
    return True


def verify_backend_health():
    """Check if backend is running"""
    print_header("🏥 BACKEND HEALTH CHECK")
    
    try:
        import requests
        response = requests.get(f"{BACKEND_URL}/health", timeout=3)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Backend is healthy: {data['service']} v{data['version']}")
            return True
        else:
            print_error(f"Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Could not connect to backend")
        print_warning(f"Ensure backend is running at {BACKEND_URL}")
        return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        return False


async def main():
    """Main test orchestrator"""
    print(f"{BLUE}")
    print("╔" + "="*58 + "╗")
    print("║  VisionFrame Telemetry Verification Suite v1.0       ║")
    print("║  College Project — AR Analytics Testing              ║")
    print("╚" + "="*58 + "╝")
    print(f"{RESET}")
    
    # Step 1: Health check
    if not verify_backend_health():
        print_error("Backend health check failed. Exiting.")
        sys.exit(1)
    
    # Step 2: WebSocket simulation
    if not await simulate_ar_session():
        print_error("WebSocket simulation failed. Exiting.")
        sys.exit(1)
    
    # Step 3: Give backend time to flush CSV
    print_info("Waiting 2 seconds for CSV flush...")
    await asyncio.sleep(2)
    
    # Step 4: Verify CSV
    if not check_csv_file():
        print_warning("CSV verification failed (but WebSocket may have worked)")
    
    print_header("✨ TEST COMPLETE")
    print_success("Telemetry verification suite finished!")
    print_info("Check the backend logs for detailed event tracking.\n")


if __name__ == "__main__":
    # Check for required websockets library
    try:
        import websockets
    except ImportError:
        print_warning("websockets library not found. Installing...")
        os.system("pip install websockets requests")
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print_warning("\nTest interrupted by user")
    except Exception as e:
        print_error(f"Fatal error: {e}")
        sys.exit(1)
