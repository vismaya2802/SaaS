// pages/ProductDetail.jsx — Luxury styled product detail with AR try-on
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../hooks/useAPI";
import ARView from "../components/ARView";
import { useCartStore } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const LENS_TYPES = [
  { value: "zero_power", label: "Zero Power (Fashion)", icon: "✨" },
  { value: "single_vision", label: "Single Vision", icon: "👓" },
  { value: "bifocal", label: "Bifocal / Progressive", icon: "🔍" },
  { value: "sunglasses", label: "Sunglasses (No Rx)", icon: "🕶️" },
];

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const addItem = useCartStore((s) => s.addItem);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lensType, setLensType] = useState("zero_power");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/products/${productId}`)
      .then(({ data }) => setProduct(data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [productId, navigate]);

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      lensType,
      arAssetUrl: product.ar_asset_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-gold-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <main className="min-h-screen page-enter">
      <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-10">
        {/* ── Left: AR view ── */}
        <div className="space-y-4">
          <ARView
            productId={product.id}
            productName={product.title}
            userId={user?.userId || "USER_GUEST"}
            arAssetUrl={product.ar_asset_url}
          />
        </div>

        {/* ── Right: Product info ── */}
        <div className="space-y-6">
          <div>
            {product.collection_tag && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-950 capitalize shadow-lg inline-block">
                {product.collection_tag.replace("_", " ")}
              </span>
            )}
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gold-200 to-gold-400 mt-3 leading-tight">
              {product.title}
            </h1>
            <p className="text-gray-400 capitalize mt-2 text-lg">
              {product.category} · {product.frame_shape ?? "classic frame"}
            </p>
          </div>

          <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600">
            ₹{product.price.toLocaleString()}
          </p>

          <p className={`text-sm font-semibold ${product.stock_count > 0 ? "text-green-400" : "text-red-400"}`}>
            {product.stock_count > 0 ? `✓ In Stock (${product.stock_count} available)` : "✗ Out of Stock"}
          </p>

          {/* Lens type selector with luxury styling */}
          <div className="glass-card p-6">
            <p className="text-sm font-semibold text-gold-400 tracking-wide uppercase mb-4">
              Select Lens Type
            </p>
            <div className="grid grid-cols-2 gap-3">
              {LENS_TYPES.map((lt) => (
                <button
                  type="button"
                  key={lt.value}
                  id={`lens-type-${lt.value}`}
                  onClick={() => setLensType(lt.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium text-left border transition-all ${
                    lensType === lt.value
                      ? "border-gold-500 bg-gradient-to-br from-gold-500/20 to-luxury-600/20 text-white shadow-lg shadow-gold-500/20"
                      : "border-gold-500/20 bg-charcoal-900/30 text-gray-400 hover:border-gold-500/40 hover:text-gold-400"
                  }`}
                >
                  <span className="text-lg mr-2">{lt.icon}</span>
                  {lt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              type="button"
              id="product-add-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock_count === 0}
              className={`w-full text-lg py-4 rounded-xl font-bold transition-all ${
                added 
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/50" 
                  : "btn-primary"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {added ? "✓ Added to Cart!" : "Add to Cart"}
            </button>

            <button
              type="button"
              id="product-buy-now-btn"
              onClick={() => { handleAddToCart(); navigate("/checkout") }}
              className="btn-ghost w-full text-lg py-4"
              disabled={product.stock_count === 0}
            >
              Buy Now
            </button>
          </div>

          {/* Additional info */}
          <div className="glass-card p-6 space-y-3 text-sm text-gray-400">
            <p>✓ Free shipping on orders above ₹2,000</p>
            <p>✓ 30-day hassle-free returns</p>
            <p>✓ 1-year warranty on frames</p>
            <p>✓ AR virtual try-on available</p>
          </div>
        </div>
      </div>
    </main>
  );
}
