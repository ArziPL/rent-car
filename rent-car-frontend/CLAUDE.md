# rent-car-frontend

Next.js 16 frontend for the RentCar platform.

## Stack

| Tool | Purpose |
|---|---|
| Next.js 16 App Router | Routing, RSC, layouts, middleware |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Accessible component library (Button, Card, Badge, Dialog, Table…) |
| Zustand | Lightweight global auth state (`email`, `role`) |
| TanStack React Query | Server state — caching, loading/error, mutations |
| TypeScript | Full type safety; discriminated union for `Vehicle` |

## Build & Run

```bash
cd rent-car-frontend
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
```

Backend must be running on `http://localhost:8080` (via docker-compose or local).

## Auth Strategy

JWT token stored in an **httpOnly cookie** set by Next.js API proxy routes — never accessible to browser JavaScript.

```
Browser (React Query / form submit)
  └─► Next.js API Route  (/app/api/auth/login)
        └─► Spring :8080  POST /api/auth/login
              └─► returns { token, email, role }
        └─► sets  Set-Cookie: token=<jwt>; HttpOnly; SameSite=Lax
```

- `POST /api/auth/login` and `POST /api/auth/register` call Spring, set the cookie, return `{email, role}` to the client. Three cookies are written: `token` (httpOnly), `role` (non-httpOnly), `email` (non-httpOnly).
- `POST /api/auth/logout` clears all three cookies
- All authenticated Spring calls go through Next.js proxy routes (`app/api/_proxy.ts`) that read the httpOnly cookie server-side and inject `Authorization: Bearer <token>`
- **Zustand** stores `{ email, role }` for UI-level decisions (show/hide nav items, guard redirects). Hydrated server-side in the root layout, which reads the non-httpOnly `email` and `role` cookies.
- `GET /api/auth/me` reads `email` + `role` directly from cookies (no JWT decode needed)

## Request Flow

```
React Server Components (page-level data)
  └─► lib/api/server.ts → serverFetch<T>()  (reads cookies(), calls Spring directly)

Client Components (mutations, interactive data)
  └─► React Query hooks  (call /api/... proxy routes)
        └─► Next.js API routes  (app/api/_proxy.ts → proxyRequest())
              └─► reads httpOnly token cookie → injects Authorization header → Spring
```

## Folder Structure

```
rent-car-frontend/
├── app/
│   ├── layout.tsx                  ← root layout: reads email/role cookies, passes to <Providers>
│   ├── page.tsx                    ← redirect → /vehicles
│   │
│   ├── (auth)/                     ← no auth guard (uses root layout)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (user)/                     ← layout: Navbar + footer (no server-side guard; proxy.ts guards /reservations)
│   │   ├── layout.tsx
│   │   ├── vehicles/
│   │   │   ├── page.tsx            ← RSC: fetches cars+motorbikes in parallel, renders <VehicleGrid>
│   │   │   └── VehicleGrid.tsx     ← 'use client': filter/sort/search + inline booking dialog
│   │   └── reservations/
│   │       └── page.tsx            ← user's reservations (React Query list + cancel)
│   │
│   ├── (admin)/                    ← layout: AdminSidebar (no server-side guard; proxy.ts guards /admin/**)
│   │   ├── layout.tsx
│   │   └── admin/
│   │       ├── vehicles/
│   │       │   └── page.tsx        ← vehicle CRUD table
│   │       ├── reservations/
│   │       │   └── page.tsx        ← all reservations + status actions
│   │       └── report/
│   │           └── page.tsx        ← stats table + Download HTML button
│   │
│   └── api/                        ← Next.js proxy routes (cookie → Bearer header)
│       ├── _proxy.ts               ← shared helper: proxyRequest() reads httpOnly cookie, calls Spring
│       ├── auth/
│       │   ├── login/route.ts      ← sets token (httpOnly), role, email cookies; returns {email, role}
│       │   ├── register/route.ts
│       │   ├── logout/route.ts     ← clears all three cookies
│       │   └── me/route.ts         ← returns { email, role } read directly from cookies
│       ├── vehicles/
│       │   ├── route.ts            ← GET /api/vehicles (+ ?available=true)
│       │   ├── cars/
│       │   │   ├── route.ts        ← GET /api/vehicles/cars
│       │   │   └── [id]/route.ts
│       │   └── motorbikes/
│       │       ├── route.ts
│       │       └── [id]/route.ts
│       ├── reservations/
│       │   ├── route.ts            ← GET + POST
│       │   └── [id]/route.ts       ← DELETE (cancel)
│       └── admin/
│           ├── vehicles/
│           │   ├── cars/route.ts          ← POST (create)
│           │   ├── cars/[id]/route.ts     ← PUT (update)
│           │   ├── motorbikes/route.ts
│           │   ├── motorbikes/[id]/route.ts
│           │   └── [id]/route.ts          ← DELETE
│           ├── reservations/
│           │   ├── route.ts               ← GET all
│           │   └── [id]/status/route.ts   ← PUT status update
│           └── report/
│               └── vehicles/route.ts      ← GET /api/admin/report/vehicles
│
├── components/
│   ├── providers.tsx               ← 'use client': QueryClientProvider + Zustand hydration from server props
│   ├── ui/                         ← shadcn/ui generated components (do not edit manually)
│   ├── layout/
│   │   ├── Navbar.tsx              ← Logo | Vehicles | [My Reservations] | [Admin▾] | Login/Logout
│   │   └── AdminSidebar.tsx        ← Reservations | Vehicles | Report
│   ├── vehicles/
│   │   ├── VehicleCard.tsx         ← renders Car or Motorbike fields based on type discriminator
│   │   ├── VehicleFilters.tsx      ← search, type filter (ALL/CAR/MOTORBIKE), sort order
│   │   ├── VehicleImage.tsx        ← placeholder image: striped bg + lucide-react Car/Bike icon
│   │   ├── CarForm.tsx             ← create/edit car (admin)
│   │   └── MotorbikeForm.tsx       ← create/edit motorbike (admin)
│   └── reservations/
│       ├── ReservationCard.tsx
│       ├── ReservationForm.tsx     ← date range picker + live weekend-pricing preview (Dialog)
│       └── StatusBadge.tsx         ← colour-coded PENDING/CONFIRMED/COMPLETED/CANCELLED
│
├── lib/
│   ├── api/
│   │   ├── server.ts               ← serverFetch<T>(): reads cookies(), calls Spring directly (RSC only)
│   │   └── client.ts               ← clientFetch<T>(): calls /api/* proxy routes (client components)
│   ├── store/
│   │   └── auth.ts                 ← Zustand store: { email, role, setUser, logout }
│   └── utils.ts                    ← cn(), formatPrice(), formatDate()
│
├── hooks/
│   ├── useReservations.ts          ← React Query: list, create mutation, cancel mutation
│   └── useAdminData.ts             ← React Query: admin reservations, status mutation, vehicle CRUD mutations, report
│
├── types/
│   └── api.ts                      ← TypeScript types + request DTOs (see below)
│
└── proxy.ts                        ← Next.js middleware: cookie presence check + role redirect
```

