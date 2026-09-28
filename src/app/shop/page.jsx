import { wixClient } from "@/lib/wixClient";
import { extractProductDetails } from "@/lib/utils";
import ShopContent from "./ShopContent";

export const revalidate = 300;

async function getProducts() {
  try {
    const [productsRes, collectionsRes] = await Promise.all([
      wixClient.products.queryProducts().limit(100).find(),
      wixClient.collections.queryCollections().limit(100).find(),
    ]);
    const rawItems = productsRes.items || [];
    const collections = collectionsRes.items || [];
    return rawItems
      .filter(
        (item) => item.name?.toLowerCase() !== "speed upgrade service",
      )
      .map((item) => extractProductDetails(item, collections));
  } catch (err) {
    console.error("Error fetching products for shop:", err);
    return [];
  }
}

export default async function Shop({ searchParams }) {
  const sp = (await searchParams) || {};
  const makeParam = sp.make;
  const makeLower = makeParam?.toLowerCase();

  const products = await getProducts();

  const sorted = [...products].sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return 0;
  });

  let itemListName = "Electric Golf Carts for Sale — SNH Golf Carts LLC";
  let itemListDesc =
    "Browse new and used electric golf carts and street-legal LSVs from DACH, TEKO, Tomberlin, and Evolution Series. Starting at $8,000.";
  let itemListUrl = "https://www.snhgolfcarts.com/shop";
  let itemListElement;

  if (makeLower === "dach") {
    itemListName = "DACH Electric Golf Carts — SNH Golf Carts LLC";
    itemListDesc =
      "Browse DACH electric golf carts for sale at SNH Golf Carts LLC in Londonderry, NH. Premium DACH models with manufacturer warranty.";
    itemListUrl = "https://www.snhgolfcarts.com/shop?make=DACH";
    itemListElement = [
      {
        "@type": "ListItem",
        "position": 1,
        "url": "https://www.snhgolfcarts.com/shop?make=DACH",
      },
    ];
  } else if (makeLower === "teko") {
    itemListName = "TEKO Electric Golf Carts — SNH Golf Carts LLC";
    itemListDesc =
      "Browse TEKO electric golf carts for sale at SNH Golf Carts LLC in Londonderry, NH. Premium TEKO models with manufacturer warranty.";
    itemListUrl = "https://www.snhgolfcarts.com/shop?make=TEKO";
    itemListElement = [
      {
        "@type": "ListItem",
        "position": 1,
        "url": "https://www.snhgolfcarts.com/shop?make=TEKO",
      },
    ];
  } else {
    itemListElement = sorted.map((p, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `https://www.snhgolfcarts.com/product/${p.slug || p.id}`,
    }));
  }

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": itemListName,
    "description": itemListDesc,
    "url": itemListUrl,
    "numberOfItems": itemListElement.length,
    "itemListElement": itemListElement,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema).replace(/</g, "\\u003c"),
        }}
      />
      <ShopContent initialProducts={sorted} />
    </>
  );
}
