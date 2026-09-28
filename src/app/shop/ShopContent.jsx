"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { Loader2, Phone } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import ShopFilterBar from "@/components/ShopFilterBar";
import { extractProductDetails } from "@/lib/utils";
import { trackViewItemList } from "@/lib/ecommerce";

const MAX_RETRIES = 3;

function ProductSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-5 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-10 bg-muted rounded-full w-full mt-4" />
      </div>
    </div>
  );
}

function ShopBody({ initialProducts = [] }) {
  const searchParams = useSearchParams();
  const hasInitial = initialProducts.length > 0;
  const [products, setProducts] = useState(hasInitial ? initialProducts : []);
  const [loading, setLoading] = useState(!hasInitial);
  const [fetchError, setFetchError] = useState(false);
  const [brands, setBrands] = useState(() => {
    if (hasInitial) {
      return Array.from(new Set(initialProducts.map((p) => p.brand).filter(Boolean)));
    }
    return [];
  });
  const [seatFilter, setSeatFilter] = useState("All");
  const [makeFilter, setMakeFilter] = useState(() => {
    const make = searchParams.get("make");
    if (make && hasInitial) {
      const match = initialProducts.find(
        (p) => p.brand && p.brand.toLowerCase() === make.toLowerCase(),
      );
      return match?.brand || make;
    }
    return "All";
  });
  const [colorFilter, setColorFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("Golf Carts");
  const retryCount = useRef(0);

  useEffect(() => {
    const make = searchParams.get("make");
    if (make) {
      const actualBrand = brands.find(
        (b) => b.toLowerCase() === make.toLowerCase(),
      );
      setMakeFilter(actualBrand || make);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setMakeFilter("All");
    }
  }, [searchParams, brands]);

  const fetchProducts = (isRetry = false) => {
    if (!isRetry) retryCount.current = 0;
    setLoading(true);
    setFetchError(false);
    fetch("/api/products")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((res) => {
        const rawItems = res.products || [];
        const collections = res.collections || [];
        const processed = rawItems
          .filter(
            (item) =>
              item.name?.toLowerCase() !== "speed upgrade service",
          )
          .map((item) => extractProductDetails(item, collections));

        const sorted = processed.sort((a, b) => {
          if (a.inStock && !b.inStock) return -1;
          if (!a.inStock && b.inStock) return 1;
          return 0;
        });

        setProducts(sorted);
        retryCount.current = 0;

        const uniqueBrands = Array.from(
          new Set(sorted.map((p) => p.brand).filter(Boolean)),
        );
        setBrands(uniqueBrands);

        const make = searchParams.get("make");
        if (make) {
          const matchedBrand = uniqueBrands.find(
            (b) => b.toLowerCase() === make.toLowerCase(),
          );
          if (matchedBrand) setMakeFilter(matchedBrand);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        retryCount.current += 1;
        if (retryCount.current < MAX_RETRIES) {
          setTimeout(() => fetchProducts(true), 1500 * retryCount.current);
          return;
        }
        setFetchError(true);
      })
      .finally(() => {
        if (retryCount.current === 0 || retryCount.current >= MAX_RETRIES) {
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    if (!hasInitial) fetchProducts();
  }, []);

  const hasAccessories = products.some((p) => p.isAccessory);

  const categoryProducts = products.filter((p) => {
    return categoryFilter === "Golf Carts" ? !p.isAccessory : p.isAccessory;
  });

  const categoryBrands = Array.from(
    new Set(categoryProducts.map((p) => p.brand).filter(Boolean)),
  );

  const categoryColors = Array.from(
    new Set(categoryProducts.flatMap((p) => p.colors || []).filter(Boolean)),
  );

  const filtered = categoryProducts.filter((p) => {
    let seatMatch = true;
    if (categoryFilter === "Golf Carts") {
      if (seatFilter === "2 Seats") seatMatch = p.seats === 2;
      else if (seatFilter === "4 Seats") seatMatch = p.seats === 4;
      else if (seatFilter === "6 Seats") seatMatch = p.seats === 6;
      else if (seatFilter === "8 Seats") seatMatch = p.seats >= 8;
    }

    const makeMatch =
      categoryFilter === "Accessories" ||
      makeFilter === "All" ||
      (p.brand && p.brand.toLowerCase() === makeFilter.toLowerCase());

    const colorMatch =
      colorFilter === "All" ||
      (p.colors &&
        p.colors.some((c) =>
          c.toLowerCase().includes(colorFilter.toLowerCase()),
        ));

    return seatMatch && makeMatch && colorMatch;
  });

  const filteredIds = filtered.map((p) => p.id).join(",");
  useEffect(() => {
    if (!filteredIds) return;
    trackViewItemList(filtered, `Shop - ${categoryFilter}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredIds, categoryFilter]);

  const handleCategoryChange = (cat) => {
    setCategoryFilter(cat);
    setSeatFilter("All");
    setMakeFilter("All");
    setColorFilter("All");
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Our Inventory"
          title="Shop Golf Carts"
          description="Browse our full selection of new electric golf carts and street-legal LSVs from top brands."
        />

        {/* Hero Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10 mt-6">
          <a
            href="tel:6037777831"
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 w-full sm:w-auto min-w-[240px] group"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Phone className="w-4 h-4 fill-current" />
            </div>
            <span className="text-base">Call us to Buy Today</span>
          </a>
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-ai-chat"))
            }
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white font-bold rounded-xl border border-white/10 shadow-lg transition-all hover:scale-105 w-full sm:w-auto min-w-[240px] group"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <span className="text-xl">🤖</span>
            </div>
            <span className="text-base">Find My Cart with AI</span>
          </button>
        </div>

        {/* Category Selection — only show tabs when accessories exist */}
        {hasAccessories && (
          <div className="flex justify-center gap-4 mb-8">
            {["Golf Carts", "Accessories"].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                disabled={loading}
                className={`px-8 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-sm border ${
                  categoryFilter === cat ?
                    "bg-accent  text-white border-accent scale-105"
                  : "bg-white text-muted-foreground border-border hover:border-accent hover:text-accent"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {categoryFilter === "Golf Carts" && (
          <ShopFilterBar
            brands={categoryBrands}
            seatFilter={seatFilter}
            setSeatFilter={setSeatFilter}
            makeFilter={makeFilter}
            setMakeFilter={setMakeFilter}
            colorFilter={colorFilter}
            setColorFilter={setColorFilter}
            colorOptions={categoryColors}
            category={categoryFilter}
            count={filtered.length}
            loading={loading}
          />
        )}

        {loading ?
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        : fetchError ?
          <div className="text-center py-32">
            <p className="text-muted-foreground mb-4">Unable to load products. Please try again.</p>
            <button
              onClick={() => fetchProducts()}
              className="px-6 py-2.5 bg-accent text-white font-semibold rounded-full hover:bg-accent/90 transition-colors"
            >
              Retry
            </button>
          </div>
        : filtered.length === 0 ?
          <div className="text-center py-32 text-muted-foreground">
            No {categoryFilter === "Accessories" ? "accessories" : "carts"} match your filters.
          </div>
        : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((cart, i) => (
              <ProductCard key={cart.id} cart={cart} index={i} />
            ))}
          </div>
        }
      </div>
    </div>
  );
}

export default function ShopContent({ initialProducts = [] }) {
  return (
    <Suspense
      fallback={
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              label="Our Inventory"
              title="Shop Golf Carts"
              description="Browse our full selection of new electric golf carts and street-legal LSVs from top brands."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ShopBody initialProducts={initialProducts} />
    </Suspense>
  );
}