## TypeScript Types (`types/api.ts`)

```ts
// Auth
interface AuthResponse { token: string; email: string; role: 'USER' | 'ADMIN' }
interface AuthUser { email: string; role: 'USER' | 'ADMIN' }

// Vehicles — discriminated union on `type`
interface VehicleBase {
  id: number; brand: string; model: string; year: number
  engineCc: number; pricePerDay: number; available: boolean; createdAt: string
}
interface Car extends VehicleBase {
  type: 'CAR'; numSeats: number; transmission: Transmission; fuelType: FuelType
  licenseCategory: null; motorbikeType: null; abs: null
}
interface Motorbike extends VehicleBase {
  type: 'MOTORBIKE'; licenseCategory: LicenseCategory; motorbikeType: MotorbikeType; abs: boolean
  numSeats: null; transmission: null; fuelType: null
}
type Vehicle = Car | Motorbike

// Lightweight list DTO from GET /api/vehicles
interface VehicleListItem {
  id: number; brand: string; model: string; year: number
  pricePerDay: number; available: boolean; type: 'CAR' | 'MOTORBIKE'
}

// Reservations
interface ReservationResponse {
  id: number; vehicleId: number; vehicleBrand: string; vehicleModel: string
  startDate: string; endDate: string; status: ReservationStatus; totalPrice: number; createdAt: string
}
interface AdminReservationResponse extends ReservationResponse { userId: number; userEmail: string }

// Report (GET /api/admin/report/vehicles)
interface VehicleReportResponse extends VehicleBase {
  type: 'CAR' | 'MOTORBIKE'
  numSeats: number | null; transmission: Transmission | null; fuelType: FuelType | null
  licenseCategory: LicenseCategory | null; motorbikeType: MotorbikeType | null; abs: boolean | null
  reservationCount: number; totalRevenue: number; weekdayDays: number; weekendDays: number
}

// Request DTOs (used by admin forms + mutation hooks)
interface CarRequest { brand; model; year; engineCc; pricePerDay; numSeats; transmission; fuelType; available? }
interface MotorbikeRequest { brand; model; year; engineCc; pricePerDay; licenseCategory; motorbikeType; abs; available? }
interface ReservationRequest { vehicleId: number; startDate: string; endDate: string }
interface UpdateReservationStatusRequest { status: ReservationStatus }

// Enums
type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
type Transmission = 'MANUAL' | 'AUTOMATIC'
type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID'
type LicenseCategory = 'A' | 'A1' | 'A2'
type MotorbikeType = 'SPORT' | 'NAKED' | 'CRUISER' | 'SCOOTER'
```

## Route Protection (`proxy.ts`)

`proxy.ts` is the Next.js middleware file (exports `proxy` function + `config.matcher`). It runs before render on matched routes.

| Route pattern (matcher) | Rule |
|---|---|
| `/login`, `/register` | Redirect → `/vehicles` if `token` cookie present |
| `/reservations/**` | Redirect → `/login?from=<path>` if no `token` cookie |
| `/admin/**` | Redirect → `/vehicles` if no `token` cookie **or** `role` ≠ `ADMIN` |
| `/vehicles/**` | No guard — public, always accessible |

