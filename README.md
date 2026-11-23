# LATINOO MAX, React + Vite

Arabic RTL restaurant menu, built with React 18 and Vite. All 494 original items and 45 categories remain in `items.json` with their original names, categories and prices. Product images use the existing Foodics URLs; some are category photos.

## Development and build

Requires Node 22.12+.

```sh
npm ci
npm run dev
```

Open `/app.html` during development, or `/app.html?preview=1` to preview a local draft. For the admin during development use the production admin.html, or serve the packaged output as below.

```sh
npm run build
node package-build.mjs
python3 -m http.server 8080
```

The packaging script generates root `index.html` and `admin.html` with React, styles and JavaScript bundled inside. GitHub Pages currently serves these committed production files from main/root, so no additional paid service is needed. After source changes, rebuild, package and commit both generated HTML files. Menu/settings changes need only `items.json`, no build.

## Menu and checkout

- Search, categories, product details and optional suggested add-ons.
- Cart quantities, removal, totals and local reload persistence.
- Delivery enabled; dine-in disabled by default.
- Name, address and contact phone are required by default; notes are optional.
- WhatsApp draft includes order type, customer details, item names, quantities, base prices, separately priced add-ons, unit totals and line totals, the order total, notes and a final delivery-fee disclaimer.
- Receiving number is the owner's approved `201040580225`.
- WhatsApp cannot confirm whether the visitor actually pressed Send. The cart clears on successful opening of the WhatsApp window, not on a delivery receipt. The page explains this. If the popup is blocked, the cart is retained.
- Customer details are not stored or sent to a backend; only the current cart is stored locally. The visitor must press Send in WhatsApp.

## Local admin

Open `admin.html`. On first use choose a local username and unique password of at least 10 characters. Existing local editor credentials and drafts use the same storage keys as the preceding version. No default password, token or shared account is committed.

This gate is only a local convenience, not server-side authentication. It does not protect public data or grant publishing rights. Only repository collaborators can publish changes. Do not store customer records or secrets in the editor.

- Add, edit, remove, hide and reorder products.
- Edit category, name, variant, description, price, image URL or a small uploaded image.
- Select suggested add-ons. Empty selections use automatic suggestions.
- Mark an item as an offer independently from featuring it above the hero.
- Feature any menu item, customize its card title, badge and priority. Existing offer flags are featured until explicitly changed.
- Configure the featured section, hero copy and brand.
- Configure delivery and dine-in availability and labels, field labels and requiredness, notes visibility, WhatsApp title/number, final delivery disclaimer, and cart-clear behavior.
- JSON and Excel import/export, draft preview and restore published data. Excel export includes `Menu` and `Settings` sheets. JSON preserves the full data structure.

Changes are drafts in that browser only. Export `items.json` and replace the repository's root `items.json` to publish. Preview uses `?preview=1`, which only shows the local draft on that browser. Normal visitors always see the published JSON. A real shared admin and automatic publishing still require a backend.

## External dependencies

React is bundled, not fetched at runtime. Photos depend on the existing Foodics image host. Cairo font loads from Google Fonts with local fallback fonts. Excel tools load SheetJS from jsDelivr on demand; JSON import/export works without SheetJS.
