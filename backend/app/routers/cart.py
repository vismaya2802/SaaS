"""
routers/cart.py — In-session cart management.

POST /api/cart/add    → add item to user's cart
GET  /api/cart/{user_id} → view cart contents
DELETE /api/cart/remove  → remove item from cart

NOTE: Cart is stored in-memory (dict) for the college demo.
      Replace with a Redis-backed or DB cart for production.
"""

from typing import Dict, List

from fastapi import APIRouter, HTTPException, status

from app.schemas import CartAddRequest, CartAddResponse

router = APIRouter()

# ─── In-memory cart store ─────────────────────────────────────────────────────
# Structure: { user_id: [ { product_id, lens_type, quantity } ] }
_cart_store: Dict[str, List[dict]] = {}


# ─── POST /api/cart/add ───────────────────────────────────────────────────────
@router.post("/add", response_model=CartAddResponse, status_code=status.HTTP_200_OK)
def add_to_cart(body: CartAddRequest):
    """
    Add a product to the user's cart with a selected lens type.
    Duplicate product_id + lens_type combos increment quantity.
    """
    user_cart = _cart_store.setdefault(body.user_id, [])

    # Check for existing identical entry
    for item in user_cart:
        if item["product_id"] == body.product_id and item["lens_type"] == body.lens_type:
            item["quantity"] += body.quantity
            return CartAddResponse(
                success=True,
                message="Cart item quantity updated.",
                cart_item_count=len(user_cart),
            )

    user_cart.append(
        {
            "product_id": body.product_id,
            "lens_type": body.lens_type,
            "quantity": body.quantity,
        }
    )
    return CartAddResponse(
        success=True,
        message="Item added to cart.",
        cart_item_count=len(user_cart),
    )


# ─── GET /api/cart/{user_id} ──────────────────────────────────────────────────
@router.get("/{user_id}")
def get_cart(user_id: str):
    """Return the current cart contents for a user."""
    cart = _cart_store.get(user_id, [])
    return {"user_id": user_id, "items": cart, "item_count": len(cart)}


# ─── DELETE /api/cart/remove ──────────────────────────────────────────────────
@router.delete("/remove")
def remove_from_cart(user_id: str, product_id: str, lens_type: str):
    """Remove a specific item from the user's cart."""
    user_cart = _cart_store.get(user_id, [])
    updated = [
        i for i in user_cart
        if not (i["product_id"] == product_id and i["lens_type"] == lens_type)
    ]
    _cart_store[user_id] = updated
    return {"success": True, "item_count": len(updated)}
