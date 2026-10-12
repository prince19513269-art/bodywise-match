import assert from "node:assert/strict";
import { products } from "../src/data/products";
import { ingredients } from "../src/data/ingredients";
const paths = [
  "/",
  "/products",
  "/discover",
  "/compare",
  "/ingredients",
  ...products.map((p) => `/products/${p.id}`),
  ...ingredients.map((i) => `/ingredients/${i.id}`),
  "/products/not-a-product",
];
async function main() {
  for (let start = 0; start < paths.length; start += 4) {
    await Promise.all(
      paths.slice(start, start + 4).map(async (path) => {
        const response = await fetch(`http://127.0.0.1:3000${path}`);
        assert.equal(
          response.status,
          path.endsWith("not-a-product") ? 404 : 200,
          path,
        );
        const html = await response.text();
        assert.ok(html.includes("bodywise"), path);
        if (path === "/products")
          assert.ok(
            html.includes(String(products.length)) &&
              html.includes("Shampoo") &&
              html.includes("12 Oct 2026"),
          );
        console.log(`${response.status} ${path}`);
      }),
    );
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
