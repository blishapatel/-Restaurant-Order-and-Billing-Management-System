# The Grand Table — Restaurant Order & Billing Management System

A full-stack restaurant management app for taking orders, kitchen workflow, cashier billing, admin analytics, and printable receipts. Built with **React (Vite)**, **Node.js / Express**, **MongoDB**, and **Chart.js**.

---

## Features

| Role | What they can do |
|------|------------------|
| **Admin** | Dashboard, **Analytics** (graphs), menu/categories/tables, staff, orders & bills history, all panels |
| **Waiter** | Select table, take orders, view serving staff info |
| **Kitchen** | View orders, mark as in-kitchen / served |
| **Cashier** | Bill served orders, print receipt, confirm payment |

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
3. Do **not** run `npm run seed` unless you want to **erase all data** and start fresh with demo items only.

The frontend website alone does not store your business data — the **backend + MongoDB** does.

---

## Typical workflow

1. **Waiter** — Log in → pick a table → add menu items → place order.
2. **Kitchen** — Log in → open order → mark **In Kitchen** → then **Served**.
3. **Cashier** — Log in → select served order → generate bill → **Print Bill** → confirm payment.
4. **Admin** — Dashboard → **Analytics** (revenue & popular items) → **Orders & Bills** (table numbers, full history) → manage menu/staff/tables.

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
- **Payment methods** — Cash / Card / UPI breakdown
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
| `npm run seed` | **Deletes all data** and loads demo menu/tables/staff (use only for first setup) |

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
- Make sure MongoDB is still running and you did not run `npm run seed` (that wipes the database).

### Table number missing on very old bills

- New and future payments always save table number.
- Opening **All dates** may auto-fix older bills from order data when possible.

### New staff not showing in Staff list

- Click **Refresh** on the Staff page.
- Anyone who used **Register** on the login page is stored in the same `User` collection as admin-added staff.

### Menu or categories disappeared

- You may have run `npm run seed` — it deletes everything.
- Ensure MongoDB is running and backend was connected when you added items.

### Analytics shows no data

- Complete at least one payment in the Cashier panel.
- Open **Analytics** → click **Refresh**.

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
