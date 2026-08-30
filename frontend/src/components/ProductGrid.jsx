// components/ProductGrid.jsx — Luxury styled product grid
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../hooks/useAPI";
import { useCartStore } from "../context/CartContext";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  const fallbackImage = "https://cdn.pixabay.com/photo/2016/12/10/16/57/glasses-1897632_1280.png";
  const imageUrl = product.ar_asset_url || fallbackImage;

  return (
    <div
      id={`product-card-${product.id}`}
      className="product-card group cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image area with luxury gradient */}
      <div className="w-full h-48 rounded-xl bg-gradient-to-br from-charcoal-900 via-luxury-950 to-charcoal-900 flex items-center justify-center mb-4 overflow-hidden relative border border-gold-500/10">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
          crossOrigin="anonymous"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />
        {product.collection_tag && (
          <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-950 capitalize shadow-lg">
            {product.collection_tag.replace("_", " ")}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-white text-base mb-1 truncate group-hover:text-gold-400 transition-colors">
        {product.title}
      </h3>
      <p className="text-xs text-gray-400 capitalize mb-3">
        {product.category} · {product.frame_shape ?? "classic"}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
          ₹{product.price.toLocaleString()}
        </span>
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
          className="text-xs btn-primary px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
        >
          + Add to Cart
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

    api
      .get("/products", { params })
      .then(({ data }) => setProducts(data.products || []))
      .catch((err) => console.error("Failed to load products:", err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="w-full h-48 rounded-xl bg-charcoal-800 mb-4" />
            <div className="h-4 bg-charcoal-800 rounded mb-2 w-3/4" />
            <div className="h-3 bg-charcoal-800 rounded mb-3 w-1/2" />
            <div className="h-5 bg-charcoal-800 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gold-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-400 text-lg mb-2">No products found</p>
        <p className="text-gray-500 text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
