# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TaiLoy - Sistema de Ventas** is a static front-end-only point-of-sale web app for a stationery/school supplies store. No build tools, no framework, no package manager — just HTML, CSS, and vanilla JavaScript.

## Running the App

Open any HTML file directly in a browser (no server required):

- `index.html` — Login page (entry point)
- `home.html` — Point of Sale (Punto de Venta)
- `inventario.html` — Inventory view

For local development with live reload, any static file server works:
```bash
npx serve .
# or
python -m http.server 8080
```

## Architecture

### File responsibilities

| File | Role |
|---|---|
| `js/data.js` | Static data: `PRODUCTOS` array and `USUARIOS` array. Loaded first on every page. |
| `js/app.js` | All application logic: auth, navbar, cart, sales, inventory. |
| `css/styles.css` | Single stylesheet for all pages. Brand color: `#c8102e`. |

### Page initialization pattern

Each HTML page loads `data.js` then `app.js`, then calls a page-specific init function inline:

- `index.html` → `initLogin()`
- `home.html` → `initVentas()`
- `inventario.html` → `initInventario()`

`initVentas()` and `initInventario()` both call `requireAuth()` (redirects to `index.html` if no session) and `initNavbar()`.

### State & persistence

- **Session**: Logged-in user is stored in `sessionStorage` as JSON (`"usuario"` key). Cleared on logout.
- **Cart**: Module-level `carrito` array in `app.js` — resets on page navigation.
- **Stock**: Mutations to `PRODUCTOS[].stock` in `procesarVenta()` are in-memory only — stock resets on page refresh.
- There is no backend or localStorage persistence.

### Credentials (dev only)

Defined in `js/data.js` in the `USUARIOS` array:
- `admin` / `admin123`
- `vendedor` / `venta123`
