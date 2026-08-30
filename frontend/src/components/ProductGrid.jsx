// components/ProductGrid.jsx — Responsive product card grid with filters
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../hooks/useAPI";
import { useCartStore } from "../context/CartContext";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  // Fallback image if the URL is broken or missing
  const fallbackImage = "https://cdn.pixabay.com/photo/2016/12/10/16/57/glasses-1897632_1280.png";

  // Map the exact column name from seed data (ar_asset_url)
  const imageUrl = product.ar_asset_url || fallbackImage;

  return (
    <div
      id={`product-card-${product.id}`}
      className="product-card group"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Placeholder image area */}
      <div className="w-full h-44 rounded-xl bg-gradient-to-br from-brand-900/60 to-accent-500/20 flex items-center justify-center mb-4 overflow-hidden relative">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-contain"
          crossOrigin="anonymous"
          onError={(e) => {
            console.warn(`Failed to load image for ${product.title}, using fallback`);
            e.target.src = fallbackImage;
          }}
        />
        {product.collection_tag && (
          <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full bg-brand-600/80 text-white capitalize">
            {product.collection_tag.replace("_", " ")}
          </span>
        )}
        
      </div>

      <h3 className="font-semibold text-white text-sm mb-1 truncate">{product.title}</h3>
      <p className="text-xs text-gray-400 capitalize mb-3">
        {product.category} · {product.frame_shape ?? "classic"}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-brand-400">₹{product.price.toLocaleString()}</span>
        <button
          id={`add-cart-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            addItem({
              productId: product.id,
              title: product.title,
              price: product.price,
              lensType: "zero_power",
              arAssetUrl: product.ar_asset_url,
            });
          }}
          className="text-xs btn-primary px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          + Cart
        </button>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (searchParams.get("category")) params.category = searchParams.get("category");
    if (searchParams.get("shape")) params.shape = searchParams.get("shape");
    if (searchParams.get("collection_type")) params.collection_type = searchParams.get("collection_type");

    api.get("/products", { params })
      .then(({ data }) => setProducts(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card h-72 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">🔍</p>
        <p>No products found. Try a different filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 pb-8">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

