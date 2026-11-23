# LATINOO MAX menu

Arabic, RTL, mobile-first restaurant menu. Static HTML/CSS/JavaScript, with no build step and no paid services.

## Run locally

From this folder:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`. Do not open the HTML file directly: the menu loads `items.json` with fetch. Production should use HTTPS, for example GitHub Pages.

## Menu source

`items.json` is the single published source of truth. It contains all 494 rows and all 45 categories from the supplied `menu-source.xlsx`. Names, prices and categories are unchanged. Prices are EGP. Pizza sizes are kept in their original categories and names, rather than inventing variants.

Images use URLs from the restaurant's public Foodics menu feed. They depend on those external image hosts remaining available. Where an item did not have its own image, its category image is used. Category photos are illustrative, not a claim that every item looks identical. Some items appear in multiple source categories: IDs were made unique without dropping either row.

Source feed: https://cdn.getsolo.io/apps/production/yXKSWI12HUp-menu-8457.json
Menu: https://latinoo-max.foodics.online/menu/

The editor exports an editable Excel workbook with stable IDs, image paths, availability, offer flags, display priority and suggested add-on IDs. An offline project ZIP also includes the original source workbook.

## Admin / local editor

Open `/admin.html` relative to the site root. For a project site this is `/<repository>/admin.html`.

On first use, choose a username and a unique local password of at least 10 characters. There is no default password, server account, shared admin account or credential committed to this repository. The browser stores a salted PBKDF2 hash, not the password. The editor locks again on refresh.

**This is not server-side authentication.** The gate only discourages casual editing on that browser. Anyone can create their own local editor. Only someone authorized on the GitHub repository can change the published menu. Do not use the editor to store private information or reuse an important password.

Features:

- Add, edit and delete products and categories.
- Set the price, description, variant and within-category display priority. A lower number sorts first.
- Toggle availability without deleting a product.
- Mark any item as an offer. Products from the original offer category are marked as offers initially. Unchecking the offer flag removes them from the Offers filter.
- Use an HTTPS image URL or upload a PNG/JPG/WebP up to 500 KB. Uploads are embedded into the exported JSON.
- Choose specific add-on recommendations, or leave them empty for category-based suggestions. Suggestions use actual existing menu items and prices. They are not allergy or dietary guarantees.
- Import/export Excel and JSON. Import replaces the product list after confirmation. Back up first.
- Preview the local draft without changing the published menu.

Drafts and the lock live only in this browser's local storage. Other devices do not see them. Clearing site storage deletes them. Export backups regularly. Local storage has a limited capacity; if many uploaded images fill it, the editor displays a warning. Use image URLs or export your JSON immediately.

### Publishing edits

1. Save edits in the local editor.
2. Export `items.json` and optionally an Excel backup.
3. Sign in to the GitHub account authorized to edit this repository.
4. Choose **Add file > Upload files**, upload the new `items.json` to the repository root, and commit the change.
5. Wait for the Pages deployment to finish. Reload the normal menu URL without `?preview=1` and verify the result.

The export does not publish itself. No GitHub access tokens are collected, stored or exposed by the website.

For true shared admin login, server-side authorization and immediate cross-device publishing, migrate to a backend with authenticated writes and media storage. The current data format can be reused.

### Spreadsheet workflow

The editor accepts the original workbook columns: `Category`, `Item`, `Description`, `Size/Variant`, `Price`, `Currency`. Its exported workbook additionally includes `ID`, `Image`, `Priority`, `Available`, `Offer`, `Addon IDs`. Keep IDs unchanged when editing. Add-on IDs are comma separated. Prices must be nonnegative numbers.

Optional Python conversion:

```sh
pip install openpyxl
python3 scripts/import_excel.py menu-source.xlsx items.json
```

This converts the original seven-column format while keeping existing editorial fields for matching names and categories. For the extended workbook use the admin importer.

## Cart and checkout

The cart supports optional add-ons, merged identical configurations, separate differing configurations, quantity changes, removal, totals and local persistence. Prices are recalculated from the loaded menu, not trusted from old stored totals.

The cart is an order summary, not an e-commerce payment or confirmed restaurant order. Delivery and other fees are not included in the displayed subtotal. Availability and final total must be confirmed with the restaurant. Nothing is sent automatically, and the cart is not cleared merely because a messaging window opens.

WhatsApp checkout is configured to the owner's explicitly requested number, `201040580225`. No branch number is used. It opens a prefilled draft for the visitor to review and send; it does not send automatically. The owner can change the number in the local editor and publish the JSON. Copy-order also works.


## Deploy on GitHub Pages

Upload the contents of this folder, not the enclosing folder and not `node_modules`. In repository Settings > Pages, select Deploy from a branch, branch `main`, folder `/ (root)`, then Save. The `.nojekyll` file is included. All assets and admin links work under a repository subpath.

The main menu uses a single index.html with category filters.

## Dependencies

The menu loads Foodics-hosted photos. The admin loads SheetJS Community Edition 0.18.5 from jsDelivr for Excel import/export. Excel functions need that CDN to be reachable.

## QA

24 automated checks passed during delivery, including exact spreadsheet comparison, category/search/offer browsing, configured add-ons and cart math, quantity and reload persistence, local editor login and bad-password rejection, add/edit/delete, JSON export, Excel import/export, isolation of local preview from the public menu, mobile overflow and no JavaScript runtime errors. Desktop and mobile pages, cart and editor were visually inspected.


Deployment packaging: CSS and JavaScript are inlined into each HTML page. Product photos use Foodics image URLs. The editor route is /admin.html. The GitHub repository contains index.html, admin.html, items.json and this README. The full offline source project and spreadsheets were also delivered separately.
