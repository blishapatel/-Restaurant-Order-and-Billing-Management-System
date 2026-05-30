# The Grand Table — Restaurant Order & Billing Management System

A full-stack restaurant management app for taking orders, kitchen workflow, cashier billing, admin analytics, and printable receipts. Built with **React (Vite)**, **Node.js / Express**, **MongoDB**, and **Chart.js**.

---

## Features

| Role | What they can do |
|------|------------------|
| **Admin** | Dashboard, **Analytics** (graphs), menu/categories/tables, staff, orders & bills history, all panels |
| **Waiter** | Select table, take orders, view serving staff info |
| **Kitchen** | View orders, mark as in-kitchen / served |
| **Cashier** | Bill served orders, **demo** payments (Card / UPI / Razorpay), print receipt |

Every panel includes a **Refresh** button to reload data without reloading the page.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [MongoDB](https://www.mongodb.com/) running locally **or** a MongoDB Atlas connection string

---

## Project structure

```
├── backend/          # Express API + MongoDB
│   ├── .env          # Your secrets (create from .env.example)
│   ├── server.js
│   └── seed.js       # Sample data & demo users
├── frontend/         # React + Vite UI
└── README.md
```

---

## Setup (first time)

### 1. Backend

```bash
cd backend
npm install
```

Copy environment file and edit it:

```bash
copy .env.example .env
```

On **Mac/Linux**:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/restaurant_db
JWT_SECRET=your_super_secret_jwt_key_change_this
```

Load sample menu, tables, and staff:

```bash
npm run seed
```

### 2. Frontend

```bash
cd frontend
npm install
```

---

## Running the application

Open **two terminals**.

**Terminal 1 — Backend API**

```bash
cd backend
npm run dev
```

Server runs at: `http://localhost:5000`

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

App opens at: `http://localhost:5173` (or next free port, e.g. `5174`)

> The frontend proxies `/api` to `http://localhost:5000` automatically.

---

## Demo login accounts (after seed)

| Role | Email | Password | Login role button |
|------|-------|----------|-------------------|
| Admin | admin@restaurant.com | admin123 | Admin |
| Waiter | waiter@restaurant.com | waiter123 | Waiter |
| Kitchen | kitchen@restaurant.com | kitchen123 | Kitchen |
| Cashier | cashier@restaurant.com | cashier123 | Cashier |

**Important:** On the login page, select the **same role** as the account, then enter email and password.

You can also **Register** new staff — details (name, email, phone, role) are saved in MongoDB and appear under **Admin → Staff** automatically.

---

## Data is stored permanently (MongoDB)

All important data is saved in the **MongoDB database**, not in the browser. You can close the website, shut down the computer, and open the app again later — everything will still be there.

| What you add | Where it is saved | Still there after restart? |
|--------------|-------------------|----------------------------|
| Menu items & categories | `MenuItem`, `Category` collections | Yes |
| Tables | `Table` collection | Yes |
| Staff (register or admin add) | `User` collection | Yes |
| Orders | `Order` collection | Yes |
| Paid bills (with **table number**) | `Bill` collection | Yes |

**Requirements for persistence:**

1. **MongoDB must be running** when you use the app (local or Atlas).
2. **Backend must be running** (`npm run dev` in `backend`) when you add or edit data.
3. **`npm run seed`** skips if data already exists (safe). Use **`npm run seed:fresh`** only when you want to wipe users/menu/tables and reload demo data (orders & bills are **not** deleted).

The frontend website alone does not store your business data — the **backend + MongoDB** does.

---

## Typical workflow

1. **Waiter** — Log in → pick a table → add menu items → place order.
2. **Kitchen** — Log in → open order → mark **In Kitchen** → then **Served**.
3. **Cashier** — Log in → select served order → choose payment (Cash / Card / UPI / Razorpay) → complete **demo** payment → **Print Bill** on success screen.
4. **Admin** — Dashboard → **Analytics** (revenue & popular items) → **Orders & Bills** (table numbers, full history) → manage menu/staff/tables.

---

## Demo payment methods (no real money)

All payments are **fake / educational only**. Nothing is charged to a real card, UPI, or Razorpay account. Details are saved on the bill in MongoDB for your project demo.

| Method | What happens |
|--------|----------------|
| **Cash** | Confirm dialog → bill saved with demo transaction ID |
| **Card** | Modal: card number, name, expiry, CVV (use demo `4111 1111 1111 1111`) → processing animation → success |
| **UPI** | Modal: fake QR + UPI ID (e.g. `demo@upi`) → processing → success |
| **Razorpay** | Modal styled like Razorpay checkout → fake order/payment IDs → success |

Receipt and **Orders & Bills** show payment method, transaction ID, last 4 digits (card), or UPI ID where applicable.

**No API keys** — no Razorpay SDK, no real gateway, no webhooks.

---

## Print bill (fixed blank page)

**Print Bill** opens a **separate print window** with only the receipt HTML (not the whole app). This fixes the blank white page issue.

- Allow **pop-ups** in the browser if print does nothing.
- Works from: Cashier after payment, **Orders & Bills → View / Print**, and any bill preview.
- Use **Print Bill** on the receipt, not the browser’s generic Print on the full page.

---

## Admin pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/admin/dashboard` | Today’s stats and recent orders |
| **Analytics** | `/admin/analytics` | Revenue trend, busiest days, top items, payment split |
| Menu | `/admin/menu` | Menu item CRUD |
| Categories | `/admin/categories` | Food categories |
| Tables | `/admin/tables` | Tables & QR codes |
| Staff | `/admin/staff` | Staff list and add/remove |
| Orders & Bills | `/admin/billing` | All paid bills (use **All dates** for history), **View** / **Print** receipt |

### Analytics includes

- **Revenue trend** — daily revenue (last 30 days)
- **Busiest days** — average revenue by weekday
- **Top selling items** — bar chart + top 5 list
- **Payment methods** — Cash / Card / UPI / Razorpay breakdown
- Summary cards: total revenue, orders, average order value, best seller

### Orders & Bills

- Default view: **All dates** (yesterday, today, and older paid bills).
- Use the date picker or **Today** to filter one day only.
- **View** — opens a popup with the full restaurant bill and **Print Bill** button.
- **Print** — opens the bill and sends it to the printer.
- **Table No.** is saved on every paid bill forever.

| Table No. | Bill No. | Order No. | Paid On | Waiter | Payment | Amount | View / Print |

---

## Refresh buttons

Available on: Dashboard, Analytics, Menu, Categories, Tables, Staff, Orders & Bills, Waiter, Kitchen, and Cashier panels.

---

## API scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend with nodemon (auto-restart) |
| `npm start` | Start backend (production) |
| `npm run seed` | Loads demo data **only if database is empty** (safe — does not wipe existing data) |
| `npm run seed:fresh` | **Wipes** users, menu, categories, tables and reloads demo staff/menu (keeps orders & bills) |

---

## Troubleshooting

### "Forbidden" or "Failed to load staff / bills / analytics"

- Log in as **Admin** and select the **Admin** role on login.
- **Restart the backend** after updates (`Ctrl+C`, then `npm run dev`).
- Clear browser Local Storage and log in again.

### "Failed to generate bill"

- Kitchen must mark the order **Served** first.
- Log in as **Cashier** or **Admin** (cashier panel) with the correct role selected.

### Cannot see yesterday's bills / orders

- Open **Orders & Bills** and click **All dates** (not only today's date).
- Bills are never removed when you close the browser — only filtered by date in the UI.
- Make sure MongoDB is still running. Avoid `npm run seed:fresh` unless you intend to reset menu/staff.

### Table number missing on very old bills

- New and future payments always save table number.
- Opening **All dates** may auto-fix older bills from order data when possible.

### New staff not showing in Staff list

- Click **Refresh** on the Staff page.
- Anyone who used **Register** on the login page is stored in the same `User` collection as admin-added staff.

### Menu or categories disappeared

- You may have run `npm run seed:fresh` — it resets menu and staff.
- Ensure MongoDB is running and backend was connected when you added items.

### Analytics shows no data

- Complete at least one payment in the Cashier panel.
- Open **Analytics** → click **Refresh**.

### Print shows blank page

- Click **Print Bill** on the receipt (not Ctrl+P on the whole page).
- Allow pop-ups for `localhost:5173`.
- Receipt opens in a new window, then the print dialog appears.

### MongoDB connection error

- Start MongoDB locally, or fix `MONGODB_URI` in `backend/.env`.

---

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS, Axios, React Router, Chart.js, react-chartjs-2
- **Backend:** Express, Mongoose, JWT, bcryptjs
- **Database:** MongoDB

---

## License

Educational / internship project.
