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
- Current WhatsApp order destination: `201040580225`.
- On a valid order-button click the cart clears immediately, even when WhatsApp fails to open. WhatsApp does not confirm sending or receipt. Customers still need to press Send in WhatsApp.
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

## Contact section and brand

The header uses the supplied cropped logo. Featured offers support horizontal swipe, arrow controls and card interactions. Search covers the selected main section while text is entered; clearing it returns to the chosen category.

The contact section has one editable branch with three phone rows with the supplied place name, address and repeated phone number. Edit, add, remove or hide entries from interface settings. JSON and Excel Settings exports preserve branch data. Contact buttons open a phone call or WhatsApp chat; they do not send a message.

## Two main menu sections (branch preview)

The menu now starts with المنيو الأساسي and الحلو. Existing categories remain as horizontally scrollable type filters under the sticky section toggle. Category order follows the JSON; no unverified popularity ranking is implied. Search and offers are scoped to the selected section. All 494 items, original categories, prices, IDs, images and add-on links are retained.

Each item in `items.json` has `section: "main"` or `section: "sweets"`. The local admin item editor and Excel `Section` column also support this field. Older JSON without the field remains compatible: the five dessert categories الحلو، الوافل، الكعك والبسكويت، الايس كريم، ايس كريم تارتات default to sweets; other categories default to main. Drinks and shared bar add-ons stay in main. The crepes currently listed are savory, so remain in main. Explicit item section values override these defaults.

This branch does not change the live GitHub Pages site until it is reviewed and merged. To preview, download this branch and serve its root with `python3 -m http.server 8080`.
