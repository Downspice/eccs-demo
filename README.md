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

`pnpm dev` reads `.env` and calls the Spring backend directly at `http://localhost:8080/api/eccs`. That file only holds the public API base URL, so it is committed. `.env.example` documents `NEXT_PUBLIC_API_URL` and `BACKEND_URL`.

## Docker

Production builds (`pnpm build`, and the image below) set `NEXT_PUBLIC_API_URL=/api/eccs` via `.env.production`. The browser then calls this app, and `app/api/eccs/[...path]/route.ts` forwards the request server-side to `BACKEND_URL` (default `http://host.docker.internal:8080`). The proxy drops `Origin`, `Referer`, and `Host` so the backend's CORS allow-list, which only includes localhost origins, accepts the call.

The backend is expected on port 8080 on the Docker host. Publish the app on port 3000:

```bash
docker build -t eccs-demo:latest .
docker run -d --name eccs-demo --restart unless-stopped --add-host=host.docker.internal:host-gateway -p 3000:3000 eccs-demo:latest
```

`--add-host=host.docker.internal:host-gateway` is required so the container can reach that host port. Pass `-e BACKEND_URL=<url>` to point the proxy at a different backend.

From a workstation, tunnel the published port and open the app locally:

```bash
ssh -L 3000:localhost:3000 root@<server> -p <ssh-port>
```

Then visit [http://localhost:3000](http://localhost:3000).

To run the production bundle on the host, point the proxy at a local backend:

```bash
pnpm build
BACKEND_URL=http://localhost:8080 pnpm start
```