Cookies read: `token` (httpOnly, presence-only check) and `role` (non-httpOnly, value check). No JWT decode in middleware.

## Pages & UX

### Guest (`/vehicles`)
- Vehicle grid: each card shows brand, model, year, price/day, available badge, type badge (CAR/MOTORBIKE)
- Car cards additionally show: seats, transmission, fuel type
- Motorbike cards additionally show: license category, motorbike type, ABS
- Navbar: Logo | Vehicles | Login | Register

### User
- `/vehicles` — same grid + **Book** button on each available vehicle; clicking Book opens a `ReservationForm` dialog inline (no separate detail page yet)
- `/reservations` — table/cards with status badges; **Cancel** button on PENDING only

### Admin (left sidebar: Reservations | Vehicles | Report)
- `/admin/reservations` — table: user email, vehicle, dates, total price, status; action buttons per row (CONFIRM / CANCEL etc.)
- `/admin/vehicles` — table with Edit / Delete per row; **Add Car** and **Add Motorbike** buttons open dialogs
- `/admin/report` — stats table (one row per vehicle) + **Download HTML** button

## Report HTML Download

Client-side generation — no extra dependencies:

```ts
const html = buildReportHtml(data: VehicleReportResponse[])  // styled HTML string
const blob = new Blob([html], { type: 'text/html' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url; a.download = 'rentcar-report.html'; a.click()
URL.revokeObjectURL(url)
```

The HTML template mirrors the on-screen table with a print-friendly stylesheet.

## Conventions

- All client components that use hooks must have `'use client'` at the top
- Page-level data fetching uses RSC + `lib/api/server.ts`; mutations use React Query + proxy routes
- Use `cn()` from `lib/utils.ts` for conditional Tailwind class merging (re-exported from shadcn)
- shadcn/ui components live in `components/ui/` — never edit them manually; re-run `npx shadcn@latest add <component>` to regenerate
- Always narrow `Vehicle` type with `vehicle.type === 'CAR'` before accessing car-specific fields
- Date fields from Spring come as `"YYYY-MM-DD"` strings (LocalDate) or `"YYYY-MM-DDTHH:mm:ss"` (LocalDateTime) — parse with `new Date()` or a date lib as needed

## Implementation Status

- [x] Project scaffolding (Next.js 16, Tailwind CSS v3, shadcn/ui primitives, Zustand, React Query, standalone Docker output)
- [x] TypeScript types + request DTOs (`types/api.ts`)
- [x] Shared proxy helper (`app/api/_proxy.ts` — `proxyRequest()`)
- [x] `Providers` component (`components/providers.tsx` — QueryClientProvider + Zustand hydration)
- [x] Auth proxy routes (login, register, logout, me) — sets httpOnly `token` + non-httpOnly `role`/`email` cookies
- [x] Route protection (`proxy.ts` — guards `/reservations/**` and `/admin/**`)
- [x] Zustand auth store (`lib/store/auth.ts`) + server-side hydration via root layout → `<Providers>`
- [x] Navbar (sticky dark, guest/user/admin views) + AdminSidebar layout components
- [x] Vehicle listing page (`/vehicles`) — RSC + `VehicleGrid` (client): filter/sort/search, inline booking dialog
- [x] Vehicle booking dialog (`ReservationForm`) — date range picker + live weekend-pricing preview
- [x] User reservations page (`/reservations`) — React Query list + cancel
- [x] Admin reservations page (`/admin/reservations`) — stat strip + table + status actions
- [x] Admin vehicle CRUD page (`/admin/vehicles`) — table + CarForm/MotorbikeForm dialogs
- [x] Admin report page + HTML download (`/admin/report`) — KPIs, top-5 table, Blob download
- [ ] Vehicle detail page (`/vehicles/[id]`) — RSC detail + inline reservation form (not yet implemented)

## Notes

- Vehicle listing (`/vehicles`) fetches from `/api/vehicles/cars` + `/api/vehicles/motorbikes` in parallel (not the lightweight `/api/vehicles`) to get full typed DTOs including the `type` discriminator field
- `VehicleGrid.tsx` is a client component co-located under `app/(user)/vehicles/` — client state (filters, sort, booking dialog) lives there; the parent `page.tsx` is an RSC that fetches and passes `initialVehicles`
- `components/providers.tsx` wraps the app with `QueryClientProvider` and hydrates Zustand from `initialEmail`/`initialRole` props passed by the server root layout
- `app/api/_proxy.ts` exports `proxyRequest()` — all proxy route handlers call this helper instead of duplicating fetch logic
- `proxy.ts` guards only `/reservations/**` and `/admin/**`; `/vehicles/**` is public even for guests
- Weekend pricing preview in the booking dialog uses the same formula as the backend: weekdays×price + weekends×price×1.5
- `next.config.ts` sets `output: "standalone"` — required for the Docker image (`.next/standalone/`)
- Report HTML download is client-side (Blob) — no extra dependencies
- `BACKEND_URL` env var is only needed server-side (proxy routes + `serverFetch`); never exposed to the browser
