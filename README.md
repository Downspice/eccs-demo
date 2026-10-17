# ECCS Demo

Enterprise Cargo & Commerce System (ECCS) application built with Next.js, Tailwind CSS, and the AlignUI Design System.

## Architecture & Routes

### Main Application
- **ECCS Platform Dashboard**: [`/`](http://localhost:3000) — Core operations console and service status.

### Stock Template Application (Relocated)
The original template demo components, widgets, and pages have been preserved under the `/stock-app` route:
- **Stock Dashboard**: [`/stock-app`](http://localhost:3000/stock-app)
- **Analytics**: [`/stock-app/analytics`](http://localhost:3000/stock-app/analytics)
- **Products**: [`/stock-app/products`](http://localhost:3000/stock-app/products)
- **Orders**: [`/stock-app/orders`](http://localhost:3000/stock-app/orders)
- **Add Product Flow**: [`/add-product`](http://localhost:3000/add-product)

*Note: Legacy routes (`/analytics`, `/products`, `/orders`) automatically redirect to their respective `/stock-app/...` destinations.*

## Getting Started

First, install dependencies:

```bash
pnpm i
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
