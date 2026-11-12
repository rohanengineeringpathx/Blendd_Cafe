# BLENDD — Smoothies & Good Mood

A responsive, GitHub-ready storefront concept for **BLENDD Smoothies**, inspired by the supplied brand board.

## Features
- Responsive landing page with BLENDD brand styling
- Menu cards with category filters
- Add-to-bag cart drawer, quantity handling and subtotal
- Customer login demo, delivery details and order tracking
- Admin demo for order status updates and delivery-partner assignment
- Story, brand promise and CTA sections
- Accessible navigation and mobile menu
- No framework or build step required

## Demo accounts and delivery panels
- Customer panel: enter any valid email and a non-empty password.
- Admin panel: `admin@blendd.demo` / `BlenddAdmin123`.
- Demo orders are saved in this browser's local storage and are not sent to a store.

**This is not production authentication or a real delivery service.** The demo admin credentials and role checks are visible in frontend code, and browser storage is not a secure database. Do not use real customer details or deploy this login for real accounts or orders. A production version needs server-side authentication, role authorization, and an order database.

## Run locally
Just open `index.html` in a browser, or use a local server:

```bash
python -m http.server 5500
```

Then visit `http://localhost:5500`.

## Deploy with GitHub Pages
1. Create a public GitHub repository named `blendd-smoothies-web`.
2. Upload the contents of this folder to the repository root.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then save.

Your website will be published at `https://YOUR-USERNAME.github.io/blendd-smoothies-web/`.

## Suggested repository structure

```text
blendd-smoothies-web/
├── assets/
│   └── blendd-laptop-promo.png
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Before launch
- Confirm final menu, ingredients, prices and allergen information.
- Connect production authentication, order storage and delivery operations before accepting real orders.
- Add your social links.
- Add your real store address, delivery areas and business hours.
- Replace emoji product art with approved product photography when available.
- Add privacy, terms and refund/delivery policies if collecting customer data or payments.

## Brand direction
- Deep green: `#173F26`
- Leaf green: `#245B35`
- Warm cream: `#F8F3E9`
- Coral: `#ED795E`
- Mango: `#F3B331`

*This is a front-end concept. It does not process payments, send orders to a store, or store orders on a server.*
