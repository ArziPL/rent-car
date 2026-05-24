# rent-car-frontend

Next.js 15 frontend for the RentCar platform.

## Stack

| Tool | Purpose |
|---|---|
| Next.js 15 App Router | Routing, RSC, layouts, middleware |
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

- `POST /app/api/auth/login` and `POST /app/api/auth/register` call Spring, set the cookie, return `{email, role}` to the client
- `POST /app/api/auth/logout` clears the cookie
- All authenticated Spring calls go through Next.js proxy routes that read the cookie server-side and inject `Authorization: Bearer <token>`
- **Zustand** stores `{ email, role }` for UI-level decisions (show/hide nav items, guard redirects). Populated on app load from a lightweight `/app/api/auth/me` route that decodes the cookie.

## Request Flow

```
React Server Components (page-level data)
  └─► lib/api/server.ts  (reads cookies(), calls Spring directly server-to-server)

Client Components (mutations, interactive data)
  └─► React Query hooks  (call /app/api/... proxy routes)
        └─► Next.js API routes  (read cookie → Authorization header → Spring)
```

## Folder Structure

```
rent-car-frontend/
├── app/
│   ├── layout.tsx                  ← root layout + QueryClientProvider + Zustand hydration
│   ├── page.tsx                    ← redirect → /vehicles
│   │
│   ├── (auth)/                     ← no auth guard
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (user)/                     ← layout redirects guests → /login
│   │   ├── layout.tsx
│   │   ├── vehicles/
│   │   │   ├── page.tsx            ← RSC: vehicle grid (cars + motorbikes)
│   │   │   └── [id]/page.tsx       ← RSC: detail + client reservation form
│   │   └── reservations/
│   │       └── page.tsx            ← user's reservations (RSC list + client cancel)
│   │
│   ├── (admin)/                    ← layout redirects non-admins → /
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
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts         ← returns { email, role } from cookie
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
│           │   ├── cars/route.ts          ← POST (create) + PUT (update)
│           │   ├── cars/[id]/route.ts
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
│   ├── ui/                         ← shadcn/ui generated components (do not edit manually)
│   ├── layout/
│   │   ├── Navbar.tsx              ← Logo | Vehicles | [My Reservations] | [Admin▾] | Login/Logout
│   │   └── AdminSidebar.tsx        ← Reservations | Vehicles | Report
│   ├── vehicles/
│   │   ├── VehicleCard.tsx         ← renders Car or Motorbike fields based on type discriminator
│   │   ├── VehicleFilters.tsx      ← available toggle, type filter
│   │   ├── CarForm.tsx             ← create/edit car (admin)
│   │   └── MotorbikeForm.tsx       ← create/edit motorbike (admin)
│   └── reservations/
│       ├── ReservationCard.tsx
│       ├── ReservationForm.tsx     ← date range picker + live price preview
│       └── StatusBadge.tsx         ← colour-coded PENDING/CONFIRMED/COMPLETED/CANCELLED
│
├── lib/
│   ├── api/
│   │   ├── server.ts               ← server-side fetch helper: reads cookies(), calls Spring directly
│   │   └── client.ts               ← client-side fetch wrapper: calls /app/api/* proxy routes
│   ├── store/
│   │   └── auth.ts                 ← Zustand store: { email, role, setUser, logout }
│   └── utils.ts                    ← cn(), formatPrice(), formatDate()
│
├── hooks/
│   ├── useReservations.ts          ← React Query: list, create mutation, cancel mutation
│   └── useAdminData.ts             ← React Query: admin reservation list, status mutation, vehicle mutations
│
├── types/
│   └── api.ts                      ← TypeScript types (see below)
│
└── middleware.ts                   ← cookie presence check + role redirect before render
```

## TypeScript Types (`types/api.ts`)

```ts
// Auth
interface AuthResponse { token: string; email: string; role: 'USER' | 'ADMIN' }

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

// Enums
type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
type Transmission = 'MANUAL' | 'AUTOMATIC'
type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID'
type LicenseCategory = 'A' | 'A1' | 'A2'
type MotorbikeType = 'SPORT' | 'NAKED' | 'CRUISER' | 'SCOOTER'
```

## Route Protection (middleware.ts)

| Route pattern | Rule |
|---|---|
| `/login`, `/register` | Redirect to `/vehicles` if already authenticated |
| `/(user)/**` | Redirect to `/login` if no token cookie |
| `/(admin)/**` | Redirect to `/` if role ≠ `ADMIN` |
| `/vehicles/**` (public) | Always accessible |

Role is read from a `role` cookie (non-httpOnly, set alongside the token cookie) so middleware can read it without decoding the JWT.

## Pages & UX

### Guest (`/vehicles`)
- Vehicle grid: each card shows brand, model, year, price/day, available badge, type badge (CAR/MOTORBIKE)
- Car cards additionally show: seats, transmission, fuel type
- Motorbike cards additionally show: license category, motorbike type, ABS
- Navbar: Logo | Vehicles | Login | Register

### User
- `/vehicles` — same grid + **Book** button on each available vehicle
- `/vehicles/[id]` — detail page + reservation form (date range picker, live price preview using weekend pricing logic)
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

- [x] Project scaffolding (Next.js 16, Tailwind CSS v3, shadcn/ui primitives, Zustand, React Query)
- [x] TypeScript types (`types/api.ts`)
- [x] Auth proxy routes (login, register, logout, me) — sets httpOnly + role/email cookies
- [x] Route protection (`proxy.ts` — Next.js 16 renamed middleware → proxy)
- [x] Zustand auth store + server-side hydration in root layout (reads email/role cookies)
- [x] Navbar (sticky dark, guest/user/admin views) + AdminSidebar layout components
- [x] Public vehicle listing page (`/vehicles`) — RSC fetches cars+motorbikes in parallel, client-side filter/sort
- [x] Vehicle booking dialog (`ReservationForm`) — date range picker + weekend pricing preview
- [x] User reservations page (`/reservations`) — React Query + tab filter + cancel
- [x] Admin reservations page (`/admin/reservations`) — stat strip + table + status actions
- [x] Admin vehicle CRUD page (`/admin/vehicles`) — table + CarForm/MotorbikeForm dialogs
- [x] Admin report page + HTML download (`/admin/report`) — KPIs, top-5 chart, full stats table
- [ ] Vehicle detail page (`/vehicles/[id]`) — RSC detail + inline reservation form (not yet implemented)

## Notes

- Vehicle listing fetches from `/api/vehicles/cars` + `/api/vehicles/motorbikes` in parallel (not the lightweight `/api/vehicles`) to get full spec data for the card grid
- `proxy.ts` (Next.js 16 route protection) reads the non-httpOnly `role` and `email` cookies; the JWT lives only in the httpOnly `token` cookie
- Weekend pricing preview in the booking dialog uses the same formula as the backend: weekdays×price + weekends×price×1.5
- Report HTML download is client-side (Blob) — no extra dependencies
