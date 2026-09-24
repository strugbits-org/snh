import type { NextConfig } from "next";
import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { products } from "@wix/stores";

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

// Slugify fallback for products that lack a Wix slug — keep in sync with
// `slugify` in src/lib/utils.js.
function slugify(text: string): string {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Build-time fetch of every product. Used to emit redirects from the old
// URL shapes Google still has indexed to the live `/product/<slug>` pages.
async function fetchProducts(): Promise<any[]> {
  const apiKey = process.env.WIX_API_KEY || process.env.NEXT_PUBLIC_WIX_API_KEY;
  const siteId = process.env.WIX_SITE_ID || process.env.NEXT_PUBLIC_WIX_SITE_ID;

  if (!apiKey || !siteId) {
    console.warn(
      "[next.config] WIX_API_KEY / WIX_SITE_ID missing — legacy product URLs will fall back to /shop.",
    );
    return [];
  }

  try {
    const client = createClient({
      modules: { products },
      auth: ApiKeyStrategy({ apiKey, siteId }),
    });

    const all: any[] = [];
    let skip = 0;
    // Page through the catalog so a store larger than one page still gets
    // complete redirect coverage.
    for (;;) {
      const res = await client.products
        .queryProducts()
        .limit(100)
        .skip(skip)
        .find();
      const items = res.items || [];
      all.push(...items);
      if (items.length < 100) break;
      skip += 100;
    }
    return all;
  } catch (err) {
    console.error("[next.config] Failed to fetch products for redirects:", err);
    return [];
  }
}

// Legacy UUID product URLs → the slug URL for the same product.
function uuidRedirects(items: any[]): Redirect[] {
  return items
    .map((p) => {
      const id = p._id || p.id;
      const slug = p.slug || slugify(p.name);
      if (!id || !slug || id === slug) return null;
      return {
        source: `/product/${id}`,
        destination: `/product/${slug}`,
        permanent: true,
      };
    })
    .filter(Boolean) as Redirect[];
}

// The Wix site served products under `/product-page/<slug>`, and an even
// earlier structure used the plural `/products/<slug>`. Both are dead now.
// For every product that still exists we redirect to its live page; anything
// left over is caught by the wildcards in `staticRedirects` and sent to /shop
// (many of the old carts — Evolution D5, Carrier, Turfman, Froster — are no
// longer in the catalog at all).
function legacyProductPathRedirects(items: any[]): Redirect[] {
  const redirects: Redirect[] = [];

  for (const p of items) {
    const slug = p.slug || slugify(p.name);
    if (!slug) continue;
    for (const prefix of ["/product-page", "/products"]) {
      redirects.push({
        source: `${prefix}/${slug}`,
        destination: `/product/${slug}`,
        permanent: true,
      });
    }
  }

  return redirects;
}

// Order matters — the first matching redirect wins, so every specific rule
// has to sit above the wildcard that would otherwise swallow it.
const staticRedirects: Redirect[] = [
  // --- Old .html pages -----------------------------------------------------
  { source: "/index.html", destination: "/", permanent: true },
  { source: "/about.html", destination: "/about", permanent: true },
  { source: "/contact.html", destination: "/contact", permanent: true },
  { source: "/rentals.html", destination: "/rentals", permanent: true },
  // There is no /services overview page by design, so the old services page
  // and the bare /services path both land on Repair & Maintenance.
  {
    source: "/services.html",
    destination: "/services/repair",
    permanent: true,
  },
  { source: "/services", destination: "/services/repair", permanent: true },
  { source: "/shop.html", destination: "/shop", permanent: true },
  // Same two pages were also linked under the old /products/ prefix. These
  // must precede the /products/:path* wildcard below.
  { source: "/products/about.html", destination: "/about", permanent: true },
  { source: "/products/shop.html", destination: "/shop", permanent: true },

  // --- Wix booking / service pages ----------------------------------------
  {
    source: "/booking-calendar/golf-cart-rentals",
    destination: "/rentals",
    permanent: true,
  },
  { source: "/book-online", destination: "/contact", permanent: true },
  // Any other old booking-calendar URL: booking now happens via the contact form.
  {
    source: "/booking-calendar/:path*",
    destination: "/contact",
    permanent: true,
  },
  // `/service-page/<slug>` was Wix's service detail route. The slugs we still
  // publish map straight across; anything else goes to the contact form.
  {
    source: "/service-page/:slug(repair|winterization)",
    destination: "/services/:slug",
    permanent: true,
  },
  { source: "/service-page/:path*", destination: "/contact", permanent: true },

  // --- Retired service page ------------------------------------------------
  // The upgrades page has been pulled. Every nav, footer and 404 link to it is
  // gone, so this only catches indexed URLs and old bookmarks. Sits above the
  // dead-slug rules below because redirects are matched in order.
  { source: "/services/upgrades", destination: "/", permanent: true },

  // --- Dead service slugs --------------------------------------------------
  // Before commit 24452e4 the /services/[slug] page fell back to the repair
  // content for *any* slug, so these junk URLs served a full HTTP 200 page of
  // Repair & Maintenance content. That fallback is gone (unknown slugs now
  // 404), but the URLs are still indexed and still collecting hits — sending
  // them to /services/repair matches the content they actually used to serve.
  // Listed explicitly rather than as a /services/:slug wildcard, which would
  // hijack the live service pages and any service added to the CMS later.
  {
    source: "/services/something",
    destination: "/services/repair",
    permanent: true,
  },
  { source: "/services/121", destination: "/services/repair", permanent: true },

  // --- Old Wix category / brand landing pages ------------------------------
  { source: "/dach", destination: "/shop?make=DACH", permanent: true },
  { source: "/teko", destination: "/shop?make=TEKO", permanent: true },
  { source: "/tomberlin", destination: "/shop", permanent: true },
  { source: "/category/:path*", destination: "/shop", permanent: true },

  // --- Deleted products ----------------------------------------------------
  // A UUID URL that `uuidRedirects` did not claim belongs to a product that no
  // longer exists (e.g. /product/53ae4de4-90c0-1ce3-6114-89b5f7174304).
  {
    source:
      "/product/:id([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})",
    destination: "/shop",
    permanent: true,
  },

  // --- Catch-alls for the two dead product prefixes ------------------------
  // Reached only when the product is gone from the catalog. Sending these to
  // /shop keeps the visitor in the funnel instead of dead-ending on a 404.
  { source: "/product-page/:path*", destination: "/shop", permanent: true },
  { source: "/products/:path*", destination: "/shop", permanent: true },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    const items = await fetchProducts();
    const generated = [...uuidRedirects(items), ...legacyProductPathRedirects(items)];

    console.log(
      `[next.config] ${generated.length} product redirects generated from ${items.length} live products, plus ${staticRedirects.length} static redirects.`,
    );

    // Generated rules first: they are exact paths, and they must win over the
    // /product-page/:path* and /products/:path* wildcards.
    return [...generated, ...staticRedirects];
  },
};

export default nextConfig;
