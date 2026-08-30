// pages/ProductDetail.jsx — Product detail page with AR try-on
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../hooks/useAPI";
import ARView from "../components/ARView";
import { useCartStore } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const LENS_TYPES = [
  { value: "zero_power", label: "Zero Power (Fashion)" },
  { value: "single_vision", label: "Single Vision" },
  { value: "bifocal", label: "Bifocal / Progressive" },
  { value: "sunglasses", label: "Sunglasses (No Rx)" },
];

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
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
        <div className="w-12 h-12 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const { user } = useAuth();

  return (
    <main className="min-h-screen page-enter">
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        {/* ── Left: AR view + image ── */}
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
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-brand-600/80 text-white capitalize">
                {product.collection_tag.replace("_", " ")}
              </span>
            )}
            <h1 className="text-3xl font-extrabold text-white mt-2">{product.title}</h1>
            <p className="text-gray-400 capitalize mt-1">
              {product.category} · {product.frame_shape ?? "classic frame"}
            </p>
          </div>

          <p className="text-4xl font-bold text-brand-400">₹{product.price.toLocaleString()}</p>

          <p className={`text-sm font-medium ${product.stock_count > 0 ? "text-green-400" : "text-red-400"}`}>
            {product.stock_count > 0 ? `✓ In Stock (${product.stock_count} left)` : "✗ Out of Stock"}
          </p>

          {/* Lens type selector */}
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">Select Lens Type</p>
            <div className="grid grid-cols-2 gap-2">
              {LENS_TYPES.map((lt) => (
                <button
                  type="button"
                  key={lt.value}
                  id={`lens-type-${lt.value}`}
                  onClick={() => setLensType(lt.value)}
                  className={`px-3 py-2 rounded-xl text-sm text-left border transition-all ${
                    lensType === lt.value
                      ? "border-brand-500 bg-brand-600/20 text-white"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/30"
                  }`}
                >
                  {lt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <button
            type="button"
            id="product-add-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock_count === 0}
            className={`btn-primary w-full text-lg py-4 transition-all ${
              added ? "from-green-600 to-green-500" : ""
            }`}
          >
            {added ? "✓ Added to Cart!" : "Add to Cart"}
          </button>

          <button
            type="button"
            id="product-buy-now-btn"
            onClick={() => { handleAddToCart(); navigate("/checkout") }}
            className="btn-ghost w-full text-lg py-4"
          >
            Buy Now
          </button>
        </div>
      </div>
    </main>
  );
}
